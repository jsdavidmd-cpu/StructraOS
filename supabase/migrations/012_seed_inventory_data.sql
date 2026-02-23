-- Seed inventory data for testing
-- This migration adds sample materials, inventory items, warehouses and stock levels

DO $$
DECLARE
  org_id UUID;
  wh1_id UUID;
  wh2_id UUID;
  wh3_id UUID;
  cement_id UUID;
  sand_id UUID;
  gravel_id UUID;
  steel12_id UUID;
  lumber_id UUID;
BEGIN
  -- Get organization ID
  SELECT id INTO org_id FROM organizations LIMIT 1;
  
  IF org_id IS NULL THEN
    RAISE NOTICE 'No organization found. Skipping inventory seed.';
    RETURN;
  END IF;

  -- Create/Get warehouses
  INSERT INTO warehouses (organization_id, name, location, code, is_active)
  VALUES
    (org_id, 'Main Warehouse', 'Engineering District', 'WH-001', true),
    (org_id, 'Site Storage', 'Westlake Residence', 'WH-002', true),
    (org_id, 'Tool Room', 'Engineering District', 'WH-003', true)
  ON CONFLICT DO NOTHING;

  -- Get warehouse IDs
  SELECT id INTO wh1_id FROM warehouses WHERE code = 'WH-001' AND organization_id = org_id LIMIT 1;
  SELECT id INTO wh2_id FROM warehouses WHERE code = 'WH-002' AND organization_id = org_id LIMIT 1;
  SELECT id INTO wh3_id FROM warehouses WHERE code = 'WH-003' AND organization_id = org_id LIMIT 1;

  -- Create/Get materials
  -- Portland Cement 40kg
  INSERT INTO materials (organization_id, name, code, category, unit, ncr_price, is_active)
  SELECT org_id, 'Portland Cement 40kg', 'CEMENT-40', 'Materials', 'bag', 285.00, true
  WHERE NOT EXISTS (SELECT 1 FROM materials WHERE code = 'CEMENT-40' AND organization_id = org_id);
  SELECT id INTO cement_id FROM materials WHERE code = 'CEMENT-40' AND organization_id = org_id LIMIT 1;

  -- Sand (Fine)
  INSERT INTO materials (organization_id, name, code, category, unit, ncr_price, is_active)
  SELECT org_id, 'Sand (Fine)', 'SAND-FINE', 'Materials', 'ton', 1200.00, true
  WHERE NOT EXISTS (SELECT 1 FROM materials WHERE code = 'SAND-FINE' AND organization_id = org_id);
  SELECT id INTO sand_id FROM materials WHERE code = 'SAND-FINE' AND organization_id = org_id LIMIT 1;

  -- Gravel (Coarse)
  INSERT INTO materials (organization_id, name, code, category, unit, ncr_price, is_active)
  SELECT org_id, 'Gravel (Coarse)', 'GRAVEL-C', 'Materials', 'ton', 1500.00, true
  WHERE NOT EXISTS (SELECT 1 FROM materials WHERE code = 'GRAVEL-C' AND organization_id = org_id);
  SELECT id INTO gravel_id FROM materials WHERE code = 'GRAVEL-C' AND organization_id = org_id LIMIT 1;

  -- Steel Bar 12mm
  INSERT INTO materials (organization_id, name, code, category, unit, ncr_price, is_active)
  SELECT org_id, 'Steel Bar 12mm', 'STEEL-12', 'Materials', 'ton', 45000.00, true
  WHERE NOT EXISTS (SELECT 1 FROM materials WHERE code = 'STEEL-12' AND organization_id = org_id);
  SELECT id INTO steel12_id FROM materials WHERE code = 'STEEL-12' AND organization_id = org_id LIMIT 1;

  -- Lumber 2x4x8
  INSERT INTO materials (organization_id, name, code, category, unit, ncr_price, is_active)
  SELECT org_id, 'Lumber 2x4x8', 'LUMBER-2x4', 'Materials', 'pcs', 850.00, true
  WHERE NOT EXISTS (SELECT 1 FROM materials WHERE code = 'LUMBER-2x4' AND organization_id = org_id);
  SELECT id INTO lumber_id FROM materials WHERE code = 'LUMBER-2x4' AND organization_id = org_id LIMIT 1;

  -- Create inventory items for warehouses
  -- Main Warehouse inventory
  INSERT INTO inventory_items (warehouse_id, material_id, current_stock, min_stock, max_stock)
  VALUES
    (wh1_id, cement_id, 150, 50, 200),
    (wh1_id, sand_id, 35, 20, 100),
    (wh1_id, gravel_id, 28, 15, 80),
    (wh1_id, steel12_id, 12, 5, 30),
    (wh1_id, lumber_id, 80, 30, 150)
  ON CONFLICT (warehouse_id, material_id) DO NOTHING;

  -- Site Storage inventory
  INSERT INTO inventory_items (warehouse_id, material_id, current_stock, min_stock, max_stock)
  VALUES
    (wh2_id, cement_id, 100, 50, 200),
    (wh2_id, sand_id, 20, 20, 100),
    (wh2_id, gravel_id, 15, 15, 80),
    (wh2_id, lumber_id, 60, 30, 150)
  ON CONFLICT (warehouse_id, material_id) DO NOTHING;

  -- Tool Room inventory
  INSERT INTO inventory_items (warehouse_id, material_id, current_stock, min_stock, max_stock)
  VALUES
    (wh3_id, lumber_id, 40, 30, 100)
  ON CONFLICT (warehouse_id, material_id) DO NOTHING;

  -- Create stock levels (this links to inventory_items above)
  INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved, last_counted_at)
  SELECT
    ii.warehouse_id,
    ii.id,
    ii.current_stock,
    0,
    NOW()
  FROM inventory_items ii
  WHERE ii.warehouse_id IN (wh1_id, wh2_id, wh3_id)
  ON CONFLICT (warehouse_id, item_id) DO NOTHING;

  -- Create sample stock movements
  INSERT INTO stock_movements (organization_id, warehouse_id, item_id, movement_type, quantity, notes)
  SELECT
    org_id,
    ii.warehouse_id,
    ii.id,
    'in',
    ii.current_stock,
    'Initial stock receipt'
  FROM inventory_items ii
  WHERE ii.warehouse_id = wh1_id;

  RAISE NOTICE 'Inventory data seeded successfully for organization %', org_id;
END $$;
