-- STRUCTRA Assembly Components Population
-- Populates assembly_components table with materials, labor, and equipment
-- For unit price analysis calculations

-- Organization UUID
-- All data belongs to: 795acdd9-9a69-4699-aaee-2787f7babce0

-- ============================================================================
-- ASSEMBLY 1: Concrete 21 MPa (Site-Mixed) per cu.m
-- ============================================================================
-- Formula: 1 cu.m = 6.5 bags cement + 0.5 cu.m sand + 0.8 cu.m gravel

-- Clear existing components for this assembly if any
DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-001' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

-- Portland Cement (6.5 bags)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  6.5,
  'Portland Cement Type 1 40kg bags'
FROM assemblies a, materials m
WHERE a.code = 'ASM-001' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-001'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Sand (0.5 cu.m)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.5,
  'Washed Sand'
FROM assemblies a, materials m
WHERE a.code = 'ASM-001' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-002'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Gravel 3/4" (0.8 cu.m)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.8,
  'Gravel 3/4"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-001' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-003'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Mason (0.5 mandays = 4 hours)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.5,
  'Mason - 4 hours (0.5 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-001' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Mason'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Helper (1.0 manday = 8 hours)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  1.0,
  'Construction Helper - 8 hours (1.0 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-001' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Construction Helper'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Concrete Mixer (1 day)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'equipment',
  e.id,
  1.0,
  'Concrete Mixer 1 bag - 1 day rental'
FROM assemblies a, equipment e
WHERE a.code = 'ASM-001' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND e.code = 'EQP-001'
  AND e.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 2: CHB Wall 100mm with Plaster Both Sides per sq.m
-- ============================================================================
-- Components per sq.m:
-- - CHB 4": 12.5 pcs
-- - Cement (for mortar): 0.15 bags
-- - Sand (for mortar): 0.012 cu.m
-- - Cement (for plaster): 0.08 bags
-- - Sand (for plaster): 0.016 cu.m
-- - Mason: 0.3 mandays
-- - Helper: 0.3 mandays

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-002' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

-- CHB 4" (12.5 pcs)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  12.5,
  'CHB 4" (100mm) pieces'
FROM assemblies a, materials m
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-020'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Cement for mortar (0.15 bags)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.15,
  'Portland Cement for mortar'
FROM assemblies a, materials m
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-001'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Sand for mortar (0.012 cu.m)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.012,
  'Sand for mortar'
FROM assemblies a, materials m
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-002'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Cement for plaster (0.08 bags)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.08,
  'Portland Cement for plaster'
FROM assemblies a, materials m
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-023'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Sand for plaster (0.016 cu.m)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.016,
  'Sand for plaster'
FROM assemblies a, materials m
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-002'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Mason (0.3 mandays = 2.4 hours)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.3,
  'Mason - 2.4 hours (0.3 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Mason'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Helper (0.3 mandays = 2.4 hours)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.3,
  'Construction Helper - 2.4 hours (0.3 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-002' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Construction Helper'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 3: Reinforcing Steel Installation 12mm per kg
-- ============================================================================
-- Components per kg:
-- - Rebar 12mm: 1.08 kg (8% wastage)
-- - Tie Wire: 0.015 kg
-- - Steel Worker: 0.008 mandays (6.4 mins per kg)
-- - Helper: 0.004 mandays

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-003' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

-- Rebar 12mm (1.08 kg - 8% wastage)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  1.08,
  'Rebar 12mm Grade 40 with 8% wastage'
FROM assemblies a, materials m
WHERE a.code = 'ASM-003' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-011'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Tie Wire (0.015 kg)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.015,
  'Tie Wire #16 for binding'
FROM assemblies a, materials m
WHERE a.code = 'ASM-003' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-014'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Steel Worker (0.008 mandays = 6.4 minutes per kg)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.008,
  'Steel Worker - 6.4 minutes (0.008 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-003' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Steel Worker (Rebar)'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Helper (0.004 mandays = 3.2 minutes)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.004,
  'Construction Helper - 3.2 minutes (0.004 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-003' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Construction Helper'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 4: Ceramic Floor Tile 40x40cm Installation per sq.m
-- ============================================================================
-- Components per sq.m:
-- - Ceramic Tiles 40x40: 1.05 sq.m (5% wastage)
-- - Tile Adhesive: 0.15 bags
-- - Tile Grout: 0.5 kg
-- - Tile Setter: 0.25 mandays
-- - Helper: 0.125 mandays

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-004' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

-- Ceramic Floor Tiles (1.05 sq.m - 5% wastage)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  1.05,
  'Ceramic Floor Tiles 40x40cm with 5% wastage'
