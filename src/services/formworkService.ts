import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface FormworkCycle {
  id: string;
  organization_id: string;
  material_id?: string;
  item_description: string;
  unit: string;
  purchase_price: number;
  max_uses: number;
  current_use_count: number;
  depreciation_per_use: number;
  current_value: number;
  status: 'active' | 'retired' | 'damaged';
  last_used_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FormworkUsageLog {
  cycle_id: string;
  use_date: string;
  project_name: string;
  area_used: number;
  use_number: number;
}

export interface FormworkAnalytics {
  total_items: number;
  active_items: number;
  retired_items: number;
  damaged_items: number;
  total_investment: number;
  current_value: number;
  total_depreciation: number;
  average_utilization: number;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getFormworkCycles(status?: string): Promise<FormworkCycle[]> {
  let query = supabase
    .from('formwork_cycles')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as any) || [];
}

export async function getFormworkCycle(id: string): Promise<FormworkCycle | null> {
  const { data, error } = await supabase
    .from('formwork_cycles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return (data as any) || null;
}

export async function createFormworkCycle(
  cycle: Omit<FormworkCycle, 'id' | 'organization_id' | 'depreciation_per_use' | 'current_value' | 'created_at' | 'updated_at'>
): Promise<FormworkCycle> {
  // Get organization_id from user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('User not authenticated');
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  const { data, error } = await (supabase.from('formwork_cycles') as any).insert([
    {
      ...cycle,
      organization_id: (profile as any)?.organization_id,
    },
  ]).select().single();

  if (error) throw error;
  return (data as any);
}

export async function updateFormworkCycle(id: string, updates: Partial<FormworkCycle>): Promise<FormworkCycle> {
  const { data, error } = await (supabase
    .from('formwork_cycles') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return (data as any);
}

export async function deleteFormworkCycle(id: string): Promise<void> {
  const { error } = await supabase
    .from('formwork_cycles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export async function recordFormworkUsage(
  cycleId: string,
  projectName: string,
  areaUsed: number
): Promise<FormworkCycle> {
  const cycle = await getFormworkCycle(cycleId);
  if (!cycle) throw new Error('Formwork cycle not found');

  if (cycle.current_use_count >= cycle.max_uses) {
    throw new Error('Formwork has reached maximum uses');
  }

  // Increment use count
  const newUseCount = cycle.current_use_count + 1;
  const newStatus = newUseCount >= cycle.max_uses ? 'retired' : cycle.status;

  return await updateFormworkCycle(cycleId, {
    current_use_count: newUseCount,
    last_used_date: new Date().toISOString().split('T')[0],
    status: newStatus,
    notes: cycle.notes 
      ? `${cycle.notes}\nUse ${newUseCount}: ${projectName} (${areaUsed} sq.m)`
      : `Use ${newUseCount}: ${projectName} (${areaUsed} sq.m)`,
  });
}

export async function markFormworkDamaged(cycleId: string, damageNotes: string): Promise<FormworkCycle> {
  const cycle = await getFormworkCycle(cycleId);
  if (!cycle) throw new Error('Formwork cycle not found');

  return await updateFormworkCycle(cycleId, {
    status: 'damaged',
    notes: cycle.notes 
      ? `${cycle.notes}\nDAMAGED: ${damageNotes}`
      : `DAMAGED: ${damageNotes}`,
  });
}

export async function retireFormwork(cycleId: string): Promise<FormworkCycle> {
  return await updateFormworkCycle(cycleId, {
    status: 'retired',
  });
}

// ============================================================================
// COST CALCULATIONS
// ============================================================================

export function calculateFormworkCostPerUse(cycle: FormworkCycle): number {
  return Math.round((cycle.purchase_price / cycle.max_uses) * 100) / 100;
}

export function calculateRemainingValue(cycle: FormworkCycle): number {
  const remaining_uses = cycle.max_uses - cycle.current_use_count;
  const value = (remaining_uses / cycle.max_uses) * cycle.purchase_price;
  return Math.round(value * 100) / 100;
}

export function calculateUtilizationRate(cycle: FormworkCycle): number {
  return Math.round((cycle.current_use_count / cycle.max_uses) * 10000) / 100;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getFormworkAnalytics(): Promise<FormworkAnalytics> {
  const cycles = await getFormworkCycles();

  const total_items = cycles.length;
  const active_items = cycles.filter(c => c.status === 'active').length;
  const retired_items = cycles.filter(c => c.status === 'retired').length;
  const damaged_items = cycles.filter(c => c.status === 'damaged').length;

  const total_investment = cycles.reduce((sum, c) => sum + c.purchase_price, 0);
  const current_value = cycles.reduce((sum, c) => sum + c.current_value, 0);
  const total_depreciation = total_investment - current_value;

  const average_utilization = cycles.length > 0
    ? cycles.reduce((sum, c) => sum + calculateUtilizationRate(c), 0) / cycles.length
    : 0;

  return {
    total_items,
    active_items,
    retired_items,
    damaged_items,
    total_investment: Math.round(total_investment * 100) / 100,
    current_value: Math.round(current_value * 100) / 100,
    total_depreciation: Math.round(total_depreciation * 100) / 100,
    average_utilization: Math.round(average_utilization * 100) / 100,
  };
}

// ============================================================================
// PROCUREMENT RECOMMENDATIONS
// ============================================================================

export interface FormworkNeed {
  item_type: string;
  required_quantity: number;
  available_quantity: number;
  needed_quantity: number;
  estimated_cost: number;
}

export async function analyzeFormworkNeeds(
  requiredPlywood: number,
  requiredLumber2x2: number,
  requiredLumber2x3: number
): Promise<FormworkNeed[]> {
  const cycles = await getFormworkCycles('active');

  // Group by item type
  const plywoodAvailable = cycles
    .filter(c => c.item_description.toLowerCase().includes('plywood'))
    .reduce((sum, c) => sum + (c.max_uses - c.current_use_count), 0);

  const lumber2x2Available = cycles
    .filter(c => c.item_description.toLowerCase().includes('2x2'))
    .reduce((sum, c) => sum + (c.max_uses - c.current_use_count), 0);

  const lumber2x3Available = cycles
    .filter(c => c.item_description.toLowerCase().includes('2x3'))
    .reduce((sum, c) => sum + (c.max_uses - c.current_use_count), 0);

  // Get material prices
  const { data: materials } = await supabase
    .from('materials')
    .select('code, name, ncr_price')
    .in('code', ['MAT-030', 'MAT-031', 'MAT-032']);

  const plywoodPrice = (materials as any)?.find((m: any) => m.code === 'MAT-030')?.ncr_price || 850;
  const lumber2x2Price = (materials as any)?.find((m: any) => m.code === 'MAT-031')?.ncr_price || 85;
  const lumber2x3Price = (materials as any)?.find((m: any) => m.code === 'MAT-032')?.ncr_price || 125;

  const needs: FormworkNeed[] = [];

  // Plywood
  const plywoodNeeded = Math.max(0, requiredPlywood - plywoodAvailable);
  if (plywoodNeeded > 0) {
    needs.push({
      item_type: 'Marine Plywood 1/2" x 4\' x 8\'',
      required_quantity: requiredPlywood,
      available_quantity: plywoodAvailable,
      needed_quantity: plywoodNeeded,
      estimated_cost: Math.round(plywoodNeeded * plywoodPrice * 100) / 100,
    });
  }

  // Lumber 2x2
  const lumber2x2Needed = Math.max(0, requiredLumber2x2 - lumber2x2Available);
  if (lumber2x2Needed > 0) {
    needs.push({
      item_type: 'Lumber 2" x 2" x 10\'',
      required_quantity: requiredLumber2x2,
      available_quantity: lumber2x2Available,
      needed_quantity: lumber2x2Needed,
      estimated_cost: Math.round(lumber2x2Needed * lumber2x2Price * 100) / 100,
    });
  }

  // Lumber 2x3
  const lumber2x3Needed = Math.max(0, requiredLumber2x3 - lumber2x3Available);
  if (lumber2x3Needed > 0) {
    needs.push({
      item_type: 'Lumber 2" x 3" x 10\'',
      required_quantity: requiredLumber2x3,
      available_quantity: lumber2x3Available,
      needed_quantity: lumber2x3Needed,
      estimated_cost: Math.round(lumber2x3Needed * lumber2x3Price * 100) / 100,
    });
  }

  return needs;
}

// ============================================================================
// BULK IMPORT FOR EXISTING INVENTORY
// ============================================================================

export async function importFormworkInventory(items: {
  description: string;
  unit: string;
  purchase_price: number;
  max_uses: number;
  current_use_count: number;
  status: 'active' | 'retired' | 'damaged';
}[]): Promise<FormworkCycle[]> {
  // Get organization_id from user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('User not authenticated');
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  const itemsWithOrg = items.map(item => ({
    item_description: item.description,
    unit: item.unit,
    purchase_price: item.purchase_price,
    max_uses: item.max_uses,
    current_use_count: item.current_use_count,
    status: item.status,
    organization_id: (profile as any)?.organization_id,
  }));

  const { data, error } = await (supabase.from('formwork_cycles') as any)
    .insert(itemsWithOrg)
    .select();

  if (error) throw error;
  return (data as any) || [];
}
