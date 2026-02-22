-- STRUCTRA Seed Data
-- NCR Baseline Construction Materials, Labor, and Assemblies

-- Note: This assumes an organization_id. Replace with actual UUID after org creation.
-- For demo purposes, we'll use a placeholder that should be replaced.

-- ============================================================================
-- MATERIALS (NCR Baseline Prices 2026)
-- ============================================================================

INSERT INTO materials (organization_id, code, name, unit, ncr_price, category, is_active) VALUES
-- Concrete & Aggregates
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-001', 'Portland Cement Type 1 (40kg)', 'bag', 285.00, 'Concrete', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-002', 'Sand (Washed)', 'cu.m', 1200.00, 'Aggregates', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-003', 'Gravel 3/4"', 'cu.m', 1350.00, 'Aggregates', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-004', 'Ready Mix Concrete 21 MPa', 'cu.m', 4500.00, 'Concrete', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-005', 'Ready Mix Concrete 28 MPa', 'cu.m', 5200.00, 'Concrete', true),

-- Reinforcing Steel
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-010', 'Rebar 10mm (Grade 40)', 'kg', 52.00, 'Steel', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-011', 'Rebar 12mm (Grade 40)', 'kg', 51.00, 'Steel', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-012', 'Rebar 16mm (Grade 40)', 'kg', 50.00, 'Steel', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-013', 'Rebar 20mm (Grade 40)', 'kg', 49.50, 'Steel', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-014', 'Tie Wire #16', 'kg', 75.00, 'Steel', true),

-- Masonry
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-020', 'CHB 4" (100mm)', 'pc', 14.50, 'Masonry', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-021', 'CHB 6" (150mm)', 'pc', 22.00, 'Masonry', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-022', 'CHB 8" (200mm)', 'pc', 28.50, 'Masonry', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-023', 'Cement Plaster', 'bag', 285.00, 'Masonry', true),

-- Formworks & Falseworks
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-030', 'Marine Plywood 1/2" x 4'' x 8''', 'sheet', 850.00, 'Formwork', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-031', 'Lumber 2" x 2" x 10''', 'pc', 85.00, 'Lumber', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-032', 'Lumber 2" x 3" x 10''', 'pc', 125.00, 'Lumber', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-033', 'Lumber 2" x 4" x 10''', 'pc', 165.00, 'Lumber', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-034', 'Common Wire Nails 2"', 'kg', 95.00, 'Hardware', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-035', 'Common Wire Nails 3"', 'kg', 90.00, 'Hardware', true),

-- Finishing
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-040', 'Ceramic Floor Tiles 40x40cm', 'sq.m', 385.00, 'Tiles', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-041', 'Ceramic Wall Tiles 20x30cm', 'sq.m', 425.00, 'Tiles', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-042', 'Tile Adhesive', 'bag', 320.00, 'Adhesives', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-043', 'Tile Grout', 'kg', 45.00, 'Adhesives', true),

-- Painting
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-050', 'Acrylic Paint (Interior)', 'gal', 1250.00, 'Paint', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-051', 'Acrylic Paint (Exterior)', 'gal', 1450.00, 'Paint', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-052', 'Enamel Paint', 'gal', 1680.00, 'Paint', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-053', 'Paint Thinner', 'liter', 85.00, 'Paint', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-054', 'Putty', 'kg', 65.00, 'Paint', true),

-- Electrical
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-060', 'THHN Wire 2.0mm', 'meter', 12.50, 'Electrical', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-061', 'THHN Wire 3.5mm', 'meter', 22.00, 'Electrical', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-062', 'PVC Conduit 1/2"', 'length', 85.00, 'Electrical', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-063', 'Utility Box', 'pc', 28.00, 'Electrical', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-064', 'Duplex Convenience Outlet', 'pc', 45.00, 'Electrical', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-065', 'Single Gang Switch', 'pc', 38.00, 'Electrical', true),

-- Plumbing
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-070', 'PVC Pipe 1/2" (SCH40)', 'length', 95.00, 'Plumbing', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-071', 'PVC Pipe 3/4" (SCH40)', 'length', 125.00, 'Plumbing', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-072', 'PVC Pipe 1" (SCH40)', 'length', 165.00, 'Plumbing', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-073', 'PVC Elbow 1/2"', 'pc', 8.50, 'Plumbing', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-074', 'PVC Tee 1/2"', 'pc', 12.00, 'Plumbing', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'MAT-075', 'PVC Solvent Cement', 'can', 165.00, 'Plumbing', true);

-- ============================================================================
-- LABOR TYPES (NCR Rates 2026)
-- ============================================================================

