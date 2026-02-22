import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface BarSchedule {
  id: string;
  organization_id: string;
  estimate_id?: string;
  project_name?: string;
  bar_mark: string;
  element_type: string;
  bar_size: string;
  quantity: number;
  length_mm: number;
  shape_code?: string;
  dimension_a?: number;
  dimension_b?: number;
  dimension_c?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BarScheduleSummary {
  total_pcs: number;
  total_length_m: number;
  total_weight_kg: number;
  bars_needed: number; // 9m standard bars
  tie_wire_kg: number;
}

export interface BarScheduleGrouped {
  bar_size: string;
  element_type: string;
  mark_count: number;
  total_pcs: number;
  total_length_m: number;
  total_weight_kg: number;
}

export interface CuttingOptimization {
  bar_mark: string;
  bar_size: string;
  cut_length_mm: number;
  quantity: number;
  bars_from_9m: number; // How many pieces from 1 bar
  total_9m_bars_needed: number;
  waste_per_bar_mm: number;
  total_waste_mm: number;
  utilization_percent: number;
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

export async function getBarSchedules(estimateId?: string): Promise<BarSchedule[]> {
  let query = supabase
    .from('bar_schedules')
    .select('*')
    .order('bar_mark, element_type');

  if (estimateId) {
    query = query.eq('estimate_id', estimateId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as any) || [];
}

export async function getBarSchedule(id: string): Promise<BarSchedule | null> {
  const { data, error } = await supabase
    .from('bar_schedules')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return (data as any) || null;
}

export async function createBarSchedule(schedule: Omit<BarSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<BarSchedule> {
  // Get organization_id from user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('User not authenticated');
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  const { data, error } = await (supabase.from('bar_schedules') as any).insert([
    {
      ...schedule,
      organization_id: (profile as any)?.organization_id,
    },
  ]).select().single();

  if (error) throw error;
  return (data as any);
}

export async function updateBarSchedule(id: string, updates: Partial<BarSchedule>): Promise<BarSchedule> {
  const { data, error } = await (supabase
    .from('bar_schedules') as any)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return (data as any);
}

export async function deleteBarSchedule(id: string): Promise<void> {
  const { error } = await supabase
    .from('bar_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export async function createBarScheduleBatch(schedules: Omit<BarSchedule, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[]): Promise<BarSchedule[]> {
  // Get organization_id from user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('User not authenticated');
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('user_id', user.id)
    .single();

  const schedulesWithOrg = schedules.map(s => ({
    ...s,
    organization_id: (profile as any)?.organization_id,
  }));

  const { data, error } = await (supabase.from('bar_schedules') as any)
    .insert(schedulesWithOrg)
    .select();

  if (error) throw error;
  return (data as any) || [];
}

// ============================================================================
// SUMMARY & ANALYTICS
// ============================================================================

export async function getBarScheduleSummary(scheduleId: string): Promise<BarScheduleSummary> {
  const schedule = await getBarSchedule(scheduleId);
  if (!schedule) throw new Error('Bar schedule not found');

  // Get weight per meter from rebar_weights
  const { data: rebarWeight } = await supabase
    .from('rebar_weights')
    .select('weight_per_meter')
    .eq('bar_size', schedule.bar_size)
    .single();

  const weight_per_m = (rebarWeight as any)?.weight_per_meter || 0;
  const total_length_m = (schedule.quantity * schedule.length_mm) / 1000;
  const total_weight_kg = total_length_m * weight_per_m;
  const bars_needed = Math.ceil((schedule.quantity * schedule.length_mm) / 9000);
  const tie_wire_kg = total_weight_kg * 0.015;

  return {
    total_pcs: schedule.quantity,
    total_length_m: Math.round(total_length_m * 100) / 100,
    total_weight_kg: Math.round(total_weight_kg * 100) / 100,
    bars_needed,
    tie_wire_kg: Math.round(tie_wire_kg * 1000) / 1000,
  };
}

export async function getBarScheduleGrouped(estimateId: string): Promise<BarScheduleGrouped[]> {
  const { data, error } = await supabase
    .from('vw_bar_schedule_summary')
    .select('*')
    .eq('estimate_id', estimateId)
    .order('bar_size, element_type');

  if (error) throw error;
  return (data as any) || [];
}

// ============================================================================
// CUTTING OPTIMIZATION
// ============================================================================

export function optimizeCutting(barSize: string, cutLengthMm: number, quantity: number): CuttingOptimization {
  const STANDARD_BAR_LENGTH_MM = 9000; // 9 meters
  
  // How many pieces can we get from one 9m bar?
  const bars_from_9m = Math.floor(STANDARD_BAR_LENGTH_MM / cutLengthMm);
  
  // Total 9m bars needed
  const total_9m_bars_needed = Math.ceil(quantity / bars_from_9m);
  
  // Waste per bar
  const waste_per_bar_mm = STANDARD_BAR_LENGTH_MM - (bars_from_9m * cutLengthMm);
  
  // Total waste
  const total_waste_mm = waste_per_bar_mm * total_9m_bars_needed;
  
  // Utilization percentage
  const utilization_percent = ((bars_from_9m * cutLengthMm) / STANDARD_BAR_LENGTH_MM) * 100;
  
  return {
    bar_mark: '', // Will be filled by caller
    bar_size: barSize,
    cut_length_mm: cutLengthMm,
    quantity,
    bars_from_9m,
    total_9m_bars_needed,
    waste_per_bar_mm,
    total_waste_mm,
    utilization_percent: Math.round(utilization_percent * 100) / 100,
  };
}

export async function generateCuttingList(estimateId: string): Promise<CuttingOptimization[]> {
  const schedules = await getBarSchedules(estimateId);
  
  return schedules.map(schedule => ({
    ...optimizeCutting(schedule.bar_size, schedule.length_mm, schedule.quantity),
    bar_mark: schedule.bar_mark,
  }));
}

// ============================================================================
// MATERIAL SUMMARY FOR PROCUREMENT
// ============================================================================

export interface RebarProcurement {
  bar_size: string;
  total_pcs_9m: number;
  total_weight_kg: number;
  tie_wire_kg: number;
  estimated_cost_php: number; // Will need price lookup
}

export async function generateRebarProcurement(estimateId: string): Promise<RebarProcurement[]> {
  const grouped = await getBarScheduleGrouped(estimateId);
  
  // Group by bar size only
  const bySize = grouped.reduce((acc, item) => {
    if (!acc[item.bar_size]) {
      acc[item.bar_size] = {
        bar_size: item.bar_size,
        total_pcs_9m: 0,
        total_weight_kg: 0,
        tie_wire_kg: 0,
        estimated_cost_php: 0,
      };
    }
    
    acc[item.bar_size].total_weight_kg += item.total_weight_kg;
    acc[item.bar_size].tie_wire_kg += item.total_weight_kg * 0.015;
    
    return acc;
  }, {} as Record<string, RebarProcurement>);
  
  // Get prices from materials table
  const { data: materials } = await supabase
    .from('materials')
    .select('code, ncr_price')
    .in('code', Object.keys(bySize).map(size => {
      // Map bar sizes to material codes
      const sizeMap: Record<string, string> = {
        '10mm': 'MAT-010',
        '12mm': 'MAT-011',
        '16mm': 'MAT-012',
        '20mm': 'MAT-013',
        '25mm': 'MAT-014',
      };
      return sizeMap[size] || '';
    }).filter(Boolean));
  
  // Calculate estimated costs
  Object.values(bySize).forEach(item => {
    const matCode = {
      '10mm': 'MAT-010',
      '12mm': 'MAT-011',
      '16mm': 'MAT-012',
      '20mm': 'MAT-013',
    }[item.bar_size];
    
    const price = (materials as any)?.find((m: any) => m.code === matCode)?.ncr_price || 50;
    item.estimated_cost_php = Math.round(item.total_weight_kg * price * 100) / 100;
  });
  
  return Object.values(bySize);
}

// ============================================================================
// EXPORT TO CSV/EXCEL
// ============================================================================

export function formatBarScheduleForExport(schedules: BarSchedule[]): string {
  const headers = [
    'BAR MARK',
    'ELEMENT',
    'BAR SIZE',
    'QUANTITY',
    'LENGTH (mm)',
    'SHAPE CODE',
    'DIM A',
    'DIM B',
    'DIM C',
    'NOTES',
  ];
  
  const rows = schedules.map(s => [
    s.bar_mark,
    s.element_type,
    s.bar_size,
    s.quantity.toString(),
    s.length_mm.toString(),
    s.shape_code || '',
    s.dimension_a?.toString() || '',
    s.dimension_b?.toString() || '',
    s.dimension_c?.toString() || '',
    s.notes || '',
  ]);
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}
