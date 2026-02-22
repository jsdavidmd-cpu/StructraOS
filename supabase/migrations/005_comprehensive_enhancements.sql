-- STRUCTRA Comprehensive Enhancements
-- Sprint 2: Advanced BOQ Features, Trade Calculators, Bar Scheduling

-- ============================================================================
-- ENHANCE ESTIMATE ITEMS (BOQ) - Section Grouping & Dual Pricing
-- ============================================================================

ALTER TABLE boq_items
ADD COLUMN section VARCHAR(100) DEFAULT 'PART A. GENERAL REQUIREMENTS',
ADD COLUMN markup_percent DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN internal_amount DECIMAL(15,2), -- Direct cost without markup
ADD COLUMN contract_amount DECIMAL(15,2), -- Client billing with markup
ADD COLUMN material_cost DECIMAL(15,2) DEFAULT 0,
ADD COLUMN labor_cost DECIMAL(15,2) DEFAULT 0,
ADD COLUMN equipment_cost DECIMAL(15,2) DEFAULT 0,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- ============================================================================
-- ENHANCE ASSEMBLY COMPONENTS - Wastage Factors
-- ============================================================================

ALTER TABLE assembly_components
ADD COLUMN wastage_factor DECIMAL(5,2) DEFAULT 0.00; -- Percentage (e.g., 5.00 for 5%)

COMMENT ON COLUMN assembly_components.wastage_factor IS 'Wastage percentage for material loss (0-100)';

-- ============================================================================
-- REBAR WEIGHT TABLES (ASTM A 615:1995)
-- ============================================================================

CREATE TABLE rebar_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bar_size VARCHAR(10) NOT NULL, -- 10mm, 12mm, 16mm, 20mm, 25mm, 28mm, 32mm
    diameter_mm DECIMAL(6,2) NOT NULL,
    weight_per_meter DECIMAL(8,4) NOT NULL, -- kg/m
    standard VARCHAR(50) DEFAULT 'ASTM A 615:1995',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert ASTM standard weights
INSERT INTO rebar_weights (bar_size, diameter_mm, weight_per_meter) VALUES
('10mm', 10.00, 0.617),
('12mm', 12.00, 0.888),
('16mm', 16.00, 1.578),
('20mm', 20.00, 2.466),
('25mm', 25.00, 3.854),
('28mm', 28.00, 4.834),
('32mm', 32.00, 6.313),
('36mm', 36.00, 7.990);

-- ============================================================================
-- BAR SCHEDULES - Rebar Cutting Lists & Optimization
-- ============================================================================

CREATE TABLE bar_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    bar_mark VARCHAR(50) NOT NULL, -- e.g., "F1", "C1", "B1"
    element_type VARCHAR(50), -- FOOTING, COLUMN, BEAM, SLAB
    bar_size VARCHAR(10) NOT NULL, -- 10mm, 12mm, etc.
    quantity INTEGER NOT NULL,
    length_mm INTEGER NOT NULL, -- Cut length in mm
    shape_code VARCHAR(10), -- 00, 11, 21, 31, etc. (BS 8666)
    dimension_a INTEGER, -- Hook/bend dimensions
    dimension_b INTEGER,
    dimension_c INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bar_schedules_org ON bar_schedules(organization_id);
CREATE INDEX idx_bar_schedules_estimate ON bar_schedules(estimate_id);
CREATE INDEX idx_bar_schedules_bar_size ON bar_schedules(bar_size);

-- Calculate total weight and material optimization
CREATE OR REPLACE FUNCTION calculate_bar_schedule_summary(schedule_id UUID)
RETURNS TABLE(
    total_pcs INTEGER,
    total_length_m DECIMAL(10,2),
    total_weight_kg DECIMAL(10,2),
    bars_needed INTEGER, -- 9m standard bars
    tie_wire_kg DECIMAL(8,3)
) AS $$
DECLARE
    v_bar_size VARCHAR(10);
    v_weight_per_m DECIMAL(8,4);
    v_quantity INTEGER;
    v_length_mm INTEGER;
