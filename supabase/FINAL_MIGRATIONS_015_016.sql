-- Add unique constraints directly with proper error handling
BEGIN;

-- Migration 015: Drop old tables
DROP TABLE IF EXISTS stock_cards CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS po_items CASCADE;

-- Migration 016: Add unique constraints
ALTER TABLE estimates 
ADD CONSTRAINT estimates_estimate_number_org_unique 
UNIQUE (organization_id, estimate_number);

ALTER TABLE bar_schedules 
ADD CONSTRAINT bar_schedules_bar_mark_estimate_unique 
UNIQUE (estimate_id, bar_mark);

ALTER TABLE project_templates
ADD CONSTRAINT project_templates_name_org_unique
UNIQUE (organization_id, name);

-- Check if warehouse constraint exists, if not add it
DO $$
BEGIN
  BEGIN
    ALTER TABLE warehouses ADD CONSTRAINT warehouses_organization_id_name_key UNIQUE (organization_id, name);
  EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists
    NULL;
  END;
END $$;

COMMIT;

-- Verify
SELECT 'Migrations 015-016 Complete!' as status;
SELECT constraint_name, table_name FROM information_schema.table_constraints 
WHERE table_name IN ('estimates', 'bar_schedules', 'project_templates', 'warehouses')
AND constraint_type = 'UNIQUE'
ORDER BY table_name, constraint_name;