-- Manual Migration Runner for 015-017
-- This script combines migrations 015, 016, and 017
-- Run this in Supabase SQL Editor if CLI push doesn't work

-- Mark migrations 011-014 as applied (if not already in history)
INSERT INTO supabase_migrations.schema_migrations (version, statements)
VALUES 
  ('011', ARRAY['create_inventory_system']),
  ('012', ARRAY['seed_inventory_data']),
  ('013', ARRAY['seed_progress_data']),
  ('014', ARRAY['create_storage_buckets'])
ON CONFLICT (version) DO NOTHING;

-- ========================================
-- MIGRATION 015: Consolidate Inventory Schema
-- ========================================
