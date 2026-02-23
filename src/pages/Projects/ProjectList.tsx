import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { projectService } from '@/services/projectService';

export default function ProjectList() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const data = await projectService.getProjects(profile.organization_id);
        setProjects(data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [profile?.organization_id]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((item) =>
      [item.name, item.client, item.location, item.project_orientation, item.project_sector, item.project_subtype]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [projects, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Project-first workspace for estimates, execution, and tools.</p>
        </div>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search projects by name, client, location, type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">Loading projects...</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => navigate(`/projects/${project.id}/overview`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <CardDescription>{project.client || 'No client set'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">Orientation:</span> {project.project_orientation || '-'}</div>
                <div><span className="text-muted-foreground">Sector:</span> {project.project_sector || '-'}</div>
                <div><span className="text-muted-foreground">Subtype:</span> {project.project_subtype || '-'}</div>
                <div><span className="text-muted-foreground">Status:</span> {project.status || 'Planning'}</div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="py-10 text-center text-muted-foreground">
                No projects found.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
