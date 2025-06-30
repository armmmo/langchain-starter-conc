import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, documents, chatSessions, usage, subscriptions } from '@/lib/db/schema';
import { count, eq, sql, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get basic counts
    const [
      totalUsers,
      totalDocuments, 
      totalSessions,
      activeSubscriptions
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(documents),
      db.select({ count: count() }).from(chatSessions),
      db.select({ count: count() }).from(subscriptions).where(eq(subscriptions.status, 'active'))
    ]);

    // Get usage stats for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyQueries = await db
      .select({ count: count() })
      .from(usage)
      .where(sql`${usage.type} = 'query' AND ${usage.date} >= ${currentMonth}`);

    // Get revenue from subscriptions (mock data since we'd need Stripe integration)
    const totalRevenue = activeSubscriptions[0].count * 29; // Assuming $29/month average

    // Get recent activity (last 10 users)
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        role: users.role
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    // Get top users by document count
    const topUsers = await db
      .select({
        userId: documents.userId,
        userName: users.name,
        userEmail: users.email,
        documentCount: count()
      })
      .from(documents)
      .innerJoin(users, eq(documents.userId, users.id))
      .groupBy(documents.userId, users.name, users.email)
      .orderBy(desc(count()))
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers[0].count,
        totalDocuments: totalDocuments[0].count,
        totalSessions: totalSessions[0].count,
        monthlyQueries: monthlyQueries[0].count,
        activeSubscriptions: activeSubscriptions[0].count,
        totalRevenue: totalRevenue
      },
      recentUsers,
      topUsers
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}