INSERT INTO labor_types (organization_id, trade, daily_rate, skill_level, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Construction Helper', 650.00, 'helper', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Mason', 950.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Carpenter', 900.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Steel Worker (Rebar)', 850.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Painter', 800.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Tile Setter', 950.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Plumber', 1000.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Electrician', 1050.00, 'skilled', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Welder', 1100.00, 'specialist', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Heavy Equipment Operator', 1200.00, 'specialist', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Foreman', 1250.00, 'foreman', true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'Driver', 750.00, 'skilled', true);

-- ============================================================================
-- EQUIPMENT (NCR Rental Rates 2026)
-- ============================================================================

INSERT INTO equipment (organization_id, code, name, rate_type, rate, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-001', 'Concrete Mixer (1 bag)', 'daily', 650.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-002', 'Concrete Vibrator', 'daily', 550.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-003', 'Scaffolding (per set)', 'daily', 85.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-004', 'Transit Mixer (6 cu.m)', 'hourly', 1500.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-005', 'Concrete Pump', 'hourly', 2500.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-006', 'Bar Cutter & Bender', 'daily', 450.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-007', 'Circular Saw', 'daily', 350.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-008', 'Power Drill', 'daily', 250.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-009', 'Grinder (4")', 'daily', 280.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-010', 'Welding Machine', 'daily', 850.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-011', 'Dump Truck (6-wheeler)', 'daily', 4500.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-012', 'Backhoe', 'hourly', 1800.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-013', 'Generator Set (5kVA)', 'daily', 950.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-014', 'Water Pump', 'daily', 450.00, true),
('795acdd9-9a69-4699-aaee-2787f7babce0', 'EQP-015', 'Compactor (Plate)', 'daily', 550.00, true);

-- ============================================================================
-- ASSEMBLIES (Unit Price Analysis Templates)
-- ============================================================================

-- Assembly: Concrete 21 MPa (Site-Mixed)
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-001', 'Concrete 21 MPa (Site-Mixed)', 'cu.m', 'Concrete Works', true);

-- Get the assembly_id for concrete (will be needed for components)
-- Components for Concrete 21 MPa assembly
-- Formula: 1 cu.m = 6.5 bags cement + 0.5 cu.m sand + 0.8 cu.m gravel

-- Assembly: CHB Wall 100mm (4")
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-002', 'CHB Wall 100mm with Plaster Both Sides', 'sq.m', 'Masonry Works', true);

-- Assembly: Reinforcing Steel (Rebar Installation)
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-003', 'Reinforcing Steel Installation 12mm', 'kg', 'Rebar Works', true);

-- Assembly: Floor Tile Installation
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-004', 'Ceramic Floor Tile 40x40cm Installation', 'sq.m', 'Finishing Works', true);

-- Assembly: Painting (2 coats)
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-005', 'Acrylic Paint Application 2 Coats', 'sq.m', 'Painting Works', true);

-- Assembly: Formwork for Columns
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-006', 'Formwork for Columns (4 uses)', 'sq.m', 'Formwork', true);

-- Assembly: Formwork for Beams
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-007', 'Formwork for Beams (4 uses)', 'sq.m', 'Formwork', true);

-- Assembly: Formwork for Slabs
INSERT INTO assemblies (organization_id, code, name, unit, category, is_active) VALUES
('795acdd9-9a69-4699-aaee-2787f7babce0', 'ASM-008', 'Formwork for Slabs (4 uses)', 'sq.m', 'Formwork', true);

-- ============================================================================
-- ASSEMBLY COMPONENTS
-- Note: These would normally reference actual material/labor/equipment IDs
-- For seed data, we'll use a script to populate after materials are inserted
-- ============================================================================

-- Example for Concrete 21 MPa (ASM-001)
-- This requires the actual IDs from the materials and labor_types tables
-- Components:
-- - Portland Cement: 6.5 bags
-- - Sand: 0.5 cu.m
-- - Gravel: 0.8 cu.m
-- - Mason: 0.5 mandays (4 hours = 4/8 = 0.5)
-- - Helper: 1.0 mandays (8 hours = 1.0)
-- - Concrete Mixer: 1 day rental

-- Example for CHB Wall 100mm (ASM-002)
-- Components per sq.m:
-- - CHB 4": 12.5 pcs
-- - Cement (for mortar): 0.15 bags
-- - Sand: 0.012 cu.m
-- - Cement (for plaster): 0.08 bags
-- - Sand (for plaster): 0.016 cu.m
-- - Mason: 0.3 mandays
-- - Helper: 0.3 mandays

-- Example for Rebar 12mm (ASM-003)
-- Components per kg:
-- - Rebar 12mm: 1.08 kg (8% wastage)
-- - Tie Wire: 0.015 kg
-- - Steel Worker: 0.008 mandays (6.4 mins per kg)
-- - Helper: 0.004 mandays

-- Example for Floor Tiles 40x40cm (ASM-004)
-- Components per sq.m:
-- - Ceramic Tiles 40x40: 1.05 sq.m (5% wastage)
-- - Tile Adhesive: 0.15 bags
-- - Grout: 0.5 kg
-- - Tile Setter: 0.25 mandays
-- - Helper: 0.125 mandays

-- ============================================================================
-- NOTES
-- ============================================================================

-- After running this seed data:
-- 1. Replace 795acdd9-9a69-4699-aaee-2787f7babce0 with actual organization UUID
-- 2. Create assembly_components linking to actual material/labor/equipment IDs
-- 3. Verify NCR prices are current for your region
-- 4. Adjust labor rates based on current minimum wage and market rates
-- 5. Update equipment rental rates based on local suppliers

-- Script to get IDs for creating assembly components:
-- SELECT id, name FROM materials WHERE organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0' ORDER BY code;
-- SELECT id, trade FROM labor_types WHERE organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0';
-- SELECT id, name FROM equipment WHERE organization_id = '795acdd9-9a69-4699-aaee-2787f7babce0' ORDER BY code;
