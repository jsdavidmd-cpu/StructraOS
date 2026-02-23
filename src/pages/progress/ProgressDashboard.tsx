import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { progressService, ProgressStats, BOQProgressItem } from '@/services/progressService';
import { formatCurrency } from '@/lib/currency';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressDashboardProps {
  projectId: string;
  estimateId: string;
}

export default function ProgressDashboard({ projectId, estimateId }: ProgressDashboardProps) {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [boqProgress, setBOQProgress] = useState<BOQProgressItem[]>([]);
  const [sCurveData, setSCurveData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId && estimateId) {
      loadDashboardData();
    }
  }, [projectId, estimateId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsData = await progressService.getProgressStats(projectId, estimateId);
      setStats(statsData);

      // Load BOQ progress
      const boqData = await progressService.getBOQProgress(projectId, estimateId);
      setBOQProgress(boqData);

      // Load S-curve data
      const { planned, actual } = await progressService.getSCurveData(projectId, estimateId);
      
      // Merge planned and actual for chart
      const mergedData: any[] = [];
      const allDates = new Set([...planned.map(p => p.date), ...actual.map(a => a.date)]);
      
      Array.from(allDates).sort().forEach(date => {
        const plannedPoint = planned.find(p => p.date === date);
        const actualPoint = actual.find(a => a.date === date);
        
        mergedData.push({
          date,
          planned: plannedPoint?.percent || 0,
          actual: actualPoint?.percent || 0,
        });
      });

      setSCurveData(mergedData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading progress data...</div>;
  }

  if (!estimateId) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p>No estimate found for this project.</p>
          <p className="text-sm mt-2">Create an estimate with BOQ items to start tracking progress.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.overall_percent.toFixed(1)}%</div>
            <div className="w-full bg-secondary h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${Math.min(100, stats?.overall_percent || 0)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cost Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.cost_earned || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {formatCurrency(stats?.cost_planned || 0)} planned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Schedule Variance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {(stats?.schedule_variance || 0) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div
                className={`text-2xl font-bold ${
                  (stats?.schedule_variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stats?.schedule_variance.toFixed(1)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats?.schedule_variance || 0) >= 0 ? 'Ahead of schedule' : 'Behind schedule'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">BOQ Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span className="font-medium text-green-600">{stats?.items_completed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress:</span>
                <span className="font-medium text-blue-600">{stats?.items_in_progress || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Not Started:</span>
                <span className="font-medium">{stats?.items_not_started || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* S-Curve Chart */}
      <Card>
        <CardHeader>
          <CardTitle>S-Curve: Planned vs Actual</CardTitle>
          <CardDescription>Cumulative progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          {sCurveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sCurveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="planned" stroke="#8884d8" name="Planned" />
                <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No progress data yet. Start recording daily progress to see the S-curve.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOQ Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>BOQ Progress Breakdown</CardTitle>
          <CardDescription>Progress by work item</CardDescription>
        </CardHeader>
        <CardContent>
          {boqProgress.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No BOQ items found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Item</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-right py-2 px-2">Planned Qty</th>
                    <th className="text-right py-2 px-2">Actual Qty</th>
                    <th className="text-right py-2 px-2">%</th>
                    <th className="text-right py-2 px-2">Amount Earned</th>
                    <th className="text-center py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {boqProgress.map((item) => (
                    <tr key={item.boq_item_id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{item.item_number}</td>
                      <td className="py-2 px-2">
                        <div className="text-xs text-muted-foreground mb-1">{item.trade}</div>
                        <div>{item.description}</div>
                      </td>
                      <td className="py-2 px-2 text-right">
                        {item.qty_planned.toFixed(2)} {item.unit}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {item.qty_to_date.toFixed(2)} {item.unit}
                      </td>
                      <td className="py-2 px-2 text-right font-medium">
                        {item.percent_complete.toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 text-right">{formatCurrency(item.amount_earned)}</td>
                      <td className="py-2 px-2 text-center">
                        {item.percent_complete >= 100 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                        ) : item.percent_complete > 0 ? (
                          <div className="text-blue-600 text-xs">In Progress</div>
                        ) : (
                          <div className="text-muted-foreground text-xs">Not Started</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
