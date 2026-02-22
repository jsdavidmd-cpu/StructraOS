import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Calendar, TrendingUp, DollarSign, Package } from 'lucide-react';

const stats = [
  {
    icon: FileText,
    label: 'Active Estimates',
    value: '12',
    change: '+2 this week',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Users,
    label: 'Workers Active',
    value: '48',
    change: '8 crews deployed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: Calendar,
    label: 'Active Projects',
    value: '5',
    change: '2 on schedule',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    icon: TrendingUp,
    label: 'Progress This Week',
    value: '78%',
    change: '+12% vs last week',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    icon: DollarSign,
    label: 'Budget Utilization',
    value: '₱2.4M',
    change: '65% of budget',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    icon: Package,
    label: 'Low Stock Items',
    value: '7',
    change: 'Needs reorder',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your construction projects and operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Estimates</CardTitle>
            <CardDescription>Latest cost estimates created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">Residential Project #{i}</p>
                    <p className="text-sm text-muted-foreground">Quezon City</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₱{(2.5 + i * 0.5).toFixed(1)}M</p>
                    <p className="text-xs text-muted-foreground">Draft</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>Workers checked in today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { trade: 'Masons', count: 12 },
                { trade: 'Carpenters', count: 8 },
                { trade: 'Helpers', count: 18 },
                { trade: 'Electricians', count: 5 },
                { trade: 'Plumbers', count: 5 },
              ].map((item) => (
                <div key={item.trade} className="flex items-center justify-between">
                  <span className="text-sm">{item.trade}</span>
                  <span className="font-semibold">{item.count} workers</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
