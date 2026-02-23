-- Verify constraints were applied
SELECT constraint_name, table_name FROM information_schema.table_constraints 
WHERE constraint_type = 'UNIQUE' AND table_name IN ('estimates', 'bar_schedules', 'project_templates', 'warehouses');