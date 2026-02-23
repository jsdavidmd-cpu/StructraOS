# Inventory Management Guide - STRUCTRA

## Overview

The inventory system has 3 main tables:

1. **inventory_items** - Master list of inventory items (organization-wide)
   - `id, organization_id, name, description, item_code, category, unit, unit_cost, reorder_point`

2. **warehouses** - Physical storage locations
   - `id, organization_id, name, location, capacity_tons, status`

3. **stock_levels** - Quantity per warehouse per item
   - `id, warehouse_id, item_id, quantity_on_hand, quantity_reserved, quantity_available` (calculated)

4. **stock_movements** - Audit trail of all transactions
   - `id, warehouse_id, item_id, movement_type, quantity, reference_type, notes`

## How to Add/Edit Stock Levels

### Method 1: Using the UI (Recommended)

1. Go to **Inventory** module
2. Click **"Stock Levels"** tab
3. Select a warehouse from the dropdown
4. Click directly in the **"On Hand"** column to edit quantities
5. Press Enter to save - quantity updates automatically

### Method 2: Direct Database Insert (One-time Setup)

For initial data setup, INSERT stock level records:

```sql
-- First, ensure you have an inventory item (example)
INSERT INTO inventory_items (
  organization_id, name, item_code, category, unit, unit_cost, reorder_point
)
VALUES (
  'your-org-id', 
  'Portland Cement 40kg', 
  'CEMENT-40',
  'Materials',
  'bag',
  285.00,
  50  -- reorder when below 50 bags
)
ON CONFLICT(item_code) DO NOTHING
RETURNING id;

-- Then create stock level for each warehouse
INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
VALUES (
  'warehouse-id-here',
  'item-id-from-above',
  150,  -- On hand qty
  0     -- Reserved qty
)
ON CONFLICT(warehouse_id, item_id) DO NOTHING;
```

### Method 3: Bulk Upload (Advanced)

For many items, use this template:

```sql
-- Create inventory items from list
INSERT INTO inventory_items (organization_id, name, item_code, category, unit, unit_cost, reorder_point)
VALUES 
  ('org-id', 'Cement 40kg', 'CEMENT-40', 'Materials', 'bag', 285.00, 50),
  ('org-id', 'Sand (Fine)', 'SAND-FINE', 'Materials', 'ton', 1200.00, 20),
  ('org-id', 'Gravel (Coarse)', 'GRAVEL-C', 'Materials', 'ton', 1500.00, 15),
  ('org-id', 'Steel Bar 12mm', 'STEEL-12', 'Materials', 'ton', 45000.00, 5),
  ('org-id', 'Lumber 2x4x8', 'LUMBER-2x4', 'Materials', 'pcs', 850.00, 30)
ON CONFLICT(item_code) DO NOTHING;

-- Then populate stock levels for each warehouse
WITH items AS (
  SELECT id, item_code FROM inventory_items 
  WHERE organization_id = 'org-id'
),
warehouses_list AS (
  SELECT id FROM warehouses 
  WHERE organization_id = 'org-id'
)
INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand, quantity_reserved)
SELECT 
  w.id,
  i.id,
  100,  -- Default quantity
  0
FROM warehouses_list w
CROSS JOIN items i
ON CONFLICT(warehouse_id, item_id) DO NOTHING;
```

## Recording Stock Movements

When materials are used/received on site:

```sql
-- Record inbound delivery
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id, 
  movement_type, quantity, reference_type, notes
)
VALUES (
  'org-id',
  'warehouse-id',
  'item-id',
  'in',
  50,
  'purchase',
  'PO #12345 - Delivered by Supplier X'
);

-- Record outbound issuance to project
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, reference_type, reference_id, notes
)
VALUES (
  'org-id',
  'warehouse-id',
  'item-id',
  'out',
  25,
  'project',
  'project-id',
  'Issued for West Lake Foundation Work'
);
```

## Viewing Stock Levels

### From UI:
1. **Warehouse Overview**: See all warehouses with utilization percentages
2. **Stock Levels Tab**: Drill down per warehouse to see all items and their quantities
3. **Stock Movements**: View transaction history for audit trail

### From Dashboard:
- Total items in system
- Total quantity on hand
- Low stock alerts
- Warehouse utilization rates

## Low Stock Management

Items with quantity below **reorder_point** are flagged as **LOW STOCK**:

1. Set `reorder_point` when creating inventory item
2. System automatically highlights items in red when below this threshold
3. Use **Reorder Requests** to request new stock

## Reserved Stock

When materials are allocated to a project but not yet issued:

```sql
UPDATE stock_levels 
SET quantity_reserved = quantity_on_hand - <available_for_other_projects>
WHERE item_id = 'item-id' AND warehouse_id = 'warehouse-id';
```

Available quantity = On Hand - Reserved (shown in UI)

## Tips & Best Practices

1. **Regular Counts**: Use "last_counted_at" to track when physical inventory count was done
2. **Document Movements**: Always include reference_type and notes for audit trail
3. **Min/Max Levels**: Set reorder_point to trigger automatic low-stock alerts
4. **Warehouse Capacity**: Track utilization against warehouse capacity_tons
5. **Unit Consistency**: Ensure unit (pcs, bag, ton, etc.) matches your suppliers

## Troubleshooting

**No stock levels showing in overview?**
- Verify warehouses are created (should show 3)
- Check that inventory_items exist for the warehouse
- Confirm stock_levels records are created (quantity_on_hand > 0)

**Stock not updating?**
- Ensure you're editing the correct stock_levels record
- Check that the warehouse_id matches in the record
- Verify organization_id permissions

**Low stock alerts not appearing?**
- Check reorder_point value for the item
- Ensure quantity_on_hand is less than reorder_point
- Verify the item is marked as is_active = true
