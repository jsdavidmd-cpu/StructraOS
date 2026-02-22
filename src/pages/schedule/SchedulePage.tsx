import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Project Scheduling</h2>
        <p className="text-muted-foreground">
          Gantt charts, task dependencies, and timeline management
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <CardTitle>Schedule Module</CardTitle>
          </div>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">Features include:</p>
            <ul className="text-sm space-y-1">
              <li>• Task generation from BOQ items</li>
              <li>• Duration calculation based on productivity</li>
              <li>• Gantt chart visualization</li>
              <li>• Task dependencies and critical path</li>
              <li>• Baseline vs actual tracking</li>
              <li>• Resource leveling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
