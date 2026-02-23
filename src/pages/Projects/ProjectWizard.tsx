import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProjectTypeSelector from '@/components/ProjectTypeSelector';
import { useAuthStore } from '@/store/authStore';
import { projectService } from '@/services/projectService';
import { supabase } from '@/lib/supabase';

const steps = [
  'Basic Info',
  'Orientation',
  'Sector + Subtype',
  'Template',
  'Initial Estimate',
  'Assign Team',
  'Create Project',
];

export default function ProjectWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    client: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: '',
    project_orientation: '' as 'Vertical' | 'Horizontal' | '',
    project_sector: '',
    project_subtype: '',
    template_id: '',
    create_initial_estimate: true,
    member_ids: [] as string[],
  });

  useEffect(() => {
    const prefill = (location.state as any)?.prefillTemplate;
    if (!prefill) {
      setStep(0);
      return;
    }

    setForm((prev) => ({
      ...prev,
      name: prev.name || prefill.name || '',
      project_orientation: prefill.orientation || prev.project_orientation,
      project_sector: prefill.sector || prev.project_sector,
      project_subtype: prefill.subtype || prev.project_subtype,
      template_id: prefill.id || prev.template_id,
    }));

    setStep(3);
  }, [location.key, location.state]);

  useEffect(() => {
    const loadSupportData = async () => {
      if (!profile?.organization_id) return;

      try {
        const [templateRows, profileRows] = await Promise.all([
          projectService.getProjectTemplates(profile.organization_id),
          supabase
            .from('profiles')
            .select('id,full_name,email,role')
            .eq('organization_id', profile.organization_id),
        ]);

        setTemplates(templateRows);
        setProfiles((profileRows.data ?? []) as any[]);
      } catch (error) {
        console.error('Failed to load wizard support data:', error);
      }
    };

    void loadSupportData();
  }, [profile?.organization_id]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const orientationMatch = !form.project_orientation || template.orientation === form.project_orientation;
      const sectorMatch = !form.project_sector || template.sector === form.project_sector;
      const subtypeMatch = !form.project_subtype || template.subtype === form.project_subtype;
      return orientationMatch && sectorMatch && subtypeMatch;
    });
  }, [templates, form.project_orientation, form.project_sector, form.project_subtype]);

  const canContinue = () => {
    switch (step) {
      case 0:
        return Boolean(form.name.trim());
      case 1:
        return Boolean(form.project_orientation);
      case 2:
        return Boolean(form.project_sector && form.project_subtype);
      default:
        return true;
    }
  };

  const handleCreateProject = async () => {
    if (!profile?.organization_id || !user?.id) return;

    try {
      setSubmitting(true);

      const project = await projectService.createProject({
        company_id: profile.organization_id,
        name: form.name,
        client: form.client || undefined,
        location: form.location || undefined,
        project_orientation: form.project_orientation || 'Vertical',
        project_sector: form.project_sector,
        project_subtype: form.project_subtype,
        status: 'Planning',
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget ? Number(form.budget) : null,
      });

      if (form.member_ids.length > 0) {
        await projectService.assignMembers(
          project.id,
          form.member_ids.map((id) => ({
            profile_id: id,
            role: 'Engineer',
            invited_by: user.id,
          }))
        );
      }

      if (form.create_initial_estimate) {
        const selectedTemplate = templates.find((template) => template.id === form.template_id);
        await projectService.createInitialEstimate(project.id, profile.organization_id, user.id, selectedTemplate?.name);
      }

      navigate(`/projects/${project.id}/overview`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Project creation failed. Please review inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Project</h2>
        <p className="text-muted-foreground">7-step wizard for Project-First STRUCTRA workflow.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            Step {step + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Project Name</Label>
                <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Input value={form.client} onChange={(e) => setForm((prev) => ({ ...prev, client: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Budget</Label>
                <Input type="number" value={form.budget} onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))} />
              </div>
            </div>
          )}

          {step === 1 && (
            <ProjectTypeSelector
              orientation={form.project_orientation}
              sector={form.project_sector}
              subtype={form.project_subtype}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  project_orientation: value.orientation ?? prev.project_orientation,
                  project_sector: value.sector ?? prev.project_sector,
                  project_subtype: value.subtype ?? prev.project_subtype,
                }))
              }
            />
          )}

          {step === 2 && (
            <ProjectTypeSelector
              orientation={form.project_orientation}
              sector={form.project_sector}
              subtype={form.project_subtype}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  project_orientation: value.orientation ?? prev.project_orientation,
                  project_sector: value.sector ?? prev.project_sector,
                  project_subtype: value.subtype ?? prev.project_subtype,
                }))
              }
            />
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>Template Library</Label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={form.template_id}
                onChange={(e) => setForm((prev) => ({ ...prev, template_id: e.target.value }))}
              >
                <option value="">No template (start blank)</option>
                {filteredTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} — {template.orientation} / {template.sector} / {template.subtype}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 4 && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.create_initial_estimate}
                onChange={(e) => setForm((prev) => ({ ...prev, create_initial_estimate: e.target.checked }))}
              />
              Create initial estimate after project creation
            </label>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <Label>Assign Team</Label>
              <div className="border rounded-md p-3 max-h-64 overflow-auto space-y-2">
                {profiles.map((member) => (
                  <label key={member.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.member_ids.includes(member.id)}
                      onChange={(e) => {
                        setForm((prev) => {
                          const next = new Set(prev.member_ids);
                          if (e.target.checked) next.add(member.id);
                          else next.delete(member.id);
                          return { ...prev, member_ids: Array.from(next) };
                        });
                      }}
                    />
                    <span>{member.full_name || member.email} ({member.role})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Orientation:</strong> {form.project_orientation}</p>
              <p><strong>Sector:</strong> {form.project_sector}</p>
              <p><strong>Subtype:</strong> {form.project_subtype}</p>
              <p><strong>Template:</strong> {form.template_id ? 'Selected' : 'None'}</p>
              <p><strong>Initial Estimate:</strong> {form.create_initial_estimate ? 'Yes' : 'No'}</p>
              <p><strong>Team Members:</strong> {form.member_ids.length}</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => (step === 0 ? navigate('/projects') : setStep((prev) => prev - 1))}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < steps.length - 1 ? (
              <Button onClick={() => setStep((prev) => prev + 1)} disabled={!canContinue()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateProject} disabled={submitting || !form.name || !form.project_orientation || !form.project_sector || !form.project_subtype}>
                {submitting ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
