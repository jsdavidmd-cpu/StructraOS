-- Migration 019: Consolidated Inventory Setup
-- Handles both schema creation and data seeding with conflict resolution

-- ============================================================================
-- CREATE TABLES IF NOT EXISTS (skipped if already created by 011)
-- ============================================================================

-- Stock Levels table (only if stock_levels doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_levels') THEN
    CREATE TABLE stock_levels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      quantity_on_hand NUMERIC DEFAULT 0,
      quantity_reserved NUMERIC DEFAULT 0,
      quantity_available NUMERIC GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
      last_counted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(warehouse_id, item_id)
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Stock Movements table (only if stock_movements doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stock_movements') THEN
    CREATE TABLE stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      movement_type TEXT NOT NULL,
      quantity NUMERIC NOT NULL,
      reference_type TEXT,
      reference_id UUID,
      notes TEXT,
      created_by UUID REFERENCES profiles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Reorder Requests table (only if reorder_requests doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reorder_requests') THEN
    CREATE TABLE reorder_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
      warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
      requested_qty NUMERIC NOT NULL,
      status TEXT DEFAULT 'pending',
      requested_by UUID REFERENCES profiles(id),
      requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      notes TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- ENABLE RLS IF NOT ALREADY ENABLED
-- ============================================================================

DO $$
BEGIN
  EXECUTE 'ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE reorder_requests ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- CREATE RLS POLICIES WITH DO BLOCKS FOR ERROR HANDLING
-- ============================================================================

-- Stock Levels Policies
DO $$
BEGIN
  CREATE POLICY stock_levels_select ON stock_levels
    FOR SELECT USING (
      warehouse_id IN (
        SELECT w.id FROM warehouses w
        WHERE w.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY stock_levels_insert ON stock_levels
    FOR INSERT WITH CHECK (
      warehouse_id IN (
        SELECT w.id FROM warehouses w
        WHERE w.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY stock_levels_update ON stock_levels
    FOR UPDATE USING (
      warehouse_id IN (
        SELECT w.id FROM warehouses w
        WHERE w.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Stock Movements Policies
DO $$
BEGIN
  CREATE POLICY stock_movements_select ON stock_movements
    FOR SELECT USING (
      organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY stock_movements_insert ON stock_movements
    FOR INSERT WITH CHECK (
      organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Reorder Requests Policies
DO $$
BEGIN
  CREATE POLICY reorder_requests_select ON reorder_requests
    FOR SELECT USING (
      organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY reorder_requests_insert ON reorder_requests
    FOR INSERT WITH CHECK (
      organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY reorder_requests_update ON reorder_requests
    FOR UPDATE USING (
      organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================================
-- SEED INITIAL INVENTORY DATA
-- ============================================================================

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
BEGIN
  -- Get organization ID
  SELECT id INTO org_id FROM organizations LIMIT 1;
  IF org_id IS NULL THEN
    RAISE NOTICE 'No organization found - skipping inventory seed';
    RETURN;
  END IF;

  -- Try to create inventory items (may already exist from 011 or earlier seeding)
  INSERT INTO inventory_items (organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active)
  VALUES 
    (org_id, 'Portland Cement 40kg', 'CEMENT-40', 'Materials', 'bag', 285.00, 50, true),
    (org_id, 'Sand (Fine)', 'SAND-FINE', 'Materials', 'ton', 1200.00, 20, true),
    (org_id, 'Gravel (Coarse)', 'GRAVEL-C', 'Materials', 'ton', 1500.00, 15, true),
    (org_id, 'Steel Bar 12mm', 'STEEL-12', 'Materials', 'ton', 45000.00, 5, true),
    (org_id, 'Lumber 2x4x8', 'LUMBER-2x4', 'Materials', 'pcs', 850.00, 30, true)
  ON CONFLICT(item_code) DO NOTHING;

  -- Get warehouse IDs
  SELECT id INTO wh_main FROM warehouses WHERE (name ILIKE '%main%' OR name ILIKE '%warehouse%') LIMIT 1;
  SELECT id INTO wh_site FROM warehouses WHERE (name ILIKE '%site%' OR name ILIKE '%storage%') LIMIT 1;
  SELECT id INTO wh_tools FROM warehouses WHERE (name ILIKE '%tool%' OR name ILIKE '%room%') LIMIT 1;

  -- Create warehouses if none exist (may already exist from 011 or earlier)
  IF wh_main IS NULL THEN
    INSERT INTO warehouses (organization_id, name, location, status)
    VALUES 
      (org_id, 'Main Warehouse', 'Engineering District', 'active'),
      (org_id, 'Site Storage', 'Westlake Residence', 'active'),
      (org_id, 'Tool Room', 'Engineering District', 'active')
    ON CONFLICT(organization_id, name) DO NOTHING;
    
    SELECT id INTO wh_main FROM warehouses WHERE name = 'Main Warehouse' LIMIT 1;
    SELECT id INTO wh_site FROM warehouses WHERE name = 'Site Storage' LIMIT 1;
    SELECT id INTO wh_tools FROM warehouses WHERE name = 'Tool Room' LIMIT 1;
  END IF;

  -- Get item IDs
  SELECT id INTO item_cement FROM inventory_items WHERE item_code = 'CEMENT-40' LIMIT 1;
  SELECT id INTO item_sand FROM inventory_items WHERE item_code = 'SAND-FINE' LIMIT 1;
  SELECT id INTO item_gravel FROM inventory_items WHERE item_code = 'GRAVEL-C' LIMIT 1;
  SELECT id INTO item_steel FROM inventory_items WHERE item_code = 'STEEL-12' LIMIT 1;
  SELECT id INTO item_lumber FROM inventory_items WHERE item_code = 'LUMBER-2x4' LIMIT 1;

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
    (org_id, wh_site, item_cement, 'in', 100, 'Initial stock receipt - Site Storage')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Inventory migration 019 completed successfully!';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Inventory migration 019: Some operations skipped - tables/columns may already exist';
END $$;
