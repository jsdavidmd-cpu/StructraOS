-- Migration 016: Add Unique Constraints
-- Adds unique constraints to prevent duplicate data entry

-- Unique constraint for estimate numbers per organization
ALTER TABLE estimates 
ADD CONSTRAINT estimates_estimate_number_org_unique 
UNIQUE (organization_id, estimate_number);

-- Unique constraint for purchase order numbers per organization
-- Note: PO table was removed in migration 015, adding for future reference
-- ALTER TABLE purchase_orders 
-- ADD CONSTRAINT purchase_orders_po_number_org_unique 
-- UNIQUE (organization_id, po_number);

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
