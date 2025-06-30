import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { 
  users, 
  teams, 
  documents, 
  usageMetrics, 
  activityLogs,
  teamMembers 
} from '@/lib/db/schema';
import { eq, count, sql, desc, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current month start date
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    // Fetch all statistics in parallel
    const [
      totalUsersResult,
      totalTeamsResult,
      totalDocumentsResult,
      totalQueriesResult,
      queriesThisMonthResult,
      activeSubscriptionsResult,
      documentsProcessedResult,
      storageUsedResult,
      recentActivityResult,
      topUsersResult,
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),
      
      // Total teams
      db.select({ count: count() }).from(teams),
      
      // Total documents
      db.select({ count: count() }).from(documents),
      
      // Total queries (all time)
      db.select({ 
        count: count() 
      }).from(usageMetrics).where(eq(usageMetrics.type, 'query')),
      
      // Queries this month
      db.select({ 
        count: count() 
      }).from(usageMetrics)
       .where(sql`${usageMetrics.type} = 'query' AND ${usageMetrics.date} >= ${currentMonth}`),
      
      // Active subscriptions (teams with active plans)
      db.select({ 
        count: count() 
      }).from(teams).where(sql`${teams.plan} != 'free'`),
      
      // Documents processed
      db.select({ 
        count: count() 
      }).from(documents).where(eq(documents.isProcessed, true)),
      
      // Storage used (sum of document sizes)
      db.select({ 
        total: sql<number>`COALESCE(SUM(${documents.size}), 0)` 
      }).from(documents),
      
      // Recent activity (last 10 activities)
      db.select({
        id: activityLogs.id,
        action: activityLogs.action,
        resource: activityLogs.resource,
        createdAt: activityLogs.createdAt,
        userEmail: users.email,
        userName: users.name,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .orderBy(desc(activityLogs.createdAt))
      .limit(10),
      
      // Top users by query count this month
      db.select({
        userId: usageMetrics.userId,
        queryCount: count(),
        userEmail: users.email,
        userName: users.name,
        teamPlan: teams.plan,
      })
      .from(usageMetrics)
      .leftJoin(users, eq(usageMetrics.userId, users.id))
      .leftJoin(teams, eq(usageMetrics.teamId, teams.id))
      .where(sql`${usageMetrics.type} = 'query' AND ${usageMetrics.date} >= ${currentMonth}`)
      .groupBy(usageMetrics.userId, users.email, users.name, teams.plan)
      .orderBy(desc(count()))
      .limit(10),
    ]);

    // Calculate revenue (simplified - in real app, get from Stripe)
    const monthlyRevenue = (activeSubscriptionsResult[0]?.count || 0) * 29; // Assuming average plan price

    // Calculate error rate (simplified)
    const errorRate = Math.random() * 2; // In real app, get from monitoring system

    // System health check (simplified)
    const systemHealth = {
      database: 'healthy' as const,
      storage: totalDocumentsResult[0]?.count > 1000 ? 'warning' as const : 'healthy' as const,
      ai: errorRate > 5 ? 'error' as const : errorRate > 2 ? 'warning' as const : 'healthy' as const,
      payments: 'healthy' as const,
    };

    // Format recent activity
    const recentActivity = recentActivityResult.map(activity => ({
      id: activity.id,
      action: activity.action,
      user: activity.userName || activity.userEmail || 'System',
      timestamp: activity.createdAt.toISOString(),
      details: activity.resource || '',
    }));

    // Format top users
    const topUsers = topUsersResult.map(user => ({
      name: user.userName || 'Unknown',
      email: user.userEmail || 'unknown@example.com',
      queries: user.queryCount,
      plan: user.teamPlan || 'free',
    }));

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalTeams: totalTeamsResult[0]?.count || 0,
      totalDocuments: totalDocumentsResult[0]?.count || 0,
      totalQueries: totalQueriesResult[0]?.count || 0,
      queriesThisMonth: queriesThisMonthResult[0]?.count || 0,
      activeSubscriptions: activeSubscriptionsResult[0]?.count || 0,
      monthlyRevenue,
      storageUsed: Math.floor((storageUsedResult[0]?.total || 0) / 1024 / 1024), // Convert to MB
      documentsProcessed: documentsProcessedResult[0]?.count || 0,
      errorRate,
      recentActivity,
      topUsers,
      systemHealth,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}