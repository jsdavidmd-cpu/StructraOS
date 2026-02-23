-- Stock Level Management - SQL Reference
-- Use this to properly manage inventory stock levels for your warehouses

-- ============================================================================
-- STEP 1: CREATE INVENTORY ITEMS (Organization Level)
-- ============================================================================
-- Run this once to create inventory items

DO $$
DECLARE
  org_id UUID;
  cement_id UUID;
  sand_id UUID;
  gravel_id UUID;
  steel12_id UUID;
  lumber_id UUID;
BEGIN
  -- Get your organization ID
  SELECT id INTO org_id FROM organizations LIMIT 1;
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found!';
  END IF;

  -- Create Portland Cement
  INSERT INTO inventory_items (
    organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active
  ) VALUES (
    org_id, 'Portland Cement 40kg', 'CEMENT-40', 'Materials', 'bag', 285.00, 50, true
  ) ON CONFLICT(item_code) DO NOTHING
  RETURNING id INTO cement_id;

  -- Create Sand (Fine)
  INSERT INTO inventory_items (
    organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active
  ) VALUES (
    org_id, 'Sand (Fine)', 'SAND-FINE', 'Materials', 'ton', 1200.00, 20, true
  ) ON CONFLICT(item_code) DO NOTHING;

  -- Create Gravel (Coarse)
  INSERT INTO inventory_items (
    organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active
  ) VALUES (
    org_id, 'Gravel (Coarse)', 'GRAVEL-C', 'Materials', 'ton', 1500.00, 15, true
  ) ON CONFLICT(item_code) DO NOTHING;

  -- Create Steel Bar 12mm
  INSERT INTO inventory_items (
    organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active
  ) VALUES (
    org_id, 'Steel Bar 12mm', 'STEEL-12', 'Materials', 'ton', 45000.00, 5, true
  ) ON CONFLICT(item_code) DO NOTHING;

  -- Create Lumber 2x4x8
  INSERT INTO inventory_items (
    organization_id, name, item_code, category, unit, unit_cost, reorder_point, is_active
  ) VALUES (
    org_id, 'Lumber 2x4x8', 'LUMBER-2x4', 'Materials', 'pcs', 850.00, 30, true
  ) ON CONFLICT(item_code) DO NOTHING;

  RAISE NOTICE 'Inventory items created successfully for org %', org_id;
END $$;

-- ============================================================================
-- STEP 2: CREATE STOCK LEVELS PER WAREHOUSE
-- ============================================================================
-- For each warehouse, add stock level records

-- Get your organization ID and warehouse IDs first:
-- SELECT id, name FROM warehouses WHERE organization_id = 'your-org-id';

-- Then use this template to add stock for each item:

-- Option A: Add individual stock level
INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
SELECT 
  w.id,
  ii.id,
  150,  -- Change this quantity
  0
FROM warehouses w
JOIN inventory_items ii ON ii.organization_id = w.organization_id
WHERE w.name = 'Main Warehouse'  -- Change warehouse name
  AND ii.item_code = 'CEMENT-40'  -- Change item code
ON CONFLICT(warehouse_id, item_id) DO NOTHING;

-- Option B: Bulk add stock for all items in a warehouse
WITH warehouse_items AS (
  SELECT 
    w.id as warehouse_id,
    ii.id as item_id,
    ii.item_code,
    150 as default_qty  -- Change default quantity
  FROM warehouses w
  CROSS JOIN inventory_items ii
  WHERE w.name = 'Main Warehouse'  -- Change warehouse name
    AND ii.organization_id = w.organization_id
    AND ii.is_active = true
)
INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
SELECT warehouse_id, item_id, default_qty, 0
FROM warehouse_items
ON CONFLICT(warehouse_id, item_id) DO NOTHING;

-- ============================================================================
-- STEP 3: UPDATE EXISTING STOCK LEVELS
-- ============================================================================

-- Update quantity for a specific item/warehouse
UPDATE stock_levels
SET quantity_on_hand = 200,  -- New quantity
    updated_at = NOW()
WHERE warehouse_id = (
  SELECT id FROM warehouses WHERE name = 'Main Warehouse' LIMIT 1
)
AND item_id = (
  SELECT id FROM inventory_items WHERE item_code = 'CEMENT-40' AND is_active = true LIMIT 1
);

-- Update reserved quantity (for allocated but not issued stock)
UPDATE stock_levels
SET quantity_reserved = 25,  -- Items allocated to projects
    updated_at = NOW()
WHERE warehouse_id = (
  SELECT id FROM warehouses WHERE name = 'Site Storage' LIMIT 1
)
AND item_id = (
  SELECT id FROM inventory_items WHERE item_code = 'CEMENT-40' LIMIT 1
);

