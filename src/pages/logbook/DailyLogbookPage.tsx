import { useState } from 'react';
import { Calendar, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DailyLogbookPage() {
  const [selectedDate] = useState(new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Construction Daily Logbook</h2>
          <p className="text-muted-foreground">
            Official site records and daily progress reports
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Select Date
          </Button>
          <Button>
            <FileDown className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Daily Log - {selectedDate.toLocaleDateString('en-PH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
          <CardDescription>
            Comprehensive site activity and progress documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weather" className="space-y-4">
            <TabsList>
              <TabsTrigger value="weather">Weather & Site</TabsTrigger>
              <TabsTrigger value="manpower">Manpower</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="weather" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium mb-2">Weather & Site Conditions</p>
                <p className="text-sm">
                  Record weather (AM/PM), temperature, site conditions, safety issues, delays, and visitor log
                </p>
              </div>
            </TabsContent>

            <TabsContent value="manpower" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium mb-2">Manpower Summary</p>
                <p className="text-sm">
                  Auto-populated from attendance records - breakdown by trade, total manhours
                </p>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium mb-2">Activities Accomplished</p>
                <p className="text-sm">
                  Link to BOQ items, record quantities completed, location, and remarks
                </p>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium mb-2">Materials Received & Issued</p>
                <p className="text-sm">
                  Track materials received, issued to activities, and running balance
                </p>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium mb-2">Equipment Utilization</p>
                <p className="text-sm">
                  Log equipment hours, operator, and condition remarks
                </p>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="space-y-4">
              <div className="text-center py-12 text-muted-foreground">
                <p className="font-medium mb-2">Photo Documentation</p>
                <p className="text-sm">
                  Upload and caption progress photos with location tags
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Log Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                DRAFT
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-4">
              Once finalized, this log will be locked and included in the official project records.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
