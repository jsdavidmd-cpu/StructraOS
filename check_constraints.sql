SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name IN ('estimates', 'bar_schedules', 'project_templates', 'warehouses')
ORDER BY table_name, constraint_name;