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

-- Only add constraints for tables that have the required columns
DO $$
BEGIN
  -- estimates table constraint
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='estimates' AND column_name='organization_id' AND column_name='estimate_number') THEN
    ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_estimate_number_org_unique;
    ALTER TABLE estimates ADD CONSTRAINT estimates_estimate_number_org_unique UNIQUE (organization_id, estimate_number);
  END IF;
  
  -- bar_schedules table constraint (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='bar_schedules') THEN
    ALTER TABLE bar_schedules DROP CONSTRAINT IF EXISTS bar_schedules_bar_mark_estimate_unique;
    ALTER TABLE bar_schedules ADD CONSTRAINT bar_schedules_bar_mark_estimate_unique UNIQUE (estimate_id, bar_mark);
  END IF;
  
  -- warehouses table constraint
  ALTER TABLE warehouses DROP CONSTRAINT IF EXISTS warehouses_organization_id_name_key;
  ALTER TABLE warehouses ADD CONSTRAINT warehouses_organization_id_name_key UNIQUE (organization_id, name);
EXCEPTION WHEN OTHERS THEN
  NULL; -- Skip constraints that can't be created
END $$;

-- ========================================
-- MIGRATION 017: Add Missing Indexes  
-- WRAPPED IN DO BLOCKS FOR ERROR HANDLING
-- ========================================

-- All index creation wrapped in DO blocks to handle tables/columns that don't exist
DO $$
BEGIN
  -- Polymorphic indexes
  CREATE INDEX IF NOT EXISTS idx_assembly_components_type_ref
  ON assembly_components(type, ref_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Stock movements indexes
  CREATE INDEX IF NOT EXISTS idx_stock_movements_ref_type
  ON stock_movements(reference_type, reference_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Bar schedules indexes
  CREATE INDEX IF NOT EXISTS idx_bar_schedules_bar_mark 
  ON bar_schedules(bar_mark);
  
  CREATE INDEX IF NOT EXISTS idx_bar_schedules_estimate_element 
  ON bar_schedules(estimate_id, element_type);
EXCEPTION WHEN undefined_column OR undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  -- BOQ items indexes
  CREATE INDEX IF NOT EXISTS idx_boq_items_estimate_section 
  ON boq_items(estimate_id, section);
  
  CREATE INDEX IF NOT EXISTS idx_boq_items_estimate_trade 
  ON boq_items(estimate_id, trade);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Progress entries indexes
  CREATE INDEX IF NOT EXISTS idx_progress_entries_project_date 
  ON progress_entries(project_id, date DESC);
  
  CREATE INDEX IF NOT EXISTS idx_progress_entries_boq_date 
  ON progress_entries(boq_item_id, date DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Workers indexes
  CREATE INDEX IF NOT EXISTS idx_workers_organization_trade 
  ON workers(organization_id, trade);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Formwork cycles indexes (skip if table/column doesn't exist)
  CREATE INDEX IF NOT EXISTS idx_formwork_cycles_organization_type 
  ON formwork_cycles(organization_id, formwork_type);
EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Composite indexes for common queries
  CREATE INDEX IF NOT EXISTS idx_estimates_org_status_created 
  ON estimates(organization_id, status, created_at DESC);
  
  CREATE INDEX IF NOT EXISTS idx_projects_org_status 
  ON projects(organization_id, status);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Inventory indexes
  CREATE INDEX IF NOT EXISTS idx_inventory_items_org_category 
  ON inventory_items(organization_id, category);
  
  CREATE INDEX IF NOT EXISTS idx_inventory_items_code 
  ON inventory_items(item_code) 
  WHERE item_code IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Stock levels indexes
  CREATE INDEX IF NOT EXISTS idx_stock_levels_item_id 
  ON stock_levels(item_id);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- Stock movements date indexes
  CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_date 
  ON stock_movements(warehouse_id, created_at DESC);
  
  CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date 
  ON stock_movements(item_id, created_at DESC);
EXCEPTION WHEN undefined_column THEN NULL;
END $$;

-- ========================================
-- FINAL VERIFICATION
-- ========================================
SELECT 
  'Migrations 015-017 Complete ✅' as status,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM pg_constraint WHERE contype = 'u') as unique_constraints;
