import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProjectContext } from '@/components/ProjectContextProvider';

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { activeProject, loading } = useProjectContext();

  const quickLinks = useMemo(
    () => [
      { label: 'Estimates & BOQ', path: `/projects/${projectId}/estimates` },
      { label: 'Schedule', path: `/projects/${projectId}/schedule` },
      { label: 'Manpower', path: `/projects/${projectId}/manpower` },
      { label: 'Inventory', path: `/projects/${projectId}/inventory` },
      { label: 'Progress', path: `/projects/${projectId}/progress` },
      { label: 'Documents', path: `/projects/${projectId}/documents` },
      { label: 'Engineering Tools', path: `/projects/${projectId}/tools` },
    ],
    [projectId]
  );

  if (loading) {
    return <div className="text-muted-foreground">Loading project workspace...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Project Overview</h2>
        <p className="text-muted-foreground">Project-centric execution dashboard.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{activeProject?.name || 'Project'}</CardTitle>
          <CardDescription>
            {activeProject?.project_orientation || '-'} / {activeProject?.project_sector || '-'} / {activeProject?.project_subtype || '-'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Client:</span> {activeProject?.client || '-'}</div>
          <div><span className="text-muted-foreground">Location:</span> {activeProject?.location || '-'}</div>
          <div><span className="text-muted-foreground">Status:</span> {activeProject?.status || 'Planning'}</div>
          <div><span className="text-muted-foreground">Budget:</span> {activeProject?.budget || '-'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Modules</CardTitle>
          <CardDescription>Everything is now scoped to this project context.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Button key={item.path} variant="outline" onClick={() => navigate(item.path)}>
              {item.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
