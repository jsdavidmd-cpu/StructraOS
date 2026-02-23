import { supabase } from '@/lib/supabase';

export type ProvisionRole = 'admin' | 'project_manager' | 'engineer' | 'quantity_surveyor' | 'foreman' | 'viewer';

export interface AdminProvisionInput {
  email: string;
  full_name: string;
  role: ProvisionRole;
}

export const adminUserService = {
  async listUsers(organizationId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,full_name,role,organization_id,created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  async inviteUser(payload: AdminProvisionInput) {
    const { data, error } = await supabase.functions.invoke('admin-create-user', {
      body: payload,
    });

    if (error) throw error;
    return data;
  },
};
