import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { FileText, CheckCircle, DollarSign, Clock, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const profile = useAuthStore((state) => state.profile);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalEstimates: 0,
    draftEstimates: 0,
    totalBudgetCommitted: 0,
    totalSpent: 0,
    projectsByStatus: {} as Record<string, number>,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        // Get projects
        const { data: projects } = await supabase
          .from('projects')
          .select('id, status, budget:contract_amount')
          .eq('organization_id', profile.organization_id);

        // Get estimates
        const { data: estimates } = await supabase
          .from('estimates')
          .select('id, status, total_amount')
          .eq('organization_id', profile.organization_id);

        const projectsList = (projects || []) as any[];
        const estimatesList = (estimates || []) as any[];

        // Calculate stats
        const totalBudget = projectsList.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalCost = estimatesList.reduce((sum, e) => sum + (e.total_amount || 0), 0);

        const statusCounts: Record<string, number> = {};
        projectsList.forEach((p: any) => {
          statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        });

        setStats({
          totalProjects: projectsList.length,
          activeProjects: projectsList.filter((p: any) => p.status === 'active').length,
          totalEstimates: estimatesList.length,
          draftEstimates: estimatesList.filter((e: any) => e.status === 'draft').length,
          totalBudgetCommitted: totalBudget,
          totalSpent: totalCost,
          projectsByStatus: statusCounts,
        });
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [profile?.organization_id]);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Estimates',
      value: stats.totalEstimates,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Draft Estimates',
      value: stats.draftEstimates,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'Total Budget',
      value: `₱${(stats.totalBudgetCommitted / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Committed Cost',
      value: `₱${(stats.totalSpent / 1000000).toFixed(2)}M`,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Portfolio KPIs and project performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
          <CardDescription>Breakdown of projects by current status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : Object.keys(stats.projectsByStatus).length === 0 ? (
            <p className="text-muted-foreground">No projects yet. Create your first project to see analytics.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.projectsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: status === 'active' ? '#22c55e' : status === 'completed' ? '#3b82f6' : status === 'planning' ? '#f59e0b' : '#ef4444'
                    }} />
                    <span className="capitalize text-sm font-medium">{status}</span>
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Budget vs. Cost</CardTitle>
          <CardDescription>Total budget allocated vs. cost committed in estimates</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Budget Utilization</span>
                  <span className="font-semibold">
                    {stats.totalBudgetCommitted > 0
                      ? `${((stats.totalSpent / stats.totalBudgetCommitted) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((stats.totalSpent / stats.totalBudgetCommitted) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Budget</p>
                  <p className="text-lg font-bold">₱{(stats.totalBudgetCommitted / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Committed Cost</p>
                  <p className="text-lg font-bold">₱{(stats.totalSpent / 1000000).toFixed(2)}M</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
