-- ============================================================================
-- SCHEDULE MODULE: WBS + PHASE STRUCTURING
-- ============================================================================

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'Execution',
  ADD COLUMN IF NOT EXISTS wbs_code TEXT,
  ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tasks_parent_not_self_check'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_parent_not_self_check
      CHECK (parent_task_id IS NULL OR parent_task_id <> id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_project_phase ON public.tasks(project_id, phase);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_wbs_code ON public.tasks(project_id, wbs_code);

COMMENT ON COLUMN public.tasks.phase IS 'Primary schedule phase bucket (e.g., Preliminaries, Substructure, Superstructure)';
COMMENT ON COLUMN public.tasks.wbs_code IS 'Work Breakdown Structure code (e.g., 1.2.3)';
COMMENT ON COLUMN public.tasks.parent_task_id IS 'Optional parent task for hierarchy rollups';
