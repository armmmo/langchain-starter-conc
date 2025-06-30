'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Settings, 
  Upload,
  Users,
  Zap,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalDocuments: number;
  totalQueries: number;
  queriesThisMonth: number;
  planType: string;
  queryLimit: number;
  documentsLimit: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchDashboardStats();
  }, [session, status, router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Badge className="bg-blue-500"><Zap className="w-3 h-3 mr-1" />Pro</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-500"><Crown className="w-3 h-3 mr-1" />Enterprise</Badge>;
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  const calculateUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session.user.name || session.user.email}
            </h1>
            <p className="text-gray-600 mt-2">
              Here&apos;s what&apos;s happening with your AI assistant today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {stats && getPlanBadge(stats.planType)}
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.documentsLimit === -1 
                  ? 'Unlimited' 
                  : `${stats.documentsLimit - stats.totalDocuments} remaining`
                }
              </p>
              {stats.documentsLimit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${calculateUsagePercentage(stats.totalDocuments, stats.documentsLimit)}%` }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queriesThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                {stats.queryLimit === -1 
                  ? 'Unlimited queries' 
                  : `${stats.queryLimit - stats.queriesThisMonth} remaining`
                }
              </p>
              {stats.queryLimit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${calculateUsagePercentage(stats.queriesThisMonth, stats.queryLimit)}%` }}
                  ></div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQueries}</div>
              <p className="text-xs text-muted-foreground">
                All time usage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.user.teams?.length || 1}</div>
              <p className="text-xs text-muted-foreground">
                Active teams
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/chat">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Start Chatting</CardTitle>
              <CardDescription>
                Ask questions about your documents or have a general conversation with AI.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/documents">
            <CardHeader>
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Manage Documents</CardTitle>
              <CardDescription>
                View, upload, and organize your document library for AI-powered search.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        {session.user.role === 'admin' && (
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin/documents">
              <CardHeader>
                <Upload className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Admin Upload</CardTitle>
                <CardDescription>
                  Upload documents for all users and manage the knowledge base.
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        )}

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/analytics">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>View Analytics</CardTitle>
              <CardDescription>
                Track your usage patterns and get insights into your AI interactions.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/dashboard/settings">
            <CardHeader>
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and team settings.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/pricing">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-600 mb-2" />
              <CardTitle>Upgrade Plan</CardTitle>
              <CardDescription>
                Get more features and higher limits with our Pro and Enterprise plans.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Usage Warnings */}
      {stats && (
        <div className="space-y-4">
          {stats.queryLimit !== -1 && calculateUsagePercentage(stats.queriesThisMonth, stats.queryLimit) > 80 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-800">
                    You&apos;re approaching your monthly query limit
                  </span>
                </div>
                <p className="text-orange-700 mt-2">
                  You&apos;ve used {stats.queriesThisMonth} of {stats.queryLimit} queries this month. 
                  Consider upgrading to a higher plan for unlimited usage.
                </p>
                <Link href="/pricing" className="mt-3 inline-block">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {stats.documentsLimit !== -1 && calculateUsagePercentage(stats.totalDocuments, stats.documentsLimit) > 80 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    You&apos;re approaching your document limit
                  </span>
                </div>
                <p className="text-blue-700 mt-2">
                  You have {stats.totalDocuments} of {stats.documentsLimit} documents uploaded. 
                  Upgrade to store more documents.
                </p>
                <Link href="/pricing" className="mt-3 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}