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
  phase: string | null;
  wbs_code: string | null;
  parent_task_id: string | null;
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
  phase?: string | null;
  wbs_code?: string | null;
  parent_task_id?: string | null;
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
        .select('id,description,qty,unit,sort_order,section')
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
        phase: row.section || 'BOQ Generated',
        wbs_code: `BOQ-${Number(row.sort_order ?? index + 1)}`,
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

  async resequenceTasks(projectId: string, orderedTaskIds: string[]): Promise<void> {
    const updates = orderedTaskIds.map((taskId, index) =>
      (supabase.from('tasks') as any)
        .update({ sort_order: index + 1 })
        .eq('project_id', projectId)
        .eq('id', taskId)
    );

    const results = await Promise.all(updates);
    const failed = results.find((result: any) => result.error);
    if (failed?.error) throw failed.error;
  },

  async renumberWbsCodes(projectId: string): Promise<void> {
    const tasks = await this.getTasks(projectId);
    if (tasks.length === 0) return;

    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const childrenByParent = new Map<string, ScheduleTask[]>();

    tasks.forEach((task) => {
      if (!task.parent_task_id || !taskMap.has(task.parent_task_id)) return;
      if (!childrenByParent.has(task.parent_task_id)) childrenByParent.set(task.parent_task_id, []);
      childrenByParent.get(task.parent_task_id)!.push(task);
    });

    childrenByParent.forEach((children) => children.sort((a, b) => a.sort_order - b.sort_order));

    const roots = tasks
      .filter((task) => !task.parent_task_id || !taskMap.has(task.parent_task_id))
      .sort((a, b) => a.sort_order - b.sort_order);

    const updates: Array<{ id: string; wbs_code: string }> = [];
    const visited = new Set<string>();

    const assignCodes = (nodes: ScheduleTask[], prefix = '') => {
      nodes.forEach((node, index) => {
        const code = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        if ((node.wbs_code || '') !== code) {
          updates.push({ id: node.id, wbs_code: code });
        }
        visited.add(node.id);
        const children = childrenByParent.get(node.id) ?? [];
        assignCodes(children, code);
      });
    };

    assignCodes(roots);

    const orphaned = tasks.filter((task) => !visited.has(task.id)).sort((a, b) => a.sort_order - b.sort_order);
    if (orphaned.length > 0) {
      assignCodes(orphaned, `${roots.length + 1}`);
    }

    if (updates.length === 0) return;

    const operations = updates.map((update) =>
      (supabase.from('tasks') as any)
        .update({ wbs_code: update.wbs_code })
        .eq('project_id', projectId)
        .eq('id', update.id)
    );

    const results = await Promise.all(operations);
    const failed = results.find((result: any) => result.error);
    if (failed?.error) throw failed.error;
  },

  async cascadeTaskPhase(projectId: string, parentTaskId: string, phase: string): Promise<number> {
    const tasks = await this.getTasks(projectId);
    if (tasks.length === 0) return 0;

    const childMap = new Map<string, ScheduleTask[]>();
    tasks.forEach((task) => {
      if (!task.parent_task_id) return;
      if (!childMap.has(task.parent_task_id)) childMap.set(task.parent_task_id, []);
      childMap.get(task.parent_task_id)!.push(task);
    });

    const descendants: ScheduleTask[] = [];
    const stack = [...(childMap.get(parentTaskId) ?? [])];
    const seen = new Set<string>();

    while (stack.length) {
      const current = stack.pop()!;
      if (seen.has(current.id)) continue;
      seen.add(current.id);
      descendants.push(current);
      stack.push(...(childMap.get(current.id) ?? []));
    }

    const targets = descendants.filter((task) => (task.phase || '') !== phase);
    if (targets.length === 0) return 0;

    const operations = targets.map((task) =>
      (supabase.from('tasks') as any)
        .update({ phase })
        .eq('project_id', projectId)
        .eq('id', task.id)
    );

    const results = await Promise.all(operations);
    const failed = results.find((result: any) => result.error);
    if (failed?.error) throw failed.error;

    return targets.length;
  },

  async rollupParentProgress(projectId: string): Promise<void> {
    const tasks = await this.getTasks(projectId);
    const byParent = new Map<string, ScheduleTask[]>();

    tasks.forEach((task) => {
      if (!task.parent_task_id) return;
      if (!byParent.has(task.parent_task_id)) byParent.set(task.parent_task_id, []);
      byParent.get(task.parent_task_id)!.push(task);
    });

    if (byParent.size === 0) return;

    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const parentIds = Array.from(byParent.keys());

    const computeRollup = (parentId: string, guard = new Set<string>()): { percent: number; qtyCompleted: number; qtyPlanned: number } => {
      if (guard.has(parentId)) {
        return { percent: 0, qtyCompleted: 0, qtyPlanned: 0 };
      }

      guard.add(parentId);
      const children = byParent.get(parentId) ?? [];
      if (children.length === 0) return { percent: 0, qtyCompleted: 0, qtyPlanned: 0 };

      let weightedPercentTotal = 0;
      let weightTotal = 0;
      let qtyCompleted = 0;
      let qtyPlanned = 0;

      children.forEach((child) => {
        const childRollup = byParent.has(child.id)
          ? computeRollup(child.id, new Set(guard))
          : {
              percent: child.percent_complete ?? 0,
              qtyCompleted: Number(child.qty_completed ?? 0),
              qtyPlanned: Number(child.qty_planned ?? 0),
            };

        const weight = childRollup.qtyPlanned > 0 ? childRollup.qtyPlanned : 1;
        weightedPercentTotal += childRollup.percent * weight;
        weightTotal += weight;
        qtyCompleted += childRollup.qtyCompleted;
        qtyPlanned += childRollup.qtyPlanned;
      });

      const percent = weightTotal > 0 ? weightedPercentTotal / weightTotal : 0;
      return { percent, qtyCompleted, qtyPlanned };
    };

    const updates = parentIds
      .map((parentId) => {
        const parent = taskMap.get(parentId);
        if (!parent) return null;

        const rollup = computeRollup(parentId);
        const roundedPercent = Math.max(0, Math.min(100, Math.round(rollup.percent * 100) / 100));
        const nextStatus: ScheduleTask['status'] = roundedPercent >= 100
          ? 'completed'
          : roundedPercent > 0
            ? 'in_progress'
            : 'not_started';

        const currentPercent = Number(parent.percent_complete ?? 0);
        const currentQtyCompleted = Number(parent.qty_completed ?? 0);
        const currentQtyPlanned = Number(parent.qty_planned ?? 0);

        const changed =
          Math.abs(currentPercent - roundedPercent) > 0.001 ||
          Math.abs(currentQtyCompleted - rollup.qtyCompleted) > 0.001 ||
          Math.abs(currentQtyPlanned - rollup.qtyPlanned) > 0.001 ||
          parent.status !== nextStatus;

        if (!changed) return null;

        return {
          id: parentId,
          percent_complete: roundedPercent,
          qty_completed: rollup.qtyCompleted,
          qty_planned: rollup.qtyPlanned,
          status: nextStatus,
        };
      })
      .filter(Boolean) as Array<{ id: string; percent_complete: number; qty_completed: number; qty_planned: number; status: ScheduleTask['status'] }>;

    if (updates.length === 0) return;

    const operations = updates.map((item) =>
      (supabase.from('tasks') as any)
        .update({
          percent_complete: item.percent_complete,
          qty_completed: item.qty_completed,
          qty_planned: item.qty_planned,
          status: item.status,
        })
        .eq('project_id', projectId)
        .eq('id', item.id)
    );

    const results = await Promise.all(operations);
    const failed = results.find((result: any) => result.error);
    if (failed?.error) throw failed.error;
  },
};