BEGIN
    SELECT bar_size, quantity, length_mm 
    INTO v_bar_size, v_quantity, v_length_mm
    FROM bar_schedules WHERE id = schedule_id;
    
    SELECT weight_per_meter INTO v_weight_per_m
    FROM rebar_weights WHERE bar_size = v_bar_size;
    
    RETURN QUERY SELECT
        v_quantity,
        ROUND((v_quantity * v_length_mm / 1000.0)::NUMERIC, 2),
        ROUND((v_quantity * v_length_mm / 1000.0 * v_weight_per_m)::NUMERIC, 2),
        CEIL(v_quantity * v_length_mm / 9000.0)::INTEGER, -- 9m bars
        ROUND((v_quantity * v_length_mm / 1000.0 * v_weight_per_m * 0.015)::NUMERIC, 3); -- 1.5% tie wire
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FORMWORK REUSE TRACKING
-- ============================================================================

CREATE TABLE formwork_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id), -- Plywood, lumber reference
    item_description VARCHAR(255) NOT NULL,
    unit VARCHAR(20) DEFAULT 'sheet',
    purchase_price DECIMAL(12,2) NOT NULL,
    max_uses INTEGER DEFAULT 4, -- Industry standard: 4 uses
    current_use_count INTEGER DEFAULT 0,
    depreciation_per_use DECIMAL(12,2), -- Auto-calculated
    current_value DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'active', -- active, retired, damaged
    last_used_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_formwork_cycles_org ON formwork_cycles(organization_id);
CREATE INDEX idx_formwork_cycles_material ON formwork_cycles(material_id);
CREATE INDEX idx_formwork_cycles_status ON formwork_cycles(status);

-- Auto-calculate depreciation
CREATE OR REPLACE FUNCTION update_formwork_depreciation()
RETURNS TRIGGER AS $$
BEGIN
    NEW.depreciation_per_use = NEW.purchase_price / NEW.max_uses;
    NEW.current_value = NEW.purchase_price - (NEW.depreciation_per_use * NEW.current_use_count);
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_formwork_depreciation
BEFORE INSERT OR UPDATE ON formwork_cycles
FOR EACH ROW EXECUTE FUNCTION update_formwork_depreciation();

-- ============================================================================
-- TRADE CALCULATORS - Template Storage
-- ============================================================================

CREATE TABLE calculator_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    trade VARCHAR(50) NOT NULL, -- CONCRETE, CHB, REBAR, FORMWORK, PAINT
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    formula_config JSONB NOT NULL, -- Store calculator formulas as JSON
    default_values JSONB, -- Default inputs
    output_mapping JSONB, -- Maps to material quantities
    is_system BOOLEAN DEFAULT false, -- System templates vs user-created
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_calculator_templates_org ON calculator_templates(organization_id);
CREATE INDEX idx_calculator_templates_trade ON calculator_templates(trade);

-- ============================================================================
-- SEED CALCULATOR TEMPLATES
-- ============================================================================

-- Concrete Calculator Template
INSERT INTO calculator_templates (organization_id, trade, template_name, description, formula_config, default_values, is_system) VALUES
(
    '795acdd9-9a69-4699-aaee-2787f7babce0',
    'CONCRETE',
    'Concrete Mix Design Calculator',
    'Calculate cement, sand, gravel for concrete mix',
    '{
        "inputs": [
            {"name": "volume_m3", "label": "Volume (cu.m)", "type": "number"},
            {"name": "mix_ratio", "label": "Mix Ratio", "type": "select", "options": ["1:2:4", "1:2:3", "1:1.5:3"]},
            {"name": "wastage", "label": "Wastage %", "type": "number"}
        ],
        "formulas": {
            "cement_bags": "volume_m3 * 6.5 * (1 + wastage/100)",
            "sand_m3": "volume_m3 * 0.5 * (1 + wastage/100)",
            "gravel_m3": "volume_m3 * 0.8 * (1 + wastage/100)"
        }
    }',
    '{"volume_m3": 1, "mix_ratio": "1:2:4", "wastage": 5}',
    true
);

