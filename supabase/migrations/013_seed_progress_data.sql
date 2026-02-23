-- Seed progress data for Westlake Residence project
DO $$
DECLARE
  org_id UUID := '795acdd9-9a69-4699-aaee-2787f7babce0'::UUID;
  proj_id UUID;
  est_id UUID;
  boq_excavation UUID;
  boq_concrete UUID;
  boq_formwork UUID;
  boq_rebar UUID;
  boq_blockwork UUID;
BEGIN

  -- Get the Westlake Residence project
  SELECT id INTO proj_id
  FROM projects
  WHERE name = 'Westlake Residence - 4BR Townhouse'
  AND organization_id = org_id
  LIMIT 1;

  IF proj_id IS NULL THEN
    RAISE NOTICE 'Westlake project not found. Run migration 010 first.';
    RETURN;
  END IF;

  -- Check if estimate already exists
  SELECT id INTO est_id
  FROM estimates
  WHERE organization_id = org_id
  AND estimate_number = 'EST-2026-001'
  LIMIT 1;

  -- Create an estimate for this project only if it doesn't exist
  IF est_id IS NULL THEN
    INSERT INTO estimates (
      organization_id,
      project_id,
      estimate_number,
      project_name,
      floor_area,
      location,
      client_name,
      status,
      ocm_overhead,
      ocm_contingency,
      ocm_misc,
      ocm_profit,
      vat_rate,
      vat_type,
      created_at,
      updated_at
    ) VALUES (
      org_id,
      proj_id,
      'EST-2026-001',
      'Westlake Residence - Construction Estimate',
      250.00,
      'Westlake, Cape Town, South Africa',
      'Mr. & Mrs. Smith',
      'approved',
      5.00,
      5.00,
      3.00,
      10.00,
      12.00,
      'exclusive',
      NOW(),
      NOW()
    ) RETURNING id INTO est_id;
  END IF;

  -- Insert BOQ items for the estimate (only if estimate was just created)
  IF est_id IS NOT NULL THEN
  -- 1. Excavation
  INSERT INTO boq_items (
    estimate_id,
    item_number,
    trade,
    description,
    unit,
    qty,
    unit_price,
    is_manual,
    sort_order
  ) VALUES (
    est_id,
    '01.001',
    'Earthworks',
    'Excavation for foundation and basement',
    'cu.m',
    120.00,
    850.00,
    true,
    1
  ) RETURNING id INTO boq_excavation;

  -- 2. Concrete Foundation
  INSERT INTO boq_items (
    estimate_id,
    item_number,
    trade,
    description,
    unit,
    qty,
    unit_price,
    is_manual,
    sort_order
  ) VALUES (
    est_id,
    '02.001',
    'Concrete Works',
    'Mass concrete foundation including formwork and compaction',
    'cu.m',
    45.00,
    4500.00,
    true,
    2
  ) RETURNING id INTO boq_concrete;

  -- 3. Formwork
  INSERT INTO boq_items (
    estimate_id,
    item_number,
    trade,
    description,
    unit,
    qty,
    unit_price,
    is_manual,
    sort_order
  ) VALUES (
    est_id,
    '02.002',
    'Concrete Works',
    'Formwork for columns and beams',
    'sq.m',
    180.00,
    650.00,
    true,
    3
  ) RETURNING id INTO boq_formwork;

  -- 4. Reinforcement
  INSERT INTO boq_items (
    estimate_id,
    item_number,
    trade,
    description,
    unit,
    qty,
    unit_price,
    is_manual,
    sort_order
  ) VALUES (
    est_id,
    '02.003',
    'Concrete Works',
    'Reinforcement steel bars (various sizes)',
    'kg',
    2500.00,
    45.00,
    true,
    4
  ) RETURNING id INTO boq_rebar;

  -- 5. Blockwork
  INSERT INTO boq_items (
    estimate_id,
    item_number,
    trade,
    description,
    unit,
    qty,
    unit_price,
    is_manual,
    sort_order
  ) VALUES (
    est_id,
    '03.001',
    'Masonry',
    'Concrete hollow block walls (200mm)',
    'sq.m',
    320.00,
    550.00,
    true,
    5
  ) RETURNING id INTO boq_blockwork;

  -- Record progress entries for completed and in-progress items
  -- Excavation - Completed (100%)
  INSERT INTO progress_entries (
    project_id,
    boq_item_id,
    date,
    qty_today,
    qty_to_date,
    percent_complete,
    remarks
  ) VALUES
    (proj_id, boq_excavation, CURRENT_DATE - INTERVAL '25 days', 35.00, 35.00, 29.17, 'Excavation started - north section'),
    (proj_id, boq_excavation, CURRENT_DATE - INTERVAL '24 days', 40.00, 75.00, 62.50, NULL),
    (proj_id, boq_excavation, CURRENT_DATE - INTERVAL '23 days', 45.00, 120.00, 100.00, 'Excavation completed');

  -- Concrete Foundation - In Progress (60%)
  INSERT INTO progress_entries (
    project_id,
    boq_item_id,
    date,
    qty_today,
    qty_to_date,
    percent_complete,
    remarks
  ) VALUES
    (proj_id, boq_concrete, CURRENT_DATE - INTERVAL '15 days', 8.00, 8.00, 17.78, 'Foundation pour started'),
    (proj_id, boq_concrete, CURRENT_DATE - INTERVAL '14 days', 10.00, 18.00, 40.00, NULL),
    (proj_id, boq_concrete, CURRENT_DATE - INTERVAL '8 days', 9.00, 27.00, 60.00, 'Section A complete');

  -- Formwork - In Progress (25%)
  INSERT INTO progress_entries (
    project_id,
    boq_item_id,
    date,
    qty_today,
    qty_to_date,
    percent_complete,
    remarks
  ) VALUES
    (proj_id, boq_formwork, CURRENT_DATE - INTERVAL '10 days', 25.00, 25.00, 13.89, 'Formwork for columns started'),
    (proj_id, boq_formwork, CURRENT_DATE - INTERVAL '5 days', 20.00, 45.00, 25.00, 'Column formwork ongoing');

  -- Reinforcement - In Progress (30%)
  INSERT INTO progress_entries (
    project_id,
    boq_item_id,
    date,
    qty_today,
    qty_to_date,
    percent_complete,
    remarks
  ) VALUES
    (proj_id, boq_rebar, CURRENT_DATE - INTERVAL '12 days', 300.00, 300.00, 12.00, 'Rebar installation started'),
    (proj_id, boq_rebar, CURRENT_DATE - INTERVAL '11 days', 250.00, 550.00, 22.00, NULL),
    (proj_id, boq_rebar, CURRENT_DATE - INTERVAL '6 days', 200.00, 750.00, 30.00, 'Foundation rebar complete');

  -- Blockwork - Not started yet (0%)
  -- No entries

  END IF; -- End of IF est_id IS NOT NULL

  RAISE NOTICE 'Progress data seeded successfully for Westlake Residence project';
  RAISE NOTICE 'Project ID: %', proj_id;
  RAISE NOTICE 'Estimate ID: %', est_id;
  RAISE NOTICE 'Created 5 BOQ items with progress tracking';

END $$;
