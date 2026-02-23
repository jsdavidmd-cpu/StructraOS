import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { scheduleService, type CrewOption, type ScheduleTask, type ScheduleTaskInput } from '@/services/scheduleService';
import { CalendarDays, Save, Trash2, Workflow, Target, RefreshCw, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';

type FormState = {
  task_name: string;
  description: string;
  planned_start: string;
  planned_end: string;
  forecast_start: string;
  forecast_end: string;
  actual_start: string;
  actual_end: string;
  qty_planned: string;
  qty_completed: string;
  percent_complete: string;
  productivity_rate: string;
  lag_days: string;
  sort_order: string;
  phase: string;
  wbs_code: string;
  parent_task_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  crew_id: string;
  predecessor_ids: string[];
  is_milestone: boolean;
  resource_notes: string;
};

const emptyForm: FormState = {
  task_name: '',
  description: '',
  planned_start: '',
  planned_end: '',
  forecast_start: '',
  forecast_end: '',
  actual_start: '',
  actual_end: '',
  qty_planned: '',
  qty_completed: '',
  percent_complete: '0',
  productivity_rate: '',
  lag_days: '0',
  sort_order: '0',
  phase: 'Execution',
  wbs_code: '',
  parent_task_id: '',
  priority: 'medium',
  status: 'not_started',
  crew_id: '',
  predecessor_ids: [],
  is_milestone: false,
  resource_notes: '',
};

const statusOptions: Array<FormState['status']> = ['not_started', 'in_progress', 'completed', 'on_hold'];
const priorityOptions: Array<FormState['priority']> = ['low', 'medium', 'high', 'critical'];

const toIsoDate = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const toNumberOrNull = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const computeDuration = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 0;
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
};

const computeCriticalPath = (tasks: ScheduleTask[]) => {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));
  const indegree = new Map<string, number>(tasks.map((task) => [task.id, 0]));
  const graph = new Map<string, string[]>(tasks.map((task) => [task.id, []]));

  tasks.forEach((task) => {
    (task.predecessor_ids ?? []).forEach((predId) => {
      if (!taskMap.has(predId)) return;
      graph.get(predId)?.push(task.id);
      indegree.set(task.id, (indegree.get(task.id) ?? 0) + 1);
    });
  });

  const queue = tasks.filter((task) => (indegree.get(task.id) ?? 0) === 0).map((task) => task.id);
  const topo: string[] = [];

  while (queue.length) {
    const current = queue.shift()!;
    topo.push(current);
    for (const next of graph.get(current) ?? []) {
      indegree.set(next, (indegree.get(next) ?? 0) - 1);
      if ((indegree.get(next) ?? 0) === 0) queue.push(next);
    }
  }

  if (topo.length !== tasks.length) return new Set<string>();

  const duration = (id: string) => {
    const task = taskMap.get(id)!;
    return task.planned_duration || computeDuration(task.planned_start, task.planned_end) || 1;
  };

  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  topo.forEach((id) => {
    const task = taskMap.get(id)!;
    const predFinish = (task.predecessor_ids ?? [])
      .map((predId) => ef.get(predId) ?? 0)
      .reduce((max, value) => Math.max(max, value), 0);
    es.set(id, predFinish);
    ef.set(id, predFinish + duration(id));
  });

  const projectDuration = Math.max(...Array.from(ef.values()), 0);
  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  [...topo].reverse().forEach((id) => {
    const successors = graph.get(id) ?? [];
    const latestFinish = successors.length === 0
      ? projectDuration
      : Math.min(...successors.map((succId) => ls.get(succId) ?? projectDuration));
    lf.set(id, latestFinish);
    ls.set(id, latestFinish - duration(id));
  });

  const critical = new Set<string>();
  tasks.forEach((task) => {
    const floatDays = (ls.get(task.id) ?? 0) - (es.get(task.id) ?? 0);
    if (Math.abs(floatDays) < 0.0001) critical.add(task.id);
  });

  return critical;
};

