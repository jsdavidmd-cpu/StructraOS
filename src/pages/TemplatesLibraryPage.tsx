import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { projectService } from '@/services/projectService';
import { ORIENTATIONS, SECTORS, getSubtypes } from '@/data/projectTaxonomy';
import { Trash2, Copy } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  orientation: 'Vertical' | 'Horizontal';
  sector: string;
  subtype: string;
  description?: string;
  created_at: string;
}

export default function TemplatesLibraryPage() {
  const profile = useAuthStore((state) => state.profile);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrientation, setFilterOrientation] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    orientation: 'Vertical' as 'Vertical' | 'Horizontal',
    sector: '',
    subtype: '',
    description: '',
  });

  const availableSubtypes = useMemo(() => {
    if (!formData.orientation || !formData.sector) return [];
    return getSubtypes(formData.orientation as 'Vertical' | 'Horizontal', formData.sector);
  }, [formData.orientation, formData.sector]);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const rows = await projectService.getProjectTemplates(profile.organization_id);
        setTemplates((rows as any[]) || []);
      } catch (error) {
        console.error('Failed to load templates:', error);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    void loadTemplates();
  }, [profile?.organization_id]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.orientation || !formData.sector || !formData.subtype) {
      setError('Please fill in all required fields');
      return;
    }

    if (!profile?.organization_id) {
      setError('Organization not found');
      return;
    }

    try {
      setCreating(true);

      // Insert template (you may need to adjust based on your actual table structure)
      const templateData = {
        organization_id: profile.organization_id,
        name: formData.name,
        orientation: formData.orientation,
        sector: formData.sector,
        subtype: formData.subtype,
        description: formData.description || null,
      };

      const { data, error: insertError } = await (supabase
        .from('project_templates') as any)
        .insert([templateData])
        .select();

      if (insertError) throw insertError;

      setSuccess(`Template "${formData.name}" created successfully.`);
      setFormData({ name: '', orientation: 'Vertical', sector: '', subtype: '', description: '' });
      if (data) setTemplates([...templates, data[0] as Template]);
    } catch (err: any) {
      setError(err.message || 'Failed to create template');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Delete this template?')) return;

    try {
      const { error: deleteError } = await (supabase
        .from('project_templates') as any)
        .delete()
        .eq('id', templateId);

      if (deleteError) throw deleteError;

      setTemplates(templates.filter((t) => t.id !== templateId));
      setSuccess('Template deleted.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subtype.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOrientation = !filterOrientation || t.orientation === filterOrientation;
      const matchesSector = !filterSector || t.sector === filterSector;

      return matchesSearch && matchesOrientation && matchesSector;
    });
  }, [templates, searchTerm, filterOrientation, filterSector]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Templates Library</h2>
        <p className="text-muted-foreground">Create and manage reusable project templates with default BOQ assemblies.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>Define a template that can be reused for similar projects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Residential 4-Storey"
                  disabled={creating}
                />
              </div>

              <div className="space-y-2">
                <Label>Orientation *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={formData.orientation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      orientation: e.target.value as 'Vertical' | 'Horizontal',
                      sector: '',
                      subtype: '',
                    }))
                  }
                  disabled={creating}
                >
                  {ORIENTATIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Sector *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={formData.sector}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sector: e.target.value, subtype: '' }))}
                  disabled={creating || !formData.orientation}
                >
                  <option value="">Select a sector</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Subtype *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={formData.subtype}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subtype: e.target.value }))}
                  disabled={creating || availableSubtypes.length === 0}
                >
                  <option value="">Select a subtype</option>
                  {availableSubtypes.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Add notes about this template..."
                  disabled={creating}
                />
              </div>
            </div>

            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Template'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>{filteredTemplates.length} template(s) available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by name, sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Orientation</Label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={filterOrientation}
                onChange={(e) => setFilterOrientation(e.target.value)}
              >
                <option value="">All Orientations</option>
                {ORIENTATIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Sector</Label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
              >
                <option value="">All Sectors</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading templates...</p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              {templates.length === 0 ? 'No templates yet. Create your first one above.' : 'No templates match your filters.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.orientation} • {template.sector} • {template.subtype}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {template.description && <p className="text-sm text-muted-foreground">{template.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(template.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Copy className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
