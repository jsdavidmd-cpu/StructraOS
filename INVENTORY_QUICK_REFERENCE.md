# Inventory Management Quick Reference

## 🎯 Problem & Solution

**Problem You Had:**
- 3 warehouses exist but no stock data showing in overview
- Schema mismatch between migrations caused data not to populate
- Service code was referencing old table/column names

**Solution Applied:**
- ✅ Fixed `inventoryService.ts` to use correct columns: `quantity_on_hand`, `item_id`, `inventory_items`
- ✅ Updated `StockLevels.tsx` component to handle correct data structure
- ✅ Created migration 018 to seed initial stock levels properly
- ✅ Provided SQL reference guide for all inventory operations

---

## 📋 Quick Setup (3 Steps)

### Step 1: Run Migration to Seed Initial Data
```bash
# In Supabase Dashboard > SQL Editor, run:
# supabase/migrations/018_seed_stock_levels.sql
```

This will:
- Create 5 basic inventory items (cement, sand, gravel, steel, lumber)
- Create 3 warehouses with initial stock quantities
- Record initial stock movements for audit trail

### Step 2: Use UI to Add/Edit Stock
**Location:** Inventory > Stock Levels Tab

| Warehouse | Item | On Hand | Reserved | Available | Action |
|-----------|------|---------|----------|-----------|--------|
| Main | Cement | 150 | 0 | 150 | Click qty to edit |
| Main | Sand | 35 | 0 | 35 | Click qty to edit |

Simply click in the quantity field and enter new amount - saves automatically!

### Step 3: View Overview
**Location:** Inventory > Warehouse Overview Tab

Shows:
- Total warehouses (3)
- Total items across all warehouses
- Total on-hand quantity
- Low stock alerts (items below reorder point)
- Warehouse utilization percentages

---

## 🗂️ Data Structure

### The Three Key Tables

```
inventory_items (Organization Level)
├── id, name, item_code, category, unit
├── unit_cost, reorder_point, is_active
└── organization_id

stock_levels (Warehouse-Specific)
├── warehouse_id → warehouses
├── item_id → inventory_items
├── quantity_on_hand (current qty)
├── quantity_reserved (allocated)
└── quantity_available (calculated)

stock_movements (Audit Trail)
├── warehouse_id, item_id
├── movement_type: 'in', 'out', 'adjustment', 'count'
├── quantity, reference_type, notes
└── created_by
```

---

## 🔄 Common Workflows

### Add New Inventory Item

**UI Method:** Currently use SQL (no UI form yet)

**SQL:**
```sql
INSERT INTO inventory_items (
  organization_id, name, item_code, category, unit, unit_cost, reorder_point
)
VALUES (
  'your-org-id',
  'Lumber 2x6x8',
  'LUMBER-2x6',
  'Materials',
  'pcs',
  1250.00,
  25  -- reorder when below 25 pcs
);
```

### Add Stock to Warehouse

**UI Method:** 
1. Go to Inventory > Stock Levels
2. Select warehouse dropdown
3. Click quantity field
4. Enter number → saves

**SQL:**
```sql
-- First time: Insert new stock level
INSERT INTO stock_levels (warehouse_id, item_id, quantity_on_hand)
SELECT w.id, ii.id, 50
FROM warehouses w
JOIN inventory_items ii ON ii.organization_id = w.organization_id
WHERE w.name = 'Main Warehouse' AND ii.item_code = 'LUMBER-2x6';

-- Update existing: Just edit quantity
UPDATE stock_levels SET quantity_on_hand = 75
WHERE warehouse_id = 'wh-id' AND item_id = 'item-id';
```

### Record Stock Movement (Delivery/Issue)

**Delivery (In):**
```sql
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, reference_type, notes
)
VALUES (
  'org-id', 'warehouse-id', 'item-id',
  'in', 50, 'purchase', 'PO #123 - Delivered by Supplier'
);
```

**Issuance (Out):**
```sql
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, reference_type, reference_id, notes
)
VALUES (
  'org-id', 'warehouse-id', 'item-id',
  'out', 25, 'project', 'project-id', 'Issued to Site'
);
```

**Adjustment (Count/Damage):**
```sql
INSERT INTO stock_movements (
  organization_id, warehouse_id, item_id,
  movement_type, quantity, notes
)
VALUES (
  'org-id', 'warehouse-id', 'item-id',
  'adjustment', -5, 'Physical count - 5 damaged'
);
```

