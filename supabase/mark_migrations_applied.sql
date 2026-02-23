-- Step 1: Mark migrations 011-014 as already applied
-- Run this first in Supabase SQL Editor

-- Check if the schema_migrations table exists
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    statements TEXT[],
    name TEXT
);

-- Mark migrations 011-014 as applied
INSERT INTO supabase_migrations.schema_migrations (version, name, statements)
VALUES 
  ('20240101000011', '011_create_inventory_system', ARRAY['CREATE TABLE warehouses', 'CREATE TABLE inventory_items', 'CREATE TABLE stock_levels', 'CREATE TABLE stock_movements']),
  ('20240101000012', '012_seed_inventory_data', ARRAY['INSERT INTO inventory_items']),
  ('20240101000013', '013_seed_progress_data', ARRAY['INSERT INTO progress_entries']),
  ('20240101000014', '014_create_storage_buckets', ARRAY['INSERT INTO storage.buckets'])
ON CONFLICT (version) DO NOTHING;

-- Verify migrations recorded
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