FROM assemblies a, materials m
WHERE a.code = 'ASM-004' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-040'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Tile Adhesive (0.15 bags)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.15,
  'Tile Adhesive 50kg bags'
FROM assemblies a, materials m
WHERE a.code = 'ASM-004' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-042'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Tile Grout (0.5 kg)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.5,
  'Tile Grout'
FROM assemblies a, materials m
WHERE a.code = 'ASM-004' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-043'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Tile Setter (0.25 mandays = 2 hours)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.25,
  'Tile Setter - 2 hours (0.25 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-004' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Tile Setter'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Helper (0.125 mandays = 1 hour)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.125,
  'Construction Helper - 1 hour (0.125 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-004' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Construction Helper'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 5: Acrylic Paint Application 2 Coats per sq.m
-- ============================================================================
-- Components per sq.m:
-- - Acrylic Paint: 0.15 liters (2 coats approx 150ml/sq.m)
-- - Paint Thinner: 0.015 liters
-- - Painter: 0.05 mandays (24 minutes for 2 coats)

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-005' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

-- Acrylic Paint Interior (0.15 liters)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.15,
  'Acrylic Paint Interior - 0.15L per sq.m for 2 coats'
FROM assemblies a, materials m
WHERE a.code = 'ASM-005' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-050'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Paint Thinner (0.015 liters)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.015,
  'Paint Thinner for prep'
FROM assemblies a, materials m
WHERE a.code = 'ASM-005' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-053'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Painter (0.05 mandays = 24 minutes)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.05,
  'Painter - 24 minutes (0.05 manday) for 2 coats'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-005' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Painter'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 6: Formwork for Columns (4 uses) per sq.m
-- ============================================================================
-- Components per sq.m:
-- - Marine Plywood 1/2": 0.25 sheets (4 uses)
-- - Lumber 2x2": 0.5 pc
-- - Lumber 2x3": 0.25 pc
-- - Common Nails 2": 0.1 kg
-- - Carpenter: 0.15 mandays

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-006' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

-- Marine Plywood (0.25 sheets for 4 uses)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.25,
  'Marine Plywood 1/2" per use (total 1 sheet/4 uses)'
FROM assemblies a, materials m
WHERE a.code = 'ASM-006' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-030'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Lumber 2x2" (0.5 pc)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.5,
  'Lumber 2"x2"x10"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-006' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-031'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Lumber 2x3" (0.25 pc)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.25,
  'Lumber 2"x3"x10"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-006' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-032'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Nails 2" (0.1 kg)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.1,
  'Common Wire Nails 2"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-006' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-034'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- Carpenter (0.15 mandays)
INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.15,
  'Carpenter - 1.2 hours (0.15 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-006' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Carpenter'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 7: Formwork for Beams (4 uses) per sq.m
-- ============================================================================
-- Similar to columns: 0.25 sheets plywood, lumber, nails

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-007' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.25,
  'Marine Plywood 1/2" per use (total 1 sheet/4 uses)'
FROM assemblies a, materials m
WHERE a.code = 'ASM-007' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-030'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.75,
  'Lumber 2"x4"x10"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-007' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-033'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.15,
  'Common Wire Nails 3"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-007' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-035'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.2,
  'Carpenter - 1.6 hours (0.2 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-007' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Carpenter'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- ASSEMBLY 8: Formwork for Slabs (4 uses) per sq.m
-- ============================================================================

DELETE FROM assembly_components WHERE assembly_id IN (
  SELECT id FROM assemblies WHERE code = 'ASM-008' AND organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
);

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.3,
  'Marine Plywood 1/2" per use (1.2 sheets/4 uses)'
FROM assemblies a, materials m
WHERE a.code = 'ASM-008' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-030'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.75,
  'Lumber 2"x3"x10"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-008' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-032'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'material',
  m.id,
  0.12,
  'Common Wire Nails 2"'
FROM assemblies a, materials m
WHERE a.code = 'ASM-008' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND m.code = 'MAT-034'
  AND m.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

INSERT INTO assembly_components (assembly_id, type, ref_id, qty, remarks)
SELECT 
  a.id,
  'labor',
  l.id,
  0.1,
  'Carpenter - 0.8 hours (0.1 manday)'
FROM assemblies a, labor_types l
WHERE a.code = 'ASM-008' 
  AND a.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0'
  AND l.trade = 'Carpenter'
  AND l.organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
-- All assembly components are now populated
-- Ready for: AssembliesPage, BOQ Editor, and Unit Price Analysis features