### Mark as Reserved (Allocated to Project)

When material is allocated to a project but not yet issued:

```sql
UPDATE stock_levels
SET quantity_reserved = quantity_reserved + 25
WHERE warehouse_id = 'warehouse-id' AND item_id = 'item-id';

-- Available quantity = On Hand - Reserved
```

---

## 📊 Reports & Queries

### View Current Stock Status
```sql
SELECT 
  w.name,
  ii.name,
  sl.quantity_on_hand,
  sl.quantity_reserved,
  (sl.quantity_on_hand - sl.quantity_reserved) as available,
  ii.reorder_point,
  CASE WHEN sl.quantity_on_hand <= ii.reorder_point THEN '⚠️ LOW' ELSE '✓ OK' END
FROM stock_levels sl
JOIN warehouses w ON sl.warehouse_id = w.id
JOIN inventory_items ii ON sl.item_id = ii.id
WHERE w.organization_id = 'your-org-id'
ORDER BY w.name, ii.name;
```

### View Transaction History
```sql
SELECT 
  sm.created_at,
  w.name,
  ii.name,
  sm.movement_type,
  sm.quantity,
  sm.notes
FROM stock_movements sm
JOIN warehouses w ON sm.warehouse_id = w.id
JOIN inventory_items ii ON sm.item_id = ii.id
WHERE sm.organization_id = 'your-org-id'
ORDER BY sm.created_at DESC
LIMIT 50;
```

### View Low Stock Items
```sql
SELECT 
  w.name,
  ii.name,
  sl.quantity_on_hand,
  ii.reorder_point,
  (ii.reorder_point - sl.quantity_on_hand) as shortage
FROM stock_levels sl
JOIN warehouses w ON sl.warehouse_id = w.id
JOIN inventory_items ii ON sl.item_id = ii.id
WHERE w.organization_id = 'your-org-id'
  AND sl.quantity_on_hand <= ii.reorder_point
ORDER BY shortage DESC;
```

### Warehouse Utilization
```sql
SELECT 
  w.name,
  w.capacity_tons,
  SUM(sl.quantity_on_hand) as total_items,
  ROUND(SUM(sl.quantity_on_hand)::numeric / w.capacity_tons * 100, 1) as utilization_pct
FROM stock_levels sl
JOIN warehouses w ON sl.warehouse_id = w.id
WHERE w.organization_id = 'your-org-id'
GROUP BY w.id, w.name, w.capacity_tons;
```

---

## ⚙️ Best Practices

✅ **DO:**
- Set meaningful `reorder_point` values for each item
- Record ALL movements for audit trail (in/out/adjustment)
- Include clear notes for reference
- Use `reference_id` to link to projects
- Review low stock regularly

❌ **DON'T:**
- Directly edit quantities without recording movement
- Leave notes blank
- Forget to update reserved quantities
- Keep old/inactive items marked as active

---

## 🧪 Testing

**After running migration 018, verify:**

```sql
-- Check warehouses created
SELECT name, location FROM warehouses LIMIT 3;

-- Check inventory items
SELECT item_code, name FROM inventory_items LIMIT 5;

-- Check stock levels populated
SELECT COUNT(*) as total_stock_records FROM stock_levels;

-- Check audit trail
SELECT COUNT(*) as total_movements FROM stock_movements;
```

---

## 📚 Files Updated

| File | Change |
|------|--------|
| `src/services/inventoryService.ts` | Fixed column names & table references |
| `src/pages/inventory/StockLevels.tsx` | Updated data binding |
| `supabase/migrations/018_seed_stock_levels.sql` | New migration to seed initial data |
| `INVENTORY_MANAGEMENT_GUIDE.md` | Detailed guide |
| `STOCK_MANAGEMENT_SQL.sql` | SQL reference |

---

## 🆘 Troubleshooting

**Q: No stock showing in Overview?**  
A: Run migration 018 to create initial stock records.

**Q: Can't find my warehouses?**  
A: They're there! Go to Inventory > Stock Levels tab to see them.

**Q: How do I add new items?**  
A: Currently via SQL. UI form coming soon.

**Q: My quantities aren't updating?**  
A: Use the Stock Levels tab - click the quantity field to edit.

For more info, see [INVENTORY_MANAGEMENT_GUIDE.md](./INVENTORY_MANAGEMENT_GUIDE.md)
