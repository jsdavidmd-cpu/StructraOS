import { supabase } from '@/lib/supabase';

export interface ScheduleTask {
  id: string;
  project_id: string;
  boq_item_id: string | null;
  crew_id: string | null;
  task_name: string;
  description: string | null;
  planned_start: string | null;
  planned_end: string | null;
  planned_duration: number | null;
  baseline_start: string | null;
  baseline_end: string | null;
  forecast_start: string | null;
  forecast_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  actual_duration: number | null;
  productivity_rate: number | null;
  qty_planned: number | null;
  qty_completed: number | null;
  percent_complete: number | null;
  predecessor_ids: string[];
  lag_days: number | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_milestone: boolean;
  resource_notes: string | null;
  sort_order: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CrewOption {
  id: string;
  name: string;
  foreman_id: string | null;
}

export interface ScheduleTaskInput {
  project_id: string;
  task_name: string;
  description?: string | null;
  boq_item_id?: string | null;
  crew_id?: string | null;
  planned_start?: string | null;
  planned_end?: string | null;
  planned_duration?: number | null;
  baseline_start?: string | null;
  baseline_end?: string | null;
  forecast_start?: string | null;
  forecast_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  actual_duration?: number | null;
  productivity_rate?: number | null;
  qty_planned?: number | null;
  qty_completed?: number | null;
  percent_complete?: number | null;
  predecessor_ids?: string[];
  lag_days?: number | null;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  is_milestone?: boolean;
  resource_notes?: string | null;
  sort_order?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  created_by?: string | null;
}

const normalizeTask = (row: any): ScheduleTask => ({
  ...row,
  predecessor_ids: Array.isArray(row.predecessor_ids) ? row.predecessor_ids : [],
  priority: (row.priority || 'medium') as ScheduleTask['priority'],
  is_milestone: Boolean(row.is_milestone),
  sort_order: Number(row.sort_order || 0),
});

const daysBetween = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const diff = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return Math.max(diff, 1);
};

export const scheduleService = {
  async getTasks(projectId: string): Promise<ScheduleTask[]> {
    const { data, error } = await (supabase.from('tasks') as any)
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return ((data ?? []) as any[]).map(normalizeTask);
  },

  async getCrews(organizationId: string): Promise<CrewOption[]> {
    const { data, error } = await (supabase.from('crews') as any)
      .select('id,name,foreman_id')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []) as CrewOption[];
  },

  async createTask(payload: ScheduleTaskInput): Promise<ScheduleTask> {
    const input: any = { ...payload };
    if (input.planned_duration == null) {
      input.planned_duration = daysBetween(input.planned_start, input.planned_end);
    }

    const { data, error } = await (supabase.from('tasks') as any)
      .insert([input])
      .select('*')
      .single();

    if (error) throw error;
    return normalizeTask(data);
  },

  async updateTask(taskId: string, updates: Partial<ScheduleTaskInput>): Promise<ScheduleTask> {
    const input: any = { ...updates };
    if (input.planned_duration == null && (Object.prototype.hasOwnProperty.call(input, 'planned_start') || Object.prototype.hasOwnProperty.call(input, 'planned_end'))) {
      input.planned_duration = daysBetween(input.planned_start, input.planned_end);
    }

    const { data, error } = await (supabase.from('tasks') as any)
      .update(input)
      .eq('id', taskId)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeTask(data);
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await (supabase.from('tasks') as any)
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  async captureBaseline(projectId: string): Promise<void> {
    const tasks = await this.getTasks(projectId);
    const updates = tasks
      .filter((task) => (!task.baseline_start && task.planned_start) || (!task.baseline_end && task.planned_end))
      .map((task) =>
        this.updateTask(task.id, {
          baseline_start: task.baseline_start || task.planned_start,
          baseline_end: task.baseline_end || task.planned_end,
        })
      );

    await Promise.all(updates);
  },

  async generateTasksFromBOQ(projectId: string, createdBy: string): Promise<number> {
    const { data: estimates, error: estimateError } = await (supabase.from('estimates') as any)
      .select('id')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (estimateError) throw estimateError;
    const estimateId = estimates?.[0]?.id;
    if (!estimateId) return 0;

    const [{ data: boqRows, error: boqError }, { data: existingRows, error: existingError }] = await Promise.all([
      (supabase.from('boq_items') as any)
        .select('id,description,qty,unit,sort_order')
        .eq('estimate_id', estimateId)
        .order('sort_order', { ascending: true }),
      (supabase.from('tasks') as any)
        .select('boq_item_id')
        .eq('project_id', projectId)
        .not('boq_item_id', 'is', null),
    ]);

    if (boqError) throw boqError;
    if (existingError) throw existingError;

    const existingIds = new Set((existingRows ?? []).map((row: any) => row.boq_item_id).filter(Boolean));
    const rowsToInsert = (boqRows ?? [])
      .filter((row: any) => !existingIds.has(row.id))
      .map((row: any, index: number) => ({
        project_id: projectId,
        boq_item_id: row.id,
        task_name: row.description,
        description: row.unit ? `${row.qty ?? 0} ${row.unit}` : null,
        qty_planned: row.qty ?? 0,
        qty_completed: 0,
        percent_complete: 0,
        status: 'not_started',
        priority: 'medium',
        sort_order: Number(row.sort_order ?? index + 1),
        created_by: createdBy,
      }));

    if (rowsToInsert.length === 0) return 0;

    const { error: insertError } = await (supabase.from('tasks') as any)
      .insert(rowsToInsert);

    if (insertError) throw insertError;
    return rowsToInsert.length;
  },
};
