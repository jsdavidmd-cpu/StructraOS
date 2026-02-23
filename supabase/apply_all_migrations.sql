-- Migrations 015-016-017 FULLY CORRECTED
-- Based on actual schema

-- Migration 015: Drop old inventory tables
DROP TABLE IF EXISTS stock_cards CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS po_items CASCADE;

-- Migration 016: Add unique constraints
-- estimates: organization_id, estimate_number
ALTER TABLE estimates 
ADD CONSTRAINT estimates_estimate_number_org_unique 
UNIQUE (organization_id, estimate_number);

-- bar_schedules: estimate_id, bar_mark
ALTER TABLE bar_schedules 
ADD CONSTRAINT bar_schedules_bar_mark_estimate_unique 
UNIQUE (estimate_id, bar_mark);

-- project_templates: company_id (NOT organization_id), name
ALTER TABLE project_templates
ADD CONSTRAINT project_templates_name_company_unique
UNIQUE (company_id, name);

-- warehouses: organization_id, name (may already exist)
DO $$
BEGIN
  BEGIN
    ALTER TABLE warehouses ADD CONSTRAINT warehouses_organization_id_name_key UNIQUE (organization_id, name);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- Migration 017: Add missing indexes
-- Based on actual schema
CREATE INDEX IF NOT EXISTS idx_assembly_components_type_ref
ON assembly_components(type, ref_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_ref_type_id
ON stock_movements(reference_type, reference_id);

CREATE INDEX IF NOT EXISTS idx_bar_schedules_bar_mark 
ON bar_schedules(bar_mark);

CREATE INDEX IF NOT EXISTS idx_bar_schedules_estimate_element 
ON bar_schedules(estimate_id, element_type);

CREATE INDEX IF NOT EXISTS idx_boq_items_estimate_section 
ON boq_items(estimate_id, section);

CREATE INDEX IF NOT EXISTS idx_boq_items_estimate_trade 
ON boq_items(estimate_id, trade);

CREATE INDEX IF NOT EXISTS idx_progress_entries_project_date 
ON progress_entries(project_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_progress_entries_boq_date 
ON progress_entries(boq_item_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_workers_organization_trade 
ON workers(organization_id, trade);

CREATE INDEX IF NOT EXISTS idx_formwork_cycles_organization_type 
ON formwork_cycles(organization_id, formwork_type);

CREATE INDEX IF NOT EXISTS idx_estimates_org_status_created 
ON estimates(organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_org_status 
ON projects(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_inventory_items_org_category 
ON inventory_items(organization_id, category);

CREATE INDEX IF NOT EXISTS idx_inventory_items_code 
ON inventory_items(item_code);

CREATE INDEX IF NOT EXISTS idx_stock_levels_item_id 
ON stock_levels(item_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_date 
ON stock_movements(warehouse_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date 
ON stock_movements(item_id, created_at DESC);

-- Verify success
SELECT 'Migrations 015-016-017 COMPLETE!' as status;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE schemaname='public';
SELECT COUNT(*) as unique_constraints FROM information_schema.table_constraints WHERE constraint_type='UNIQUE';
