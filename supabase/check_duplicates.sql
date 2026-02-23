-- STRUCTRA - Duplicate Data Check
-- Run this BEFORE applying migration 016 (unique constraints)
-- This will identify any duplicate data that must be cleaned up first

-- =======================================================
-- 1. CHECK DUPLICATE ESTIMATE NUMBERS
-- =======================================================
-- Migration 016 will add: estimates_estimate_number_org_unique
-- Constraint: UNIQUE(organization_id, estimate_number)

SELECT 
    organization_id,
    estimate_number,
    COUNT(*) as duplicate_count,
    array_agg(id) as estimate_ids
FROM estimates 
GROUP BY organization_id, estimate_number 
HAVING COUNT(*) > 1;

-- If duplicates found, fix with:
-- UPDATE estimates SET estimate_number = 'EST-2026-XXX-DUP' WHERE id = 'duplicate-id-here';

-- =======================================================
-- 2. CHECK DUPLICATE BAR MARKS
-- =======================================================
-- Migration 016 will add: bar_schedules_bar_mark_estimate_unique
-- Constraint: UNIQUE(estimate_id, bar_mark)

SELECT 
    estimate_id,
    bar_mark,
    COUNT(*) as duplicate_count,
    array_agg(id) as bar_schedule_ids
FROM bar_schedules 
GROUP BY estimate_id, bar_mark 
HAVING COUNT(*) > 1;

-- If duplicates found, fix with:
-- UPDATE bar_schedules SET bar_mark = 'B1-DUP' WHERE id = 'duplicate-id-here';

-- =======================================================
-- 3. CHECK DUPLICATE PROJECT TEMPLATE NAMES
-- =======================================================
-- Migration 016 will add: project_templates_name_org_unique
-- Constraint: UNIQUE(organization_id, name)

SELECT 
    organization_id,
    name,
    COUNT(*) as duplicate_count,
    array_agg(id) as template_ids
FROM project_templates 
GROUP BY organization_id, name 
HAVING COUNT(*) > 1;

-- If duplicates found, fix with:
-- UPDATE project_templates SET name = 'Template Name (Copy)' WHERE id = 'duplicate-id-here';

-- =======================================================
-- 4. CHECK WAREHOUSE NAMES (Should already be unique)
-- =======================================================
-- Migration 011 already added this constraint
-- Just verifying it exists

SELECT 
    organization_id,
    name,
    COUNT(*) as duplicate_count,
    array_agg(id) as warehouse_ids
FROM warehouses 
GROUP BY organization_id, name 
HAVING COUNT(*) > 1;

-- =======================================================
-- SUMMARY
-- =======================================================
-- If ALL queries above return 0 rows, you are safe to proceed.
-- If ANY query returns rows, you MUST fix duplicates before running migration 016.
