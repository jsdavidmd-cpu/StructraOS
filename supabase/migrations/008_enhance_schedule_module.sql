-- ============================================================================
-- SCHEDULE MODULE ENHANCEMENTS (Project-first, comprehensive)
-- ============================================================================

-- Add planning/baseline/resource fields to existing tasks table.
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS baseline_start DATE,
  ADD COLUMN IF NOT EXISTS baseline_end DATE,
  ADD COLUMN IF NOT EXISTS forecast_start DATE,
  ADD COLUMN IF NOT EXISTS forecast_end DATE,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resource_notes TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tasks_priority_check'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_priority_check
      CHECK (priority IN ('low','medium','high','critical'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'tasks_percent_complete_check'
  ) THEN
    ALTER TABLE public.tasks
      ADD CONSTRAINT tasks_percent_complete_check
      CHECK (percent_complete >= 0 AND percent_complete <= 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_sort_order ON public.tasks(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_tasks_project_planned_start ON public.tasks(project_id, planned_start);

COMMENT ON COLUMN public.tasks.baseline_start IS 'Frozen baseline start date for variance tracking';
COMMENT ON COLUMN public.tasks.baseline_end IS 'Frozen baseline end date for variance tracking';
COMMENT ON COLUMN public.tasks.forecast_start IS 'Current forecast start date after revisions';
COMMENT ON COLUMN public.tasks.forecast_end IS 'Current forecast end date after revisions';
COMMENT ON COLUMN public.tasks.resource_notes IS 'Crew/resource leveling and notes';
