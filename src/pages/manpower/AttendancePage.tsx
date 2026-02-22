import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AttendancePage() {
  const [selectedDate] = useState(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracking</h2>
          <p className="text-muted-foreground">
            Daily worker attendance and time tracking
          </p>
        </div>

        <Button>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Select Date
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Present Today</CardTitle>
            <CardDescription>Workers checked in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48</div>
            <p className="text-sm text-muted-foreground mt-2">
              Across 8 active crews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Manhours</CardTitle>
            <CardDescription>Hours logged today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">384</div>
            <p className="text-sm text-muted-foreground mt-2">
              8 hours average per worker
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labor Cost Today</CardTitle>
            <CardDescription>Total wages for the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱38,400</div>
            <p className="text-sm text-muted-foreground mt-2">
              Direct labor only
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Sheet</CardTitle>
          <CardDescription>
            {selectedDate.toLocaleDateString('en-PH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Attendance tracking interface coming soon...
            <p className="mt-2 text-sm">
              Features: Check-in/out, crew assignment, activity logging, productivity tracking
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
