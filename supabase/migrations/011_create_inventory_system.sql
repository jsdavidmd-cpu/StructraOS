-- Inventory Management System
-- Enhancing existing tables from 001_initial_schema

-- Add organization_id and additional columns to existing inventory_items table
DO $$
BEGIN
  -- Add organization_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='organization_id') THEN
    ALTER TABLE inventory_items ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  
  -- Add additional columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='item_code') THEN
    ALTER TABLE inventory_items ADD COLUMN item_code TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='category') THEN
    ALTER TABLE inventory_items ADD COLUMN category TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='unit') THEN
    ALTER TABLE inventory_items ADD COLUMN unit TEXT DEFAULT 'pcs';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='unit_cost') THEN
    ALTER TABLE inventory_items ADD COLUMN unit_cost NUMERIC DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='reorder_point') THEN
    ALTER TABLE inventory_items ADD COLUMN reorder_point NUMERIC DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory_items' AND column_name='is_active') THEN
    ALTER TABLE inventory_items ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Add organization_id to warehouses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='warehouses' AND column_name='organization_id') THEN
    ALTER TABLE warehouses ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create stock levels table (inventory by warehouse)
CREATE TABLE IF NOT EXISTS stock_levels (
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

-- Create stock movements table (audit trail)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'in', 'out', 'adjustment', 'count'
  quantity NUMERIC NOT NULL,
  reference_type TEXT, -- 'project', 'purchase', 'manual', etc.
  reference_id UUID,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reorder requests table
CREATE TABLE IF NOT EXISTS reorder_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  requested_qty NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'ordered', 'received', 'cancelled'
  requested_by UUID REFERENCES profiles(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (idempotent - won't error if already enabled)
DO $$
BEGIN
  EXECUTE 'ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE reorder_requests ENABLE ROW LEVEL SECURITY';
EXCEPTION WHEN OTHERS THEN
  NULL; -- RLS might already be enabled
END $$;

-- RLS Policies for warehouses (wrapped in DO block to handle existing policies)
DO $$
BEGIN
  CREATE POLICY warehouses_select ON warehouses
    FOR SELECT USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY warehouses_insert ON warehouses
    FOR INSERT WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY warehouses_update ON warehouses
    FOR UPDATE USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY warehouses_delete ON warehouses
    FOR DELETE USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Policies might already exist
END $$;

-- RLS Policies for inventory_items
DO $$
BEGIN
  CREATE POLICY inventory_items_select ON inventory_items
    FOR SELECT USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY inventory_items_insert ON inventory_items
    FOR INSERT WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY inventory_items_update ON inventory_items
    FOR UPDATE USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY inventory_items_delete ON inventory_items
    FOR DELETE USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Policies might already exist
END $$;

-- RLS Policies for stock_levels (through warehouse)
DO $$
BEGIN
  CREATE POLICY stock_levels_select ON stock_levels
    FOR SELECT USING (
      warehouse_id IN (
        SELECT id FROM warehouses WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
      )
    );
  CREATE POLICY stock_levels_insert ON stock_levels
    FOR INSERT WITH CHECK (
      warehouse_id IN (
        SELECT id FROM warehouses WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
      )
    );
  CREATE POLICY stock_levels_update ON stock_levels
    FOR UPDATE USING (
      warehouse_id IN (
        SELECT id FROM warehouses WHERE organization_id IN (
          SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Policies might already exist
END $$;

-- RLS Policies for stock_movements
DO $$
BEGIN
  CREATE POLICY stock_movements_select ON stock_movements
    FOR SELECT USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY stock_movements_insert ON stock_movements
    FOR INSERT WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Policies might already exist
END $$;

-- RLS Policies for reorder_requests
DO $$
BEGIN
  CREATE POLICY reorder_requests_select ON reorder_requests
    FOR SELECT USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY reorder_requests_insert ON reorder_requests
    FOR INSERT WITH CHECK (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
  CREATE POLICY reorder_requests_update ON reorder_requests
    FOR UPDATE USING (
      organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL; -- Policies might already exist
END $$;

-- Create indexes (IF NOT EXISTS to avoid conflicts)
CREATE INDEX IF NOT EXISTS idx_warehouses_org ON warehouses(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_warehouse ON stock_levels(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_item ON stock_levels(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_org ON stock_movements(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_reorder_requests_org ON reorder_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_reorder_requests_status ON reorder_requests(status);
