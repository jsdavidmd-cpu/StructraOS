-- ========================================
-- MIGRATION 015, 016, 017
-- CORRECTED FOR ACTUAL SCHEMA
-- ========================================

-- ========================================
-- MIGRATION 015: Consolidate Inventory Schema
-- ========================================
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
ALTER TABLE estimates 
ADD CONSTRAINT estimates_estimate_number_org_unique 
UNIQUE (organization_id, estimate_number);

ALTER TABLE bar_schedules 
ADD CONSTRAINT bar_schedules_bar_mark_estimate_unique 
UNIQUE (estimate_id, bar_mark);

ALTER TABLE project_templates
ADD CONSTRAINT project_templates_name_org_unique
UNIQUE (organization_id, name);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'warehouses_organization_id_name_key'
  ) THEN
    ALTER TABLE warehouses ADD CONSTRAINT warehouses_organization_id_name_key UNIQUE (organization_id, name);
  END IF;
END $$;

-- ========================================
-- MIGRATION 017: Add Missing Indexes
-- CORRECTED FOR ACTUAL SCHEMA
-- ========================================

-- Polymorphic indexes - CORRECTED (column is 'type' not 'ref_type')
CREATE INDEX IF NOT EXISTS idx_assembly_components_type_ref
ON assembly_components(type, ref_id);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_ref_type
ON stock_movements(reference_type, reference_id);

-- Bar schedules indexes
CREATE INDEX IF NOT EXISTS idx_bar_schedules_bar_mark 
ON bar_schedules(bar_mark);

CREATE INDEX IF NOT EXISTS idx_bar_schedules_estimate_element 
ON bar_schedules(estimate_id, element_type);

-- BOQ items indexes
CREATE INDEX IF NOT EXISTS idx_boq_items_estimate_section 
ON boq_items(estimate_id, section);

CREATE INDEX IF NOT EXISTS idx_boq_items_estimate_trade 
ON boq_items(estimate_id, trade);

-- Progress entries indexes
CREATE INDEX IF NOT EXISTS idx_progress_entries_project_date 
ON progress_entries(project_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_progress_entries_boq_date 
ON progress_entries(boq_item_id, date DESC);

-- Workers indexes
CREATE INDEX IF NOT EXISTS idx_workers_organization_trade 
ON workers(organization_id, trade);

-- Formwork cycles indexes
CREATE INDEX IF NOT EXISTS idx_formwork_cycles_organization_type 
ON formwork_cycles(organization_id, formwork_type);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_estimates_org_status_created 
ON estimates(organization_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_org_status 
ON projects(organization_id, status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_org_category 
ON inventory_items(organization_id, category);

CREATE INDEX IF NOT EXISTS idx_inventory_items_code 
ON inventory_items(item_code) 
WHERE item_code IS NOT NULL;

-- Stock levels indexes
CREATE INDEX IF NOT EXISTS idx_stock_levels_item_id 
ON stock_levels(item_id);

-- Stock movements date indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_date 
ON stock_movements(warehouse_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date 
ON stock_movements(item_id, created_at DESC);

-- ========================================
-- FINAL VERIFICATION
-- ========================================
SELECT 
  'Migrations Complete ✅' as status,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM pg_constraint WHERE table_catalog = 'postgres' AND constraint_type = 'UNIQUE') as unique_constraints;