-- ============================================================================
-- STEP 4: RECORD STOCK MOVEMENTS (Audit Trail)
-- ============================================================================

-- Record inbound delivery
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, reference_type, notes, created_by
)
SELECT 
  w.organization_id,
  w.id,
  ii.id,
  'in',
  50,
  'purchase',
  'PO #12345 - Portland Cement delivery from Supplier X',
  auth.uid()
FROM warehouses w
JOIN inventory_items ii ON ii.organization_id = w.organization_id
WHERE w.name = 'Main Warehouse'
  AND ii.item_code = 'CEMENT-40'
LIMIT 1;

-- Record outbound issuance to project
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, reference_type, reference_id, notes, created_by
)
SELECT 
  w.organization_id,
  w.id,
  ii.id,
  'out',
  25,
  'project',
  p.id,
  'Issued to Site Storage for West Lake Foundation Work',
  auth.uid()
FROM warehouses w
JOIN inventory_items ii ON ii.organization_id = w.organization_id
JOIN projects p ON p.organization_id = w.organization_id
WHERE w.name = 'Main Warehouse'
  AND ii.item_code = 'CEMENT-40'
  AND p.name = 'West Lake Residence'
LIMIT 1;

-- Record stock adjustment (counting or damage)
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, notes, created_by
)
SELECT 
  w.organization_id,
  w.id,
  ii.id,
  'adjustment',
  -5,  -- Negative for shortage, positive for count adjustment
  'Physical inventory count - 5 bags damaged/missing',
  auth.uid()
FROM warehouses w
JOIN inventory_items ii ON ii.organization_id = w.organization_id
WHERE w.name = 'Main Warehouse'
  AND ii.item_code = 'CEMENT-40'
LIMIT 1;

-- ============================================================================
-- STEP 5: VIEW CURRENT INVENTORY STATUS
-- ============================================================================

-- View all warehouses and their stock
SELECT 
  w.name as warehouse,
  ii.item_code,
  ii.name as item,
  ii.unit,
  sl.quantity_on_hand,
  sl.quantity_reserved,
  (sl.quantity_on_hand - sl.quantity_reserved) as available,
  ii.reorder_point,
  CASE 
    WHEN sl.quantity_on_hand <= ii.reorder_point THEN 'LOW STOCK'
    ELSE 'OK'
  END as status,
  sl.updated_at
FROM stock_levels sl
JOIN warehouses w ON sl.warehouse_id = w.id
JOIN inventory_items ii ON sl.item_id = ii.id
WHERE w.organization_id = 'your-org-id'
ORDER BY w.name, ii.name;

-- View stock movements (audit trail)
SELECT 
  sm.created_at,
  w.name as warehouse,
  ii.name as item,
  sm.movement_type,
  sm.quantity,
  sm.reference_type,
  sm.notes,
  p.full_name as person
FROM stock_movements sm
JOIN warehouses w ON sm.warehouse_id = w.id
JOIN inventory_items ii ON sm.item_id = ii.id
LEFT JOIN profiles p ON sm.created_by = p.id
WHERE sm.organization_id = 'your-org-id'
ORDER BY sm.created_at DESC
LIMIT 50;

-- View low stock items
SELECT 
  w.name as warehouse,
  ii.item_code,
  ii.name as item,
  sl.quantity_on_hand,
  ii.reorder_point,
  (ii.reorder_point - sl.quantity_on_hand) as shortage
FROM stock_levels sl
JOIN warehouses w ON sl.warehouse_id = w.id
JOIN inventory_items ii ON sl.item_id = ii.id
WHERE w.organization_id = 'your-org-id'
  AND sl.quantity_on_hand <= ii.reorder_point
ORDER BY shortage DESC;

-- ============================================================================
-- USEFUL TIPS
-- ============================================================================

-- Check warehouse utilization
SELECT 
  name,
  location,
  capacity_tons,
  (SELECT SUM(sl.quantity_on_hand) FROM stock_levels sl WHERE sl.warehouse_id = w.id) as total_on_hand,
  ROUND(
    (SELECT SUM(sl.quantity_on_hand) FROM stock_levels sl WHERE sl.warehouse_id = w.id)::numeric 
    / NULLIF(capacity_tons, 0) * 100, 2
  ) as utilization_percent
FROM warehouses w
WHERE organization_id = 'your-org-id';

-- Get inventory value by warehouse
SELECT 
  w.name as warehouse,
  SUM(sl.quantity_on_hand * ii.unit_cost) as total_value,
  COUNT(DISTINCT sl.item_id) as item_count
FROM stock_levels sl
JOIN warehouses w ON sl.warehouse_id = w.id
JOIN inventory_items ii ON sl.item_id = ii.id
WHERE w.organization_id = 'your-org-id'
GROUP BY w.id, w.name
ORDER BY total_value DESC;
