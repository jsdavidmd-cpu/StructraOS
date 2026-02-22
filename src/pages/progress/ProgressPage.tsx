import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progress Monitoring</h2>
        <p className="text-muted-foreground">
          Track project progress, cost variance, and schedule performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Weighted by cost</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">68.5%</div>
            <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: '68.5%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              On track with baseline schedule
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Performance</CardTitle>
            <CardDescription>Budget vs actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">₱2.1M</div>
            <p className="text-sm text-muted-foreground">
              ₱3.5M budget • 60% utilized
            </p>
            <div className="mt-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Cost Variance:</span>
                <span className="font-medium text-green-600">-₱150K (Under)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Progress Module</CardTitle>
          </div>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">Features include:</p>
            <ul className="text-sm space-y-1">
              <li>• Daily progress entry by BOQ item</li>
              <li>• S-curve visualization</li>
              <li>• Cost and schedule variance analysis</li>
              <li>• Earned value management</li>
              <li>• Photo progress documentation</li>
              <li>• Progress reports and dashboards</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
