-- Simple residential project seed for Westlake

-- Insert crews
INSERT INTO crews (organization_id, name, description, created_at, updated_at) VALUES
  ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Foundation & Structure', 'Excavation, concrete work, and structural elements', NOW(), NOW()),
  ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Brickwork & Plastering', 'Masonry, cement plastering', NOW(), NOW()),
  ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Roofing & Cladding', 'Roof structure, tiles, and guttering', NOW(), NOW()),
  ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Electrical Installation', 'Electrical wiring and installations', NOW(), NOW()),
  ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Plumbing & Drainage', 'Plumbing pipes and drainage systems', NOW(), NOW()),
  ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Painting & Finishes', 'Paint, flooring, and final finishes', NOW(), NOW());

-- Insert project
INSERT INTO projects (organization_id, name, location, client_name, contract_amount, start_date, end_date, status, created_at, updated_at) 
VALUES ('795acdd9-9a69-4699-aaee-2787f7babce0'::UUID, 'Westlake Residence - 4BR Townhouse', 'Westlake, Cape Town, South Africa', 'Mr. & Mrs. Smith', 2500000, CURRENT_DATE, CURRENT_DATE + INTERVAL '180 days', 'active', NOW(), NOW());

-- Insert schedule tasks for the project
INSERT INTO tasks (project_id, task_name, description, planned_start, planned_end, baseline_start, baseline_end, planned_duration, phase, status, percent_complete, qty_planned, sort_order, priority, created_at, updated_at)
SELECT p.id, task.name, task.description, task.start_date, task.end_date, task.start_date, task.end_date, task.days, task.phase, task.status, task.pct, 1, task.sort, task.prio, NOW(), NOW()
FROM projects p,
LATERAL(VALUES
  ('Project Management Plan'::text, 'Develop project management plan', CURRENT_DATE + INTERVAL '0 days', CURRENT_DATE + INTERVAL '5 days', 5, 'Planning', 'completed', 100, 1, 'critical'),
  ('Site Survey & Drawings', 'Complete survey and drawings', CURRENT_DATE + INTERVAL '0 days', CURRENT_DATE + INTERVAL '10 days', 10, 'Planning', 'completed', 100, 2, 'critical'),
  ('Budget Approval', 'Obtain client approval', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '13 days', 3, 'Planning', 'completed', 100, 3, 'critical'),
  ('Design & Specifications', 'Prepare detailed design', CURRENT_DATE + INTERVAL '13 days', CURRENT_DATE + INTERVAL '28 days', 15, 'Design', 'completed', 100, 4, 'high'),
  ('Engineering Approval', 'Structural approval', CURRENT_DATE + INTERVAL '17 days', CURRENT_DATE + INTERVAL '22 days', 5, 'Design', 'completed', 100, 5, 'high'),
  ('Site Preparation', 'Prepare site and fencing', CURRENT_DATE + INTERVAL '28 days', CURRENT_DATE + INTERVAL '35 days', 7, 'Preparation', 'completed', 100, 6, 'high'),
  ('Material Procurement', 'Procure all materials', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '35 days', 15, 'Preparation', 'in_progress', 75, 7, 'high'),
  ('Excavation & Foundation', 'Excavation and foundation work', CURRENT_DATE + INTERVAL '35 days', CURRENT_DATE + INTERVAL '56 days', 21, 'Construction', 'in_progress', 45, 8, 'high'),
  ('Concrete Slab Pouring', 'Pour concrete floors and slabs', CURRENT_DATE + INTERVAL '56 days', CURRENT_DATE + INTERVAL '63 days', 7, 'Construction', 'not_started', 0, 9, 'high'),
  ('Brickwork - Ground Floor', 'Ground floor wall construction', CURRENT_DATE + INTERVAL '63 days', CURRENT_DATE + INTERVAL '88 days', 25, 'Construction', 'not_started', 0, 10, 'high'),
  ('Brickwork - First Floor', 'First floor wall construction', CURRENT_DATE + INTERVAL '88 days', CURRENT_DATE + INTERVAL '108 days', 20, 'Construction', 'not_started', 0, 11, 'high'),
  ('Roof Structure Installation', 'Install roof structure and supports', CURRENT_DATE + INTERVAL '108 days', CURRENT_DATE + INTERVAL '122 days', 14, 'Construction', 'not_started', 0, 12, 'high'),
  ('Roof Tiling & Guttering', 'Install roof tiles and guttering', CURRENT_DATE + INTERVAL '122 days', CURRENT_DATE + INTERVAL '132 days', 10, 'Construction', 'not_started', 0, 13, 'high'),
  ('Windows & Doors Installation', 'Install windows and doors', CURRENT_DATE + INTERVAL '132 days', CURRENT_DATE + INTERVAL '139 days', 7, 'Construction', 'not_started', 0, 14, 'high'),
  ('Electrical Rough-in', 'Install electrical conduits and wiring', CURRENT_DATE + INTERVAL '88 days', CURRENT_DATE + INTERVAL '116 days', 28, 'Construction', 'not_started', 0, 15, 'high'),
  ('Plumbing Rough-in', 'Install plumbing pipes and drainage', CURRENT_DATE + INTERVAL '95 days', CURRENT_DATE + INTERVAL '120 days', 25, 'Construction', 'not_started', 0, 16, 'high'),
  ('Plastering Walls', 'Plaster interior and exterior walls', CURRENT_DATE + INTERVAL '139 days', CURRENT_DATE + INTERVAL '157 days', 18, 'Construction', 'not_started', 0, 17, 'high'),
  ('Floor Tiling', 'Lay floor tiles throughout property', CURRENT_DATE + INTERVAL '157 days', CURRENT_DATE + INTERVAL '177 days', 20, 'Finishing', 'not_started', 0, 18, 'medium'),
  ('Electrical Final Installation', 'Final electrical connections and testing', CURRENT_DATE + INTERVAL '157 days', CURRENT_DATE + INTERVAL '169 days', 12, 'Finishing', 'not_started', 0, 19, 'high'),
  ('Plumbing Final Installation', 'Final plumbing connections and testing', CURRENT_DATE + INTERVAL '157 days', CURRENT_DATE + INTERVAL '167 days', 10, 'Finishing', 'not_started', 0, 20, 'high'),
  ('Painting - Interior & Exterior', 'Paint interior and exterior surfaces', CURRENT_DATE + INTERVAL '177 days', CURRENT_DATE + INTERVAL '192 days', 15, 'Finishing', 'not_started', 0, 21, 'medium'),
  ('Landscaping & External Works', 'Complete landscaping and external works', CURRENT_DATE + INTERVAL '167 days', CURRENT_DATE + INTERVAL '179 days', 12, 'Finishing', 'not_started', 0, 22, 'medium'),
  ('Quality Inspection', 'Conduct final quality inspection', CURRENT_DATE + INTERVAL '192 days', CURRENT_DATE + INTERVAL '197 days', 5, 'Closeout', 'not_started', 0, 23, 'critical'),
  ('Client Handover & Defects List', 'Handover to client and finalize defects', CURRENT_DATE + INTERVAL '197 days', CURRENT_DATE + INTERVAL '200 days', 3, 'Closeout', 'not_started', 0, 24, 'critical')
) AS task(name, description, start_date, end_date, days, phase, status, pct, sort, prio)
WHERE p.name = 'Westlake Residence - 4BR Townhouse';
