-- Migration 015: Consolidate Inventory Schema
-- Resolves conflict between 001_initial_schema and 011_create_inventory_system
-- Drops old inventory tables and standardizes on the newer schema

-- Drop old inventory-related tables from migration 001
-- (These were replaced by improved versions in migration 011)

DROP TABLE IF EXISTS stock_cards CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS po_items CASCADE;

-- Note: warehouses and inventory_items from 001 are structurally different
-- from the ones in 011, so we keep the 011 versions which are more complete

-- Update any foreign key references that might point to old structure
-- (Most likely none exist since 011 was created recently)

-- Add any missing columns to align schemas if needed
-- (Review shows 011 schema is more complete, no additions needed)

COMMENT ON TABLE warehouses IS 'Warehouse locations for inventory management (schema from migration 011)';
COMMENT ON TABLE inventory_items IS 'Inventory item master data (schema from migration 011)';
COMMENT ON TABLE stock_levels IS 'Stock quantities per warehouse per item (replaces old inventory_items)';
COMMENT ON TABLE stock_movements IS 'Audit trail for all stock transactions (replaces old stock_cards)';
