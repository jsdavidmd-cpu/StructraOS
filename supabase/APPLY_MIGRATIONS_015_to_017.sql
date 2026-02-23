-- ========================================
-- STRUCTRA MIGRATIONS 015-017
-- ========================================
-- Run this script in Supabase SQL Editor to apply all three migrations at once
-- URL: https://supabase.com/dashboard/project/gwxcvelcwnllrilkotsq/sql/new
--
-- These migrations:
-- 1. Consolidate inventory schema (015)
-- 2. Add unique constraints (016)
-- 3. Add performance indexes (017)
-- ========================================

-- ========================================
-- MIGRATION 015: Consolidate Inventory Schema
-- ========================================
-- Resolves conflict between 001_initial_schema and 011_create_inventory_system
-- Drops old inventory tables and standardizes on the newer schema

DROP TABLE IF EXISTS stock_cards CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS po_items CASCADE;

COMMENT ON TABLE warehouses IS 'Warehouse locations for inventory management (schema from migration 011)';
COMMENT ON TABLE inventory_items IS 'Inventory item master data (schema from migration 011)';
COMMENT ON TABLE stock_levels IS 'Stock quantities per warehouse per item (replaces old inventory_items)';
COMMENT ON TABLE stock_movements IS 'Audit trail for all stock transactions (replaces old stock_cards)';


-- ========================================
-- MIGRATION 016: Add Unique Constraints
-- ========================================
-- Adds unique constraints to prevent duplicate data entry

-- ⚠️ WARNING: This migration will FAIL if duplicate data exists
-- Run supabase/check_duplicates.sql BEFORE this to identify any duplicates

-- Unique constraint for estimate numbers per organization
ALTER TABLE estimates 
ADD CONSTRAINT estimates_estimate_number_org_unique 
UNIQUE (organization_id, estimate_number);

-- Unique constraint for bar marks per estimate
ALTER TABLE bar_schedules 
ADD CONSTRAINT bar_schedules_bar_mark_estimate_unique 
UNIQUE (estimate_id, bar_mark);

-- Unique constraint for project templates per organization
ALTER TABLE project_templates
ADD CONSTRAINT project_templates_name_org_unique
UNIQUE (organization_id, name);

-- Unique constraint for warehouse names per organization (already exists in migration 011)
-- Verify it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'warehouses_organization_id_name_key'
  ) THEN
    ALTER TABLE warehouses ADD CONSTRAINT warehouses_organization_id_name_key UNIQUE (organization_id, name);
  END IF;
END $$;

COMMENT ON CONSTRAINT estimates_estimate_number_org_unique ON estimates 
IS 'Ensures estimate numbers are unique within each organization';

COMMENT ON CONSTRAINT bar_schedules_bar_mark_estimate_unique ON bar_schedules 
IS 'Ensures bar marks are unique within each estimate';

COMMENT ON CONSTRAINT project_templates_name_org_unique ON project_templates 
IS 'Ensures template names are unique within each organization';


-- ========================================
-- MIGRATION 017: Add Missing Indexes
-- ========================================
-- Improves query performance by adding indexes on frequently queried columns

-- Indexes for polymorphic reference fields
CREATE INDEX IF NOT EXISTS idx_assembly_components_ref_type_id 
ON assembly_components(ref_type, ref_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_type_id 
ON stock_movements(reference_type, reference_id);

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
CREATE INDEX IF NOT EXISTS idx_estimates_org_status_created 
ON estimates(organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_org_status 
ON projects(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_inventory_items_category 
ON inventory_items(organization_id, category);

CREATE INDEX IF NOT EXISTS idx_inventory_items_item_code 
ON inventory_items(item_code) 
WHERE item_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stock_levels_item 
ON stock_levels(item_id);

-- Index comments
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


-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- If this script completed without errors, all migrations are applied!
-- Check the results:
SELECT 
  'Migration 015-017 completed successfully!' as status,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM pg_constraint WHERE contype = 'u') as total_unique_constraints;