-- CHB Calculator Template
INSERT INTO calculator_templates (organization_id, trade, template_name, description, formula_config, default_values, is_system) VALUES
(
    '795acdd9-9a69-4699-aaee-2787f7babce0',
    'CHB',
    'CHB Wall Calculator',
    'Calculate CHB blocks, mortar for wall area',
    '{
        "inputs": [
            {"name": "area_m2", "label": "Wall Area (sq.m)", "type": "number"},
            {"name": "chb_size", "label": "CHB Size", "type": "select", "options": ["4 inch", "6 inch", "8 inch"]},
            {"name": "with_plaster", "label": "With Plaster", "type": "boolean"}
        ],
        "formulas": {
            "chb_pcs": "area_m2 * 12.5",
            "cement_mortar_bags": "area_m2 * 0.15",
            "sand_mortar_m3": "area_m2 * 0.012",
            "cement_plaster_bags": "with_plaster ? area_m2 * 0.08 : 0",
            "sand_plaster_m3": "with_plaster ? area_m2 * 0.016 : 0"
        }
    }',
    '{"area_m2": 10, "chb_size": "4 inch", "with_plaster": true}',
    true
);

-- Rebar Calculator Template
INSERT INTO calculator_templates (organization_id, trade, template_name, description, formula_config, default_values, is_system) VALUES
(
    '795acdd9-9a69-4699-aaee-2787f7babce0',
    'REBAR',
    'Rebar Quantity Calculator',
    'Calculate rebar weight from dimensions',
    '{
        "inputs": [
            {"name": "bar_size", "label": "Bar Size", "type": "select", "options": ["10mm", "12mm", "16mm", "20mm", "25mm"]},
            {"name": "total_length_m", "label": "Total Length (m)", "type": "number"},
            {"name": "wastage", "label": "Wastage %", "type": "number"}
        ],
        "formulas": {
            "weight_kg": "total_length_m * weight_per_m * (1 + wastage/100)",
            "tie_wire_kg": "weight_kg * 0.015"
        }
    }',
    '{"bar_size": "12mm", "total_length_m": 100, "wastage": 8}',
    true
);

-- Formwork Calculator Template
INSERT INTO calculator_templates (organization_id, trade, template_name, description, formula_config, default_values, is_system) VALUES
(
    '795acdd9-9a69-4699-aaee-2787f7babce0',
    'FORMWORK',
    'Formwork Area Calculator',
    'Calculate plywood, lumber for formwork',
    '{
        "inputs": [
            {"name": "area_m2", "label": "Formwork Area (sq.m)", "type": "number"},
            {"name": "element_type", "label": "Element", "type": "select", "options": ["Column", "Beam", "Slab"]},
            {"name": "reuse_count", "label": "Reuse Count", "type": "number"}
        ],
        "formulas": {
            "plywood_sheets": "area_m2 / 2.88 / reuse_count",
            "lumber_2x2_pcs": "area_m2 * 2.5",
            "lumber_2x3_pcs": "area_m2 * 1.2",
            "nails_kg": "area_m2 * 0.3"
        }
    }',
    '{"area_m2": 20, "element_type": "Column", "reuse_count": 4}',
    true
);

-- Paint Calculator Template
INSERT INTO calculator_templates (organization_id, trade, template_name, description, formula_config, default_values, is_system) VALUES
(
    '795acdd9-9a69-4699-aaee-2787f7babce0',
    'PAINT',
    'Paint Coverage Calculator',
    'Calculate paint quantity for area coverage',
    '{
        "inputs": [
            {"name": "area_m2", "label": "Surface Area (sq.m)", "type": "number"},
            {"name": "coats", "label": "Number of Coats", "type": "number"},
            {"name": "coverage_rate", "label": "Coverage (sq.m/gal)", "type": "number"}
        ],
        "formulas": {
            "paint_gallons": "area_m2 * coats / coverage_rate",
            "thinner_liters": "paint_gallons * 0.5",
            "putty_kg": "area_m2 * 0.2"
        }
    }',
    '{"area_m2": 50, "coats": 2, "coverage_rate": 25}',
    true
);