export default function SchedulePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);

  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [crews, setCrews] = useState<CrewOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverPlacement, setDragOverPlacement] = useState<'before' | 'after' | 'child' | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkPhase, setBulkPhase] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    if (!projectId || !profile?.organization_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const [taskRows, crewRows] = await Promise.all([
        scheduleService.getTasks(projectId),
        scheduleService.getCrews(profile.organization_id),
      ]);
      setTasks(taskRows);
      setCrews(crewRows);
    } catch (err: any) {
      console.error('Failed to load schedule data:', err);
      setError(err.message || 'Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [projectId, profile?.organization_id]);

  const criticalPathIds = useMemo(() => computeCriticalPath(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.task_name.toLowerCase().includes(search.toLowerCase())
        || (task.description ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPhase = !phaseFilter || (task.phase || 'Unassigned') === phaseFilter;
      const matchesCritical = !showCriticalOnly || criticalPathIds.has(task.id);
      return matchesSearch && matchesStatus && matchesPhase && matchesCritical;
    });
  }, [tasks, search, statusFilter, phaseFilter, showCriticalOnly, criticalPathIds]);

  const phaseOptions = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.phase || 'Unassigned'))).sort((a, b) => a.localeCompare(b)),
    [tasks]
  );

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, ScheduleTask[]>();
    filteredTasks.forEach((task) => {
      const key = task.phase || 'Unassigned';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(task);
    });
    return Array.from(groups.entries())
      .map(([phase, phaseTasks]) => [phase, phaseTasks.sort((a, b) => a.sort_order - b.sort_order)] as const)
      .sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTasks]);

  useEffect(() => {
    const childCounts: Record<string, number> = {};
    filteredTasks.forEach((task) => {
      if (!task.parent_task_id) return;
      childCounts[task.parent_task_id] = (childCounts[task.parent_task_id] ?? 0) + 1;
    });

    setExpandedParents((prev) => {
      const next = { ...prev };
      Object.keys(childCounts).forEach((taskId) => {
        if (next[taskId] === undefined) next[taskId] = true;
      });
      return next;
    });
  }, [filteredTasks]);

  const groupedTreeRows = useMemo(() => {
    return groupedTasks.map(([phase, phaseTasks]) => {
      const taskMap = new Map(phaseTasks.map((task) => [task.id, task]));
      const childMap = new Map<string, ScheduleTask[]>();

      phaseTasks.forEach((task) => {
        if (!task.parent_task_id || !taskMap.has(task.parent_task_id)) return;
        if (!childMap.has(task.parent_task_id)) childMap.set(task.parent_task_id, []);
        childMap.get(task.parent_task_id)!.push(task);
      });

      childMap.forEach((children) => children.sort((a, b) => a.sort_order - b.sort_order));

      const roots = phaseTasks
        .filter((task) => !task.parent_task_id || !taskMap.has(task.parent_task_id))
        .sort((a, b) => a.sort_order - b.sort_order);

      const rows: Array<{ task: ScheduleTask; depth: number; hasChildren: boolean }> = [];

      const visit = (task: ScheduleTask, depth: number) => {
        const children = childMap.get(task.id) ?? [];
        const hasChildren = children.length > 0;
        rows.push({ task, depth, hasChildren });
        if (!hasChildren) return;
        if (expandedParents[task.id] === false) return;
        children.forEach((child) => visit(child, depth + 1));
      };

      roots.forEach((rootTask) => visit(rootTask, 0));
      return [phase, rows] as const;
    });
  }, [groupedTasks, expandedParents]);

  useEffect(() => {
    const visibleIds = new Set(filteredTasks.map((task) => task.id));
    setSelectedTaskIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [filteredTasks]);

  const orderedTasks = useMemo(() => [...tasks].sort((a, b) => a.sort_order - b.sort_order), [tasks]);

  const summary = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'completed').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const delayed = tasks.filter((task) => {
      if (!task.planned_end) return false;
      const plannedEnd = new Date(task.planned_end);
      return plannedEnd < new Date() && (task.percent_complete ?? 0) < 100;
    }).length;

    const completedWithBaseline = tasks.filter((task) => task.status === 'completed' && task.baseline_end && task.actual_end);
    const varianceDays = completedWithBaseline.length === 0
      ? 0
      : completedWithBaseline.reduce((sum, task) => {
          const baselineEnd = new Date(task.baseline_end!);
          const actualEnd = new Date(task.actual_end!);
          return sum + Math.round((actualEnd.getTime() - baselineEnd.getTime()) / 86400000);
        }, 0) / completedWithBaseline.length;

    return {
      total,
      completed,
      inProgress,
      delayed,
      critical: criticalPathIds.size,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
      varianceDays: Math.round(varianceDays * 10) / 10,
    };
  }, [tasks, criticalPathIds]);

  const timelineRange = useMemo(() => {
    const dates = tasks.flatMap((task) => [task.baseline_start, task.baseline_end, task.planned_start, task.planned_end, task.actual_start, task.actual_end]).filter(Boolean) as string[];
    if (dates.length === 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end, totalDays: 30 };
    }

    const sorted = dates.map((value) => new Date(value)).sort((a, b) => a.getTime() - b.getTime());
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
    return { start, end, totalDays };
  }, [tasks]);

  const toPayload = (): ScheduleTaskInput | null => {
    if (!projectId || !user?.id) return null;
    if (!form.task_name.trim()) return null;

    return {
      project_id: projectId,
      task_name: form.task_name.trim(),
      description: form.description.trim() || null,
      planned_start: form.planned_start || null,
      planned_end: form.planned_end || null,
      forecast_start: form.forecast_start || null,
      forecast_end: form.forecast_end || null,
      actual_start: form.actual_start || null,
      actual_end: form.actual_end || null,
      qty_planned: toNumberOrNull(form.qty_planned),
      qty_completed: toNumberOrNull(form.qty_completed),
      percent_complete: toNumberOrNull(form.percent_complete),
      productivity_rate: toNumberOrNull(form.productivity_rate),
      phase: form.phase.trim() || null,
      wbs_code: form.wbs_code.trim() || null,
      parent_task_id: form.parent_task_id || null,
      lag_days: toNumberOrNull(form.lag_days),
      sort_order: toNumberOrNull(form.sort_order) ?? 0,
      priority: form.priority,
      status: form.status,
      crew_id: form.crew_id || null,
      predecessor_ids: form.predecessor_ids,
      is_milestone: form.is_milestone,
      resource_notes: form.resource_notes.trim() || null,
      created_by: user.id,
    };
  };

  const resetEditor = () => {
    setActiveTaskId(null);
    setForm(emptyForm);
  };

  const editTask = (task: ScheduleTask) => {
    setActiveTaskId(task.id);
    setForm({
      task_name: task.task_name || '',
      description: task.description || '',
      planned_start: toIsoDate(task.planned_start),
      planned_end: toIsoDate(task.planned_end),
      forecast_start: toIsoDate(task.forecast_start),
      forecast_end: toIsoDate(task.forecast_end),
      actual_start: toIsoDate(task.actual_start),
      actual_end: toIsoDate(task.actual_end),
      qty_planned: task.qty_planned?.toString() || '',
      qty_completed: task.qty_completed?.toString() || '',
      percent_complete: task.percent_complete?.toString() || '0',
      productivity_rate: task.productivity_rate?.toString() || '',
      phase: task.phase || 'Execution',
      wbs_code: task.wbs_code || '',
      parent_task_id: task.parent_task_id || '',
      lag_days: task.lag_days?.toString() || '0',
      sort_order: task.sort_order?.toString() || '0',
      priority: task.priority || 'medium',
      status: task.status || 'not_started',
      crew_id: task.crew_id || '',
      predecessor_ids: task.predecessor_ids || [],
      is_milestone: Boolean(task.is_milestone),
      resource_notes: task.resource_notes || '',
    });
  };

  const saveTask = async () => {
    const payload = toPayload();
    if (!payload) {
      setError('Task name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      let cascadeAppliedCount = 0;

      if (activeTaskId) {
        const originalTask = tasks.find((task) => task.id === activeTaskId);
        await scheduleService.updateTask(activeTaskId, payload);

        if (
          projectId &&
          originalTask &&
          (originalTask.phase || '') !== (payload.phase || '')
        ) {
          const hasChildren = tasks.some((task) => task.parent_task_id === activeTaskId);
          if (hasChildren) {
            const shouldCascade = window.confirm('Parent phase changed. Cascade this phase to all descendants?');
            if (shouldCascade && payload.phase) {
              cascadeAppliedCount = await scheduleService.cascadeTaskPhase(projectId, activeTaskId, payload.phase);
            }
          }
        }

        setSuccess('Task updated successfully.');
      } else {
        await scheduleService.createTask(payload);
        setSuccess('Task created successfully.');
      }

      if (projectId) {
        await scheduleService.renumberWbsCodes(projectId);
        await scheduleService.rollupParentProgress(projectId);
        await loadData();
      }

      if (cascadeAppliedCount > 0) {
        setSuccess(`Task updated. Cascaded phase to ${cascadeAppliedCount} descendant task(s).`);
      }

      resetEditor();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const removeTask = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await scheduleService.deleteTask(taskId);
      if (projectId) {
        await scheduleService.renumberWbsCodes(projectId);
        await scheduleService.rollupParentProgress(projectId);
        await loadData();
      }
      if (activeTaskId === taskId) resetEditor();
      setSuccess('Task deleted successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const generateFromBoq = async () => {
    if (!projectId || !user?.id) return;
    try {
      setSaving(true);
      const inserted = await scheduleService.generateTasksFromBOQ(projectId, user.id);
      setSuccess(inserted > 0 ? `${inserted} task(s) generated from latest BOQ.` : 'No new BOQ tasks to generate.');
      await scheduleService.renumberWbsCodes(projectId);
      await scheduleService.rollupParentProgress(projectId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to generate tasks from BOQ');
    } finally {
      setSaving(false);
    }
  };

  const renumberWbs = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      await scheduleService.renumberWbsCodes(projectId);
      await loadData();
      setSuccess('WBS codes renumbered.');
    } catch (err: any) {
      setError(err.message || 'Failed to renumber WBS codes');
    } finally {
      setSaving(false);
    }
  };

  const captureBaseline = async () => {
    if (!projectId) return;
    try {
      setSaving(true);
      await scheduleService.captureBaseline(projectId);
      setSuccess('Baseline captured for available tasks.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to capture baseline');
    } finally {
      setSaving(false);
    }
  };

  const isDescendant = (candidateId: string, ancestorId: string) => {
    const byParent = new Map<string, string[]>();
    tasks.forEach((task) => {
      if (!task.parent_task_id) return;
      if (!byParent.has(task.parent_task_id)) byParent.set(task.parent_task_id, []);
      byParent.get(task.parent_task_id)!.push(task.id);
    });

    const stack = [...(byParent.get(ancestorId) ?? [])];
    const seen = new Set<string>();
    while (stack.length) {
      const current = stack.pop()!;
      if (seen.has(current)) continue;
      seen.add(current);
      if (current === candidateId) return true;
      stack.push(...(byParent.get(current) ?? []));
    }
    return false;
  };

  const dropTask = async (targetTaskId: string, position: 'before' | 'after' | 'child') => {
    if (!projectId || !draggedTaskId || draggedTaskId === targetTaskId) return;

    const working = [...orderedTasks];
    const draggedIndex = working.findIndex((task) => task.id === draggedTaskId);
    const targetIndex = working.findIndex((task) => task.id === targetTaskId);
    if (draggedIndex < 0 || targetIndex < 0) return;

    const [draggedTask] = working.splice(draggedIndex, 1);
    const targetTask = tasks.find((task) => task.id === targetTaskId);

    if (position === 'child') {
      if (isDescendant(targetTaskId, draggedTaskId)) {
        setError('Cannot move task under its own descendant.');
        setDraggedTaskId(null);
        setDragOverTaskId(null);
        setDragOverPlacement(null);
        return;
      }
    }

    let nextTargetIndex = working.findIndex((task) => task.id === targetTaskId);
    if (nextTargetIndex < 0) nextTargetIndex = working.length;
    const insertionIndex = position === 'before' ? nextTargetIndex : nextTargetIndex + 1;
    working.splice(insertionIndex, 0, draggedTask);

    const nextParentId = position === 'child' ? targetTaskId : draggedTask.parent_task_id;

    try {
      setSaving(true);
      setError('');
      await scheduleService.resequenceTasks(projectId, working.map((task) => task.id));

      if (draggedTask.parent_task_id !== nextParentId) {
        await scheduleService.updateTask(draggedTask.id, {
          parent_task_id: nextParentId,
          phase: position === 'child' ? targetTask?.phase || draggedTask.phase : draggedTask.phase,
        });
      }

      await scheduleService.renumberWbsCodes(projectId);
      await scheduleService.rollupParentProgress(projectId);
      await loadData();
      setSuccess(position === 'child' ? 'Task nested under selected parent.' : 'Task order updated.');
    } catch (err: any) {
      setError(err.message || 'Failed to reorder tasks');
    } finally {
      setSaving(false);
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      setDragOverPlacement(null);
    }
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedParents((prev) => ({ ...prev, [taskId]: prev[taskId] === false }));
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]));
  };

  const selectVisibleTasks = () => {
    setSelectedTaskIds(filteredTasks.map((task) => task.id));
  };

  const clearSelectedTasks = () => {
    setSelectedTaskIds([]);
  };

  const applyPhaseToSelected = async () => {
    if (!projectId) return;
    if (!bulkPhase.trim()) {
      setError('Enter a phase to apply.');
      return;
    }
    if (selectedTaskIds.length === 0) {
      setError('Select at least one task.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const appliedCount = await scheduleService.bulkUpdateTaskPhase(projectId, selectedTaskIds, bulkPhase.trim());

      const shouldCascade = window.confirm('Also cascade this phase to descendants of selected parent tasks?');
      let cascaded = 0;
      if (shouldCascade) {
        for (const taskId of selectedTaskIds) {
          cascaded += await scheduleService.cascadeTaskPhase(projectId, taskId, bulkPhase.trim());
        }
      }

      await scheduleService.renumberWbsCodes(projectId);
      await scheduleService.rollupParentProgress(projectId);
      await loadData();

      setSuccess(`Applied phase to ${appliedCount} task(s)${cascaded > 0 ? ` and cascaded to ${cascaded} descendant task(s)` : ''}.`);
      setSelectedTaskIds([]);
    } catch (err: any) {
      setError(err.message || 'Failed to apply phase to selected tasks');
    } finally {
      setSaving(false);
    }
  };

  if (!projectId) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Project Scheduling</h2>
        <p className="text-muted-foreground">Open a specific project to manage schedules.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Scheduling</h2>
          <p className="text-muted-foreground">Comprehensive planning with dependencies, critical path, baseline tracking, and BOQ-driven task generation.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void generateFromBoq()} disabled={saving}>
            <Workflow className="h-4 w-4 mr-2" />
            Generate from BOQ
          </Button>
          <Button variant="outline" onClick={() => void renumberWbs()} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Renumber WBS
          </Button>
          <Button variant="outline" onClick={() => void captureBaseline()} disabled={saving}>
            <Target className="h-4 w-4 mr-2" />
            Capture Baseline
          </Button>
          <Button variant="outline" onClick={() => void loadData()} disabled={loading || saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Tasks</p><p className="text-2xl font-bold">{summary.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Completion</p><p className="text-2xl font-bold">{summary.completionRate}%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{summary.inProgress}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Delayed</p><p className="text-2xl font-bold text-red-600">{summary.delayed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Critical Tasks</p><p className="text-2xl font-bold text-amber-600">{summary.critical}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Avg Variance</p><p className="text-2xl font-bold">{summary.varianceDays}d</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>{activeTaskId ? 'Edit Task' : 'Create Task'}</CardTitle>
            <CardDescription>Define dates, dependencies, resources, and progress metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Task Name</Label><Input value={form.task_name} onChange={(e) => setForm((prev) => ({ ...prev, task_name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Planned Start</Label><Input type="date" value={form.planned_start} onChange={(e) => setForm((prev) => ({ ...prev, planned_start: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Planned End</Label><Input type="date" value={form.planned_end} onChange={(e) => setForm((prev) => ({ ...prev, planned_end: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Forecast Start</Label><Input type="date" value={form.forecast_start} onChange={(e) => setForm((prev) => ({ ...prev, forecast_start: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Forecast End</Label><Input type="date" value={form.forecast_end} onChange={(e) => setForm((prev) => ({ ...prev, forecast_end: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Actual Start</Label><Input type="date" value={form.actual_start} onChange={(e) => setForm((prev) => ({ ...prev, actual_start: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Actual End</Label><Input type="date" value={form.actual_end} onChange={(e) => setForm((prev) => ({ ...prev, actual_end: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label>Phase</Label><Input value={form.phase} onChange={(e) => setForm((prev) => ({ ...prev, phase: e.target.value }))} placeholder="e.g., Substructure" /></div>
              <div className="space-y-1"><Label>WBS Code</Label><Input value={form.wbs_code} onChange={(e) => setForm((prev) => ({ ...prev, wbs_code: e.target.value }))} placeholder="e.g., 2.3.1" /></div>
              <div className="space-y-1"><Label>Qty Planned</Label><Input type="number" value={form.qty_planned} onChange={(e) => setForm((prev) => ({ ...prev, qty_planned: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Qty Completed</Label><Input type="number" value={form.qty_completed} onChange={(e) => setForm((prev) => ({ ...prev, qty_completed: e.target.value }))} /></div>
              <div className="space-y-1"><Label>% Complete</Label><Input type="number" min="0" max="100" value={form.percent_complete} onChange={(e) => setForm((prev) => ({ ...prev, percent_complete: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Productivity Rate</Label><Input type="number" value={form.productivity_rate} onChange={(e) => setForm((prev) => ({ ...prev, productivity_rate: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Lag Days</Label><Input type="number" value={form.lag_days} onChange={(e) => setForm((prev) => ({ ...prev, lag_days: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Sort Order</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm((prev) => ({ ...prev, sort_order: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Status</Label>
                <select className="w-full border rounded-md px-3 py-2 bg-background" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as FormState['status'] }))}>
                  {statusOptions.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <select className="w-full border rounded-md px-3 py-2 bg-background" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as FormState['priority'] }))}>
                  {priorityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Crew</Label>
              <select className="w-full border rounded-md px-3 py-2 bg-background" value={form.crew_id} onChange={(e) => setForm((prev) => ({ ...prev, crew_id: e.target.value }))}>
                <option value="">Unassigned</option>
                {crews.map((crew) => <option key={crew.id} value={crew.id}>{crew.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Predecessors</Label>
              <select
                multiple
                className="w-full border rounded-md px-3 py-2 bg-background min-h-24"
                value={form.predecessor_ids}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                  setForm((prev) => ({ ...prev, predecessor_ids: selected }));
                }}
              >
                {tasks
                  .filter((task) => task.id !== activeTaskId)
                  .map((task) => <option key={task.id} value={task.id}>{task.task_name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Parent Task</Label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={form.parent_task_id}
                onChange={(e) => {
                  const nextParentId = e.target.value;
                  const parent = tasks.find((task) => task.id === nextParentId);
                  setForm((prev) => ({
                    ...prev,
                    parent_task_id: nextParentId,
                    phase: nextParentId && parent?.phase ? parent.phase : prev.phase,
                  }));
                }}
              >
                <option value="">None</option>
                {tasks
                  .filter((task) => task.id !== activeTaskId)
                  .map((task) => <option key={task.id} value={task.id}>{task.wbs_code ? `${task.wbs_code} - ` : ''}{task.task_name}</option>)}
              </select>
            </div>

            <div className="space-y-1"><Label>Resource Notes</Label><Input value={form.resource_notes} onChange={(e) => setForm((prev) => ({ ...prev, resource_notes: e.target.value }))} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_milestone} onChange={(e) => setForm((prev) => ({ ...prev, is_milestone: e.target.checked }))} /> Milestone</label>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => void saveTask()} disabled={saving} className="flex-1"><Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : activeTaskId ? 'Update Task' : 'Create Task'}</Button>
              {activeTaskId && <Button variant="outline" onClick={resetEditor}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Task Register</CardTitle>
            <CardDescription>Dependencies, progress status, and project timeline tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Search task..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select className="w-full border rounded-md px-3 py-2 bg-background" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                {statusOptions.map((option) => <option key={option} value={option}>{option.replace('_', ' ')}</option>)}
              </select>
              <select className="w-full border rounded-md px-3 py-2 bg-background" value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)}>
                <option value="">All Phases</option>
                {phaseOptions.map((phase) => <option key={phase} value={phase}>{phase}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm border rounded-md px-3 py-2"><input type="checkbox" checked={showCriticalOnly} onChange={(e) => setShowCriticalOnly(e.target.checked)} />Critical path only</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <Input placeholder="Phase for selected tasks" value={bulkPhase} onChange={(e) => setBulkPhase(e.target.value)} />
              <Button variant="outline" onClick={selectVisibleTasks} disabled={loading || filteredTasks.length === 0}>Select Visible ({filteredTasks.length})</Button>
              <Button variant="outline" onClick={clearSelectedTasks} disabled={selectedTaskIds.length === 0}>Clear Selection ({selectedTaskIds.length})</Button>
              <Button onClick={() => void applyPhaseToSelected()} disabled={saving || selectedTaskIds.length === 0}>Apply Phase to Selected</Button>
            </div>
            <p className="text-xs text-muted-foreground">Drag to reorder. Drop on the right side of a row to nest as child task.</p>

            {loading ? (
              <p className="text-muted-foreground">Loading schedule...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-muted-foreground">No tasks found.</p>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-xs font-medium">
                  <div className="col-span-4">Task</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Progress</div>
                  <div className="col-span-2">Dates</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                {groupedTreeRows.map(([phase, rows]) => (
                  <div key={phase}>
                    <div className="px-3 py-2 border-t bg-muted/20 text-xs font-semibold uppercase tracking-wide">{phase}</div>
                    {rows.map(({ task, depth, hasChildren }) => (
                      <div
                        key={task.id}
                        className={`grid grid-cols-12 px-3 py-2 border-t text-sm items-center ${dragOverTaskId === task.id ? 'bg-accent/40' : ''} ${dragOverTaskId === task.id && dragOverPlacement === 'child' ? 'outline outline-1 outline-primary/50' : ''}`}
                        draggable
                        onDragStart={(e) => {
                          const source = e.target as HTMLElement;
                          if (source.closest('button,input,select,label')) {
                            e.preventDefault();
                            return;
                          }
                          setDraggedTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverTaskId(null);
                          setDragOverPlacement(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverTaskId(task.id);
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const isChildZone = e.clientX > rect.left + rect.width * 0.72;
                          const placement = isChildZone
                            ? 'child'
                            : e.clientY < rect.top + rect.height / 2
                              ? 'before'
                              : 'after';
                          setDragOverPlacement(placement);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const isChildZone = e.clientX > rect.left + rect.width * 0.72;
                          const position = isChildZone
                            ? 'child'
                            : e.clientY < rect.top + rect.height / 2
                              ? 'before'
                              : 'after';
                          void dropTask(task.id, position);
                        }}
                      >
                        <div className="col-span-4 min-w-0">
                          <div className="flex items-center gap-1 min-w-0" style={{ marginLeft: `${depth * 14}px` }}>
                            <input type="checkbox" checked={selectedTaskIds.includes(task.id)} onChange={() => toggleTaskSelection(task.id)} />
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                            {hasChildren ? (
                              <button type="button" className="p-0.5 rounded hover:bg-accent" onClick={() => toggleExpanded(task.id)}>
                                {expandedParents[task.id] === false ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                            ) : (
                              <span className="inline-block w-4" />
                            )}
                            <p className={`font-medium truncate ${criticalPathIds.has(task.id) ? 'text-amber-600' : ''}`}>{task.wbs_code ? `${task.wbs_code} · ` : ''}{task.task_name}</p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{task.predecessor_ids.length} predecessor(s) • {task.priority}</p>
                        </div>
                        <div className="col-span-2">{task.status.replace('_', ' ')}</div>
                        <div className="col-span-2">{Math.round(task.percent_complete ?? 0)}%</div>
                        <div className="col-span-2 text-xs text-muted-foreground">{task.planned_start ? `${toIsoDate(task.planned_start)} → ${toIsoDate(task.planned_end)}` : 'No dates'}</div>
                        <div className="col-span-2 flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => editTask(task)}>Edit</Button>
                          <Button size="sm" variant="outline" onClick={() => void removeTask(task.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <CardTitle>Gantt Timeline</CardTitle>
          </div>
          <CardDescription>
            Blue = planned, gray = baseline, green = actual. Critical path tasks are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <p className="text-muted-foreground">No tasks available for timeline.</p>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Window: {timelineRange.start.toLocaleDateString()} to {timelineRange.end.toLocaleDateString()} ({timelineRange.totalDays} days)
              </div>
              {filteredTasks.map((task) => {
                const computeBar = (start?: string | null, end?: string | null) => {
                  if (!start || !end) return null;
                  const s = new Date(start);
                  const e = new Date(end);
                  const offset = ((s.getTime() - timelineRange.start.getTime()) / 86400000 / timelineRange.totalDays) * 100;
                  const width = ((e.getTime() - s.getTime()) / 86400000 + 1) / timelineRange.totalDays * 100;
                  return { left: `${Math.max(0, offset)}%`, width: `${Math.max(1, width)}%` };
                };

                const baselineBar = computeBar(task.baseline_start, task.baseline_end);
                const plannedBar = computeBar(task.planned_start, task.planned_end);
                const actualBar = computeBar(task.actual_start, task.actual_end);

                return (
                  <div key={task.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`font-medium ${criticalPathIds.has(task.id) ? 'text-amber-600' : ''}`}>{task.task_name}</span>
                      <span className="text-muted-foreground">{Math.round(task.percent_complete ?? 0)}%</span>
                    </div>
                    <div className="relative h-7 rounded-md bg-muted/40 border overflow-hidden">
                      {baselineBar && <div className="absolute top-1 h-1.5 rounded bg-slate-400" style={baselineBar} />}
                      {plannedBar && <div className="absolute top-3 h-2 rounded bg-blue-500/80" style={plannedBar} />}
                      {actualBar && <div className="absolute top-5 h-1.5 rounded bg-emerald-500" style={actualBar} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
