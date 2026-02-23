# HOW TO APPLY MIGRATIONS 015-017

## Quick Start
Follow these 3 steps to apply all database improvements:

---

## Step 1: Check for Duplicate Data ⚠️

**IMPORTANT:** Migration 016 adds unique constraints. If duplicate data exists, the migration will fail.

1. Open Supabase SQL Editor:
   - Go to: https://supabase.com/dashboard/project/gwxcvelcwnllrilkotsq/sql/new

2. Copy the contents of: `supabase/check_duplicates.sql`

3. Paste and run in SQL Editor

4. **Expected Result:** All queries should return 0 rows
   
   **If duplicates found:**
   - Use the cleanup queries in `check_duplicates.sql` to fix them
   - Update duplicate estimate numbers, bar marks, or template names
   - Re-run the check until 0 rows returned

---

## Step 2: Apply Migrations 015-017 ✅

### Option A: All at Once (Recommended)

1. Open Supabase SQL Editor:
   - https://supabase.com/dashboard/project/gwxcvelcwnllrilkotsq/sql/new

2. Copy the entire contents of: `supabase/APPLY_MIGRATIONS_015_to_017.sql`

3. Paste into SQL Editor

4. Click **Run** button

5. **Expected Result:**
   ```
   status: Migration 015-017 completed successfully!
   total_indexes: 80+ 
   total_unique_constraints: 10+
   ```

### Option B: One at a Time (If Option A fails)

Run each migration separately:

1. `supabase/migrations/015_consolidate_inventory_schema.sql`
2. `supabase/migrations/016_add_unique_constraints.sql`
3. `supabase/migrations/017_add_missing_indexes.sql`

---

## Step 3: Verify Success 🎉

### Check in Supabase Dashboard:

1. **Tables** (Database > Tables):
   - Old tables should be gone: `stock_cards`, `purchase_orders`, `po_items`
   - New tables intact: `warehouses`, `inventory_items`, `stock_levels`, `stock_movements`

2. **Indexes** (Table > Indexes tab):
   - Should see new indexes like `idx_estimates_org_status_created`
   - Check bar_schedules, boq_items, progress_entries tables

3. **Constraints** (Table > Schema tab):
   - `estimates`: Should have `estimates_estimate_number_org_unique`
   - `bar_schedules`: Should have `bar_schedules_bar_mark_estimate_unique`
   - `project_templates`: Should have `project_templates_name_org_unique`

---

## Troubleshooting

### "Unique constraint violation" Error

**Cause:** Duplicate data exists

**Fix:**
1. Run `supabase/check_duplicates.sql` to find duplicates
2. Clean up duplicates using the fix queries in that file
3. Re-run migration 016

**Example Fix:**
```sql
-- If two estimates have same estimate_number:
UPDATE estimates 
SET estimate_number = 'EST-2026-001-COPY' 
WHERE id = 'duplicate-estimate-id-here';
```

### "Relation already exists" Error

**Cause:** Migration already applied (or partially applied)

**Fix:**
- Skip that migration and continue with next
- Or use `DROP INDEX IF EXISTS` / `DROP CONSTRAINT IF EXISTS` first

### "Table does not exist" Error

**Cause:** Missing prerequisite migrations

**Fix:**
- Ensure migrations 001-014 have been run first
- Check SETUP.md for complete migration list

---

## What These Migrations Do

### Migration 015: Consolidate Inventory Schema
- Drops duplicate tables from old schema (migration 001)
- Keeps modern schema from migration 011
- No data loss (old tables were unused)

### Migration 016: Add Unique Constraints
- Prevents duplicate estimate numbers per organization
- Prevents duplicate bar marks per estimate  
- Prevents duplicate template names per organization
- Improves data integrity

### Migration 017: Add Missing Indexes
- Adds 25+ performance indexes
- Optimizes polymorphic queries (assembly_components, stock_movements)
- Speeds up date-range queries (progress, stock movements)
- Improves filtering (status, phase, trade, category)
- **Expected Performance:** 10-100x faster queries on large datasets

---

## After Migration

Test the application:
```bash
npm run dev
```

Navigate to different pages and verify:
- ✅ Pages load faster
- ✅ Search works smoothly
- ✅ No duplicate data errors
- ✅ Lists and filters respond quickly

---

## Rollback (If Needed)

If something goes wrong:

1. **Restore from Supabase backup:**
   - Dashboard > Database > Backups
   - Choose backup from before migration

2. **Manual rollback:**
   ```sql
   -- Drop indexes
   DROP INDEX IF EXISTS idx_estimates_org_status_created;
   -- ... (drop all indexes from migration 017)
   
   -- Drop constraints
   ALTER TABLE estimates DROP CONSTRAINT IF EXISTS estimates_estimate_number_org_unique;
   ALTER TABLE bar_schedules DROP CONSTRAINT IF EXISTS bar_schedules_bar_mark_estimate_unique;
   ALTER TABLE project_templates DROP CONSTRAINT IF EXISTS project_templates_name_org_unique;
   
   -- Cannot undo migration 015 easily (tables dropped)
   -- Restore from backup instead
   ```

---

**Questions?** Check IMPROVEMENTS.md for detailed documentation.