-- ============================================================================
-- UPDATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_boq_items_section ON boq_items(section);
CREATE INDEX idx_boq_items_estimate_section ON boq_items(estimate_id, section);

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- BOQ Summary by Section
CREATE OR REPLACE VIEW vw_boq_by_section AS
SELECT 
    bi.estimate_id,
    bi.section,
    COUNT(*) as item_count,
    SUM(bi.qty * bi.unit_price) as direct_cost,
    SUM(bi.internal_amount) as total_internal,
    SUM(bi.contract_amount) as total_contract,
    SUM(bi.material_cost) as total_material,
    SUM(bi.labor_cost) as total_labor,
    SUM(bi.equipment_cost) as total_equipment
FROM boq_items bi
WHERE bi.is_active = true
GROUP BY bi.estimate_id, bi.section
ORDER BY bi.section;

-- Bar Schedule Summary
CREATE OR REPLACE VIEW vw_bar_schedule_summary AS
SELECT 
    bs.estimate_id,
    bs.bar_size,
    bs.element_type,
    COUNT(*) as mark_count,
    SUM(bs.quantity) as total_pcs,
    ROUND(SUM(bs.quantity * bs.length_mm / 1000.0)::NUMERIC, 2) as total_length_m,
    ROUND(SUM(bs.quantity * bs.length_mm / 1000.0 * rw.weight_per_meter)::NUMERIC, 2) as total_weight_kg
FROM bar_schedules bs
LEFT JOIN rebar_weights rw ON bs.bar_size = rw.bar_size
GROUP BY bs.estimate_id, bs.bar_size, bs.element_type;

-- ============================================================================
-- FUNCTIONS FOR BOQ ENHANCEMENTS
-- ============================================================================

-- Calculate internal vs contract amounts for estimate item
CREATE OR REPLACE FUNCTION calculate_boq_pricing(
    p_direct_cost DECIMAL(15,2),
    p_markup_percent DECIMAL(5,2)
) RETURNS TABLE(
    internal_amount DECIMAL(15,2),
    contract_amount DECIMAL(15,2),
    profit_amount DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY SELECT
        p_direct_cost,
        ROUND((p_direct_cost * (1 + p_markup_percent / 100))::NUMERIC, 2),
        ROUND((p_direct_cost * p_markup_percent / 100)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for new tables
ALTER TABLE bar_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE formwork_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculator_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization bar schedules"
    ON bar_schedules FOR SELECT
    USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage own organization bar schedules"
    ON bar_schedules FOR ALL
    USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can view own organization formwork cycles"
    ON formwork_cycles FOR SELECT
    USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage own organization formwork cycles"
    ON formwork_cycles FOR ALL
    USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can view own organization calculator templates"
    ON calculator_templates FOR SELECT
    USING (organization_id = public.user_organization_id());

CREATE POLICY "Users can manage own organization calculator templates"
    ON calculator_templates FOR ALL
    USING (organization_id = public.user_organization_id());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE rebar_weights IS 'ASTM A 615:1995 standard rebar weights for bar scheduling';
COMMENT ON TABLE bar_schedules IS 'Rebar cutting lists with optimization for 9m standard bars';
COMMENT ON TABLE formwork_cycles IS 'Track formwork material reuse for cost depreciation';
COMMENT ON TABLE calculator_templates IS 'Trade-specific quantity takeoff calculators';
COMMENT ON COLUMN boq_items.section IS 'BOQ section grouping (e.g., PART A, PART B)';
COMMENT ON COLUMN boq_items.markup_percent IS 'Profit margin percentage over direct cost';
COMMENT ON COLUMN boq_items.internal_amount IS 'Direct cost without markup';
COMMENT ON COLUMN boq_items.contract_amount IS 'Client billing amount with markup';
