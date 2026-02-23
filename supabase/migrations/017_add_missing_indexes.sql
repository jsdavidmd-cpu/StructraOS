-- Migration 017: Add Missing Indexes
-- Improves query performance by adding indexes on frequently queried columns

-- Indexes for polymorphic reference fields
CREATE INDEX IF NOT EXISTS idx_assembly_components_ref_type_id 
ON assembly_components(ref_type, ref_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_type_id 
ON stock_movements(reference_type, reference_id);

-- Additional performance indexes

-- Bar schedules - frequently queried by bar mark
CREATE INDEX IF NOT EXISTS idx_bar_schedules_bar_mark 
ON bar_schedules(bar_mark);

CREATE INDEX IF NOT EXISTS idx_bar_schedules_estimate_element 
ON bar_schedules(estimate_id, element_type);

-- BOQ items - frequently filtered by section and trade
CREATE INDEX IF NOT EXISTS idx_boq_items_section 
ON boq_items(estimate_id, section);

CREATE INDEX IF NOT EXISTS idx_boq_items_trade 
ON boq_items(estimate_id, trade);

-- Progress entries - frequently queried by date
CREATE INDEX IF NOT EXISTS idx_progress_entries_date 
ON progress_entries(project_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_progress_entries_boq_date 
ON progress_entries(boq_item_id, date DESC);

-- Schedule tasks - frequently queried by phase and status
CREATE INDEX IF NOT EXISTS idx_schedule_tasks_phase_status 
ON schedule_tasks(project_id, phase, status);

CREATE INDEX IF NOT EXISTS idx_schedule_tasks_parent 
ON schedule_tasks(parent_task_id) 
WHERE parent_task_id IS NOT NULL;

-- Stock movements - frequently queried by date
CREATE INDEX IF NOT EXISTS idx_stock_movements_date 
ON stock_movements(warehouse_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date 
ON stock_movements(item_id, created_at DESC);

-- Workers - frequently searched by trade
CREATE INDEX IF NOT EXISTS idx_workers_trade 
ON workers(organization_id, trade);

-- Formwork cycles - queried by type and status
CREATE INDEX IF NOT EXISTS idx_formwork_cycles_type 
ON formwork_cycles(organization_id, formwork_type);

-- Composite indexes for common query patterns

-- Estimates with status filter
CREATE INDEX IF NOT EXISTS idx_estimates_org_status_created 
ON estimates(organization_id, status, created_at DESC);

-- Projects with status filter
CREATE INDEX IF NOT EXISTS idx_projects_org_status 
ON projects(organization_id, status);

-- Inventory items - frequently searched
CREATE INDEX IF NOT EXISTS idx_inventory_items_category 
ON inventory_items(organization_id, category);

CREATE INDEX IF NOT EXISTS idx_inventory_items_item_code 
ON inventory_items(item_code) 
WHERE item_code IS NOT NULL;

-- Stock levels - frequently joined
CREATE INDEX IF NOT EXISTS idx_stock_levels_item 
ON stock_levels(item_id);

COMMENT ON INDEX idx_assembly_components_ref_type_id 
IS 'Improves polymorphic queries on assembly components';

COMMENT ON INDEX idx_stock_movements_reference_type_id 
IS 'Improves polymorphic queries on stock movements';

COMMENT ON INDEX idx_bar_schedules_bar_mark 
IS 'Speeds up bar mark lookups';

COMMENT ON INDEX idx_progress_entries_date 
IS 'Optimizes time-series queries for progress tracking';

COMMENT ON INDEX idx_schedule_tasks_phase_status 
IS 'Optimizes schedule filtering by phase and status';
