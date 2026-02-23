-- Quick Start: Seed Initial Stock Levels for 3 Warehouses
-- Handles both old schema (warehouse + material_id) and new schema (warehouse + item_id)

DO $$
DECLARE
  org_id UUID;
  wh_main UUID;
  wh_site UUID;
  wh_tools UUID;
  item_cement UUID;
  item_sand UUID;
  item_gravel UUID;
  item_steel UUID;
  item_lumber UUID;
  mat_cement UUID;
  mat_sand UUID;
  mat_gravel UUID;
  mat_steel UUID;
  mat_lumber UUID;
  has_new_schema BOOLEAN;
BEGIN
  -- Get organization ID
  SELECT id INTO org_id FROM organizations LIMIT 1;
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found!';
  END IF;

  -- Check if inventory_items has organization_id column (new schema)
  SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='organization_id')
  INTO has_new_schema;

  -- Get existing warehouse IDs
  SELECT id INTO wh_main FROM warehouses WHERE name ILIKE '%main%' OR name ILIKE '%warehouse%' LIMIT 1;
  SELECT id INTO wh_site FROM warehouses WHERE name ILIKE '%site%' OR name ILIKE '%storage%' LIMIT 1;
  SELECT id INTO wh_tools FROM warehouses WHERE name ILIKE '%tool%' OR name ILIKE '%room%' LIMIT 1;

  -- Create warehouses if they don't exist - with organization_id if supported
  IF wh_main IS NULL THEN
    -- Try to insert with organization_id (new schema) - will fail if column doesn't exist
    BEGIN
      INSERT INTO warehouses (organization_id, name, location, capacity_tons, status)
      VALUES 
        (org_id, 'Main Warehouse', 'Engineering District', 500, 'active'),
        (org_id, 'Site Storage', 'Westlake Residence', 200, 'active'),
        (org_id, 'Tool Room', 'Engineering District', 50, 'active');
    EXCEPTION WHEN undefined_column THEN
      -- Fall back to old schema without organization_id
      INSERT INTO warehouses (code, name, location, is_active)
      VALUES 
        ('WH001', 'Main Warehouse', 'Engineering District', TRUE),
        ('WH002', 'Site Storage', 'Westlake Residence', TRUE),
        ('WH003', 'Tool Room', 'Engineering District', TRUE);
    END;
    
    SELECT id INTO wh_main FROM warehouses WHERE name ILIKE '%main%' LIMIT 1;
    SELECT id INTO wh_site FROM warehouses WHERE name ILIKE '%site%' LIMIT 1;
    SELECT id INTO wh_tools FROM warehouses WHERE name ILIKE '%tool%' LIMIT 1;
  END IF;

  -- Handle new schema (organization-level inventory items)
  IF has_new_schema THEN
    -- Create inventory items (organization-level, not warehouse-specific)
    INSERT INTO inventory_items (organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active)
    VALUES 
      (org_id, 'Portland Cement 40kg', 'CEMENT-40', 'Materials', 'bag', 285.00, 50, true),
      (org_id, 'Sand (Fine)', 'SAND-FINE', 'Materials', 'ton', 1200.00, 20, true),
      (org_id, 'Gravel (Coarse)', 'GRAVEL-C', 'Materials', 'ton', 1500.00, 15, true),
      (org_id, 'Steel Bar 12mm', 'STEEL-12', 'Materials', 'ton', 45000.00, 5, true),
      (org_id, 'Lumber 2x4x8', 'LUMBER-2x4', 'Materials', 'pcs', 850.00, 30, true)
    ON CONFLICT(item_code) DO NOTHING;

    -- Get item IDs
    SELECT id INTO item_cement FROM inventory_items WHERE item_code = 'CEMENT-40';
    SELECT id INTO item_sand FROM inventory_items WHERE item_code = 'SAND-FINE';
    SELECT id INTO item_gravel FROM inventory_items WHERE item_code = 'GRAVEL-C';
    SELECT id INTO item_steel FROM inventory_items WHERE item_code = 'STEEL-12';
    SELECT id INTO item_lumber FROM inventory_items WHERE item_code = 'LUMBER-2x4';

    -- Create stock levels for Main Warehouse
    INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
    VALUES
      (wh_main, item_cement, 150, 0),
      (wh_main, item_sand, 35, 0),
      (wh_main, item_gravel, 28, 0),
      (wh_main, item_steel, 12, 0),
      (wh_main, item_lumber, 80, 0)
    ON CONFLICT(warehouse_id, item_id) DO UPDATE SET 
      quantity_on_hand = EXCLUDED.quantity_on_hand,
      updated_at = NOW();

    -- Create stock levels for Site Storage
    INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
    VALUES
      (wh_site, item_cement, 100, 0),
      (wh_site, item_sand, 20, 0),
      (wh_site, item_gravel, 15, 0),
      (wh_site, item_lumber, 60, 0)
    ON CONFLICT(warehouse_id, item_id) DO UPDATE SET 
      quantity_on_hand = EXCLUDED.quantity_on_hand,
      updated_at = NOW();

    -- Create stock levels for Tool Room
    INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
    VALUES
      (wh_tools, item_lumber, 40, 0)
    ON CONFLICT(warehouse_id, item_id) DO UPDATE SET 
      quantity_on_hand = EXCLUDED.quantity_on_hand,
      updated_at = NOW();

    -- Record initial stock movements for audit trail
    INSERT INTO stock_movements (organization_id, warehouse_id, item_id, movement_type, quantity, notes)
    VALUES
      (org_id, wh_main, item_cement, 'in', 150, 'Initial stock receipt - Main Warehouse'),
      (org_id, wh_main, item_sand, 'in', 35, 'Initial stock receipt - Main Warehouse'),
      (org_id, wh_site, item_cement, 'in', 100, 'Initial stock receipt - Site Storage'),
      (org_id, wh_site, item_lumber, 'in', 60, 'Initial stock receipt - Site Storage')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Inventory seeded successfully with new schema!';
    RAISE NOTICE 'Main Warehouse: %', wh_main;
    RAISE NOTICE 'Site Storage: %', wh_site;
    RAISE NOTICE 'Tool Room: %', wh_tools;
  ELSE
    -- OLD SCHEMA: Use materials table
    RAISE NOTICE 'Using old inventory_items schema - skipping stock_levels seeding';
  END IF;

END $$;
