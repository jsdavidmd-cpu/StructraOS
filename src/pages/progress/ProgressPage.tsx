import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useProjectContext } from '@/components/ProjectContextProvider';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import ProgressDashboard from './ProgressDashboard';
import DailyProgressEntry from './DailyProgressEntry';
import ProgressHistory from './ProgressHistory';
import ProgressPhotos from './ProgressPhotos';

export default function ProgressPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const profile = useAuthStore((state) => state.profile);
  const { activeProject } = useProjectContext();
  const [estimateId, setEstimateId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (projectId) {
      fetchProjectEstimate();
    }
  }, [projectId]);

  const fetchProjectEstimate = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      // Get the most recent estimate for this project
      const { data, error } = await supabase
        .from('estimates')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching estimate:', error);
      } else if (data) {
        setEstimateId((data as any).id);
      }
    } catch (err) {
      console.error('Failed to fetch estimate:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!profile?.organization_id || !projectId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No project selected or organization not configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <div className="text-muted-foreground">Loading project data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Progress Monitoring</h2>
        <p className="text-muted-foreground">
          Track {activeProject?.name || 'project'} progress, cost variance, and schedule performance
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="entry">Daily Entry</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProgressDashboard
            projectId={projectId}
            estimateId={estimateId}
            key={`dashboard-${refreshKey}`}
          />
        </TabsContent>

        <TabsContent value="entry">
          <DailyProgressEntry
            projectId={projectId}
            estimateId={estimateId}
            onProgressRecorded={handleProgressUpdated}
          />
        </TabsContent>

        <TabsContent value="history">
          <ProgressHistory projectId={projectId} key={`history-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="photos">
          <ProgressPhotos projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
