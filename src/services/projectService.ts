import { supabase } from '@/lib/supabase';
import { estimateService } from '@/services/estimateService';

export interface ProjectPayload {
  company_id: string;
  name: string;
  client?: string;
  location?: string;
  project_orientation: 'Vertical' | 'Horizontal';
  project_sector: string;
  project_subtype: string;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  budget?: number | null;
}

export const projectService = {
  async getProjects(organizationId: string) {
    const { data, error } = await supabase
      .from('projects' as never)
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as any[];
  },

  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects' as never)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any;
  },

  async createProject(payload: ProjectPayload) {
    const { data, error } = await (supabase.from('projects' as never) as any)
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  async getProjectTemplates(companyId: string, orientation?: string, sector?: string, subtype?: string) {
    let query = supabase
      .from('project_templates' as never)
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (orientation) query = query.eq('orientation', orientation);
    if (sector) query = query.eq('sector', sector);
    if (subtype) query = query.eq('subtype', subtype);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as any[];
  },

  async assignMembers(projectId: string, members: Array<{ profile_id: string; role: string; invited_by?: string }>) {
    if (members.length === 0) return [];

    const payload = members.map((member) => ({
      project_id: projectId,
      profile_id: member.profile_id,
      role: member.role,
      invited_by: member.invited_by ?? null,
    }));

    const { data, error } = await (supabase.from('project_members' as never) as any)
      .upsert(payload, { onConflict: 'project_id,profile_id' })
      .select('*');

    if (error) throw error;
    return (data ?? []) as any[];
  },

  async createInitialEstimate(projectId: string, organizationId: string, createdBy: string, templateName?: string) {
    const estimateNumber = await estimateService.generateEstimateNumber();

    const estimate = await estimateService.createEstimate({
      organization_id: organizationId,
      project_id: projectId,
      estimate_number: estimateNumber,
      project_name: templateName || 'Initial Estimate',
      location: '',
      client_name: '',
      floor_area: 0,
      notes: '',
      ocm_overhead: 5,
      ocm_contingency: 5,
      ocm_misc: 3,
      ocm_profit: 10,
      vat_type: 'exclusive',
      vat_rate: 12,
      status: 'draft',
      version: 1,
      is_final: false,
      created_by: createdBy,
      subtotal: 0,
      total_amount: 0,
    } as any);

    return estimate as any;
  },
};
