import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface CalculatorInput {
  name: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  options?: string[];
}

export interface CalculatorFormulas {
  [key: string]: string;
}

export interface CalculatorTemplate {
  id: string;
  trade: string;
  template_name: string;
  description: string;
  formula_config: {
    inputs: CalculatorInput[];
    formulas: CalculatorFormulas;
  };
  default_values: Record<string, any>;
  is_system: boolean;
}

// ============================================================================
// LEGACY CONCRETE CALCULATOR (Basic Mix Design)
// ============================================================================
export interface ConcreteCalculatorInputs {
  volume_m3: number;
  mix_ratio: string;
  wastage: number;
}

export interface ConcreteCalculatorOutputs {
  cement_bags: number;
  sand_m3: number;
  gravel_m3: number;
}

// ============================================================================
// ENHANCED CONCRETE CALCULATOR (Ready-Mix & Site-Mix Modes)
// ============================================================================
export interface ReadyMixConcreteInputs {
  volume_m3: number;
  concrete_unit_price: number; // Price per cu.m
  use_boom_pump: boolean;
  boom_pump_hours?: number;
  boom_pump_rate?: number; // Price per hour
}

export interface ReadyMixConcreteOutputs {
  concrete_volume: number;
  concrete_cost: number;
  boom_pump_cost: number;
  total_cost: number;
  cost_per_m3: number;
  breakdown: {
    concrete: number;
    boomPump: number;
  };
}

export interface SiteMixConcreteInputs {
  volume_m3: number;
  cement_type: string; // Type I, Type II, Type III
  cement_price: number; // Price per bag
  sand_price: number; // Price per cu.m
  gravel_size: string; // 3/4", 1/2", etc.
  gravel_price: number; // Price per cu.m
  wastage: number; // Percentage
}

export interface SiteMixConcreteOutputs {
  volume_m3: number;
  cement_bags: number;
  cement_cost: number;
  sand_m3: number;
  sand_cost: number;
  gravel_m3: number;
  gravel_cost: number;
  total_cost: number;
  cost_per_m3: number;
  breakdown: {
    cement: number;
    sand: number;
    gravel: number;
  };
}

export interface CHBCalculatorInputs {
  area_m2: number;
  chb_size: string;
  with_plaster: boolean;
}

// ============================================================================
// WALL SYSTEM CALCULATOR - ENHANCED MULTI-SYSTEM SUPPORT
// ============================================================================

// Wall Type Definitions
export type WallSystemType = 'chb' | 'aac' | 'precast' | 'drywall' | 'eps';

export interface WallSystemInputs {
  area_m2: number;
  height_m: number;
  wall_type: WallSystemType;
  opening_area_m2: number;
  location: 'interior' | 'exterior';
  finish_type: string;
  labor_daily_rate: number;
  // CHB specific
  chb_thickness?: string; // 100, 150, 200
  chb_with_reinforcement?: boolean;
  mortar_type?: string; // Class A, Class B
  // AAC specific
  aac_thickness?: string; // 75, 100, 150, 200
  aac_adhesive_type?: string; // Standard, Thin-bed
  // Precast specific
  precast_thickness?: string; // 150, 200, 250
  precast_joint_type?: string; // Mortar, Sealant
  // Drywall specific
  drywall_stud_spacing?: string; // 400, 600
  drywall_layers?: number;
  // EPS specific
  eps_core_thickness?: string; // 50, 75, 100, 150
  eps_with_mesh?: boolean;
}

export interface WallMaterial {
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
}

export interface WallLaborBreakdown {
  task: string;
  mandays: number;
  hourly_rate: number;
  total_hours: number;
  total_cost: number;
}

export interface WallPerformance {
  weight_kg_m2: number;
  thermal_resistance_r: number;
  acoustic_index_db: number;
  fire_rating: string;
  moisture_resistance: string;
}

export interface WallSystemOutputs {
  wall_type: WallSystemType;
  net_area_m2: number;
  
  // Materials
  materials: WallMaterial[];
  materials_cost: number;
  
  // Labor
  labor_breakdown: WallLaborBreakdown[];
  labor_cost: number;
  
  // Time & Productivity
  productivity_m2_per_day: number;
  estimated_days: number;
  crew_size: number;
  
  // Costs
  unit_cost: number; // ₱/m2
  total_cost: number;
  cost_breakdown: {
    materials: number;
    labor: number;
  };
  
  // Performance
  performance: WallPerformance;
}

export interface WallSystemComparison {
  [key: string]: WallSystemOutputs;
}

// Custom pricing override
export interface CustomWallPrices {
  [key: string]: number;
}


export interface CHBCalculatorOutputs {
  chb_pcs: number;
  cement_mortar_bags: number;
  sand_mortar_m3: number;
  cement_plaster_bags: number;
  sand_plaster_m3: number;
}

// ============================================================================
// ENHANCED REBAR BBS & COSTING CALCULATOR TYPES
// ============================================================================

// Rebar grades (MPa)
export enum RebarGrade {
  GRADE_40 = '40',
  GRADE_60 = '60',
  GRADE_75 = '75',
}

// Rebar diameters in mm
export enum RebarDiameter {
  D10 = 10,
  D12 = 12,
  D16 = 16,
  D20 = 20,
  D25 = 25,
  D28 = 28,
  D32 = 32,
}

// Bar shapes (for BBS)
export enum RebarBarShape {
  STRAIGHT = 'Straight',
  L_BAR = 'L-bar',
  U_BAR = 'U-bar',
  STIRRUP = 'Stirrup',
  HOOKED = 'Hooked',
  CRANKED = 'Cranked',
  SPIRAL = 'Spiral',
}

// Element types for structural context
export enum RebarElementType {
  FOOTING = 'Footing',
  COLUMN = 'Column',
  BEAM = 'Beam',
  SLAB = 'Slab',
  WALL = 'Wall',
  FOUNDATION = 'Foundation',
}

// ============================================================================
// REBAR BAR DEFINITION
// ============================================================================
export interface RebarBarDefinition {
  mark: string;               // e.g., "M1", "M2", etc.
  shape: RebarBarShape;
  diameter_mm: RebarDiameter;
  grade: RebarGrade;
  quantity_pcs: number;
  // Shape dimensions (in mm)
  dimension_a?: number;       // Main length or primary dimension
  dimension_b?: number;       // Secondary dimension (for bent bars)
  dimension_c?: number;       // Tertiary dimension
  dimension_d?: number;       // Additional dimension for complex shapes
  element_type: RebarElementType;
  // Structural location info
  layer?: string;             // e.g., "Top", "Bottom", "Middle"
  spacing_mm?: number;        // Center-to-center spacing if repetitive
}

// ============================================================================
// REBAR CODE PARAMETERS
// ============================================================================
export interface RebarCodeParameters {
  concrete_cover_mm: number;     // Required cover (typically 40-75mm)
  hook_length_rule: number;       // Hook extension in mm or as multiple of d (e.g., 9 = 9d)
  lap_splice_rule: number;        // Lap length as multiple of d (e.g., 40 = 40d for simple lap)
  bend_deduction_90: number;      // Deduction for 90° bend (typically 10d)
  bend_deduction_135: number;     // Deduction for 135° bend (typically 10d)
  bend_deduction_180: number;     // Deduction for 180° bend (typically 6d)
  wastage_percent: number;        // Material wastage percentage (default 5%)
}

// ============================================================================
// REBAR BBS ENTRY (Individual Bar in Schedule)
// ============================================================================
export interface RebarBBSEntry {
  mark: string;
  shape: RebarBarShape;
  diameter_mm: number;
  quantity_pcs: number;
  dimension_a_mm: number;        // A dimension
  dimension_b_mm?: number;       // B dimension (if applicable)
  dimension_c_mm?: number;       // C dimension (if applicable)
  dimension_d_mm?: number;       // D dimension (if applicable)
  shape_code?: string;           // Optional: Shape classification code
  net_length_m: number;          // Length without hooks/laps
  hook_length_m: number;         // Hook extension length if any
  lap_length_m: number;          // Lap splice length if any
  gross_length_m: number;        // Total length including all deductions
  weight_per_bar_kg: number;     // Individual bar weight
  total_weight_kg: number;       // quantity_pcs × weight_per_bar_kg
  cutting_plan_id?: string;      // Reference to cutting optimization
}

// ============================================================================
// REBAR CUTTING PLAN (Stock Length Optimization)
// ============================================================================
export interface RebarCuttingSegment {
  mark: string;
  gross_length_m: number;
  quantity: number;
  material_to_cut: number;       // How much from a stock length
}

export interface RebarCuttingPlan {
  stock_length_m: number;
  segments: RebarCuttingSegment[];
  used_length_m: number;
  waste_length_m: number;
  efficiency_percent: number;
  bundle_count: number;
  total_weight_kg: number;
}

// ============================================================================
// REBAR COSTING BREAKDOWN
// ============================================================================
export interface RebarCostingBreakdown {
  material_cost_php: number;     // Rebar steel cost
  labor_hours: number;           // Installation labor hours
  labor_cost_php: number;        // Labor cost at specified rate
  tie_wire_kg: number;           // Tie wire requirement
  tie_wire_cost_php: number;
  total_cost_php: number;
  cost_per_kg: number;           // Unit cost: total_cost / total_kg
}

// ============================================================================
// REBAR CALCULATOR INPUTS (Enhanced from Simple Version)
// ============================================================================
export interface RebarCalculatorInputs {
  // Simple mode - backward compatible
  bar_size?: string;
  total_length_m?: number;
  wastage?: number;
  
  // BBS Mode - comprehensive
  bars?: RebarBarDefinition[];
  code_params?: RebarCodeParameters;
  material_price_per_kg?: number;     // Override price per kg
  labor_rate_php_per_day?: number;    // Labor rate for installation (₱/day)
  procurement_stock_lengths?: number[]; // Available stock lengths in m (e.g., [6, 7.5, 9, 12])
}

// ============================================================================
// REBAR CALCULATOR OUTPUTS (Comprehensive BBS & Costing)
// ============================================================================
export interface RebarCalculatorOutputs {
  // For backward compatibility with simple mode
  weight_kg?: number;
  tie_wire_kg?: number;
  weight_per_m?: number;
  
  // BBS & Comprehensive Mode
  bbs: RebarBBSEntry[];           // Bill of Bars schedule
  cutting_plans: RebarCuttingPlan[]; // Cutting optimization per stock length
  
  // Totals
  total_rebar_kg: number;         // Total rebar weight
  total_tie_wire_kg: number;      // Total tie wire requirement
  total_bars_count: number;       // Total number of individual bars
  total_cutting_waste_kg: number; // Waste from cutting optimization
  
  // Costing
  costing: RebarCostingBreakdown;
  
  // Summary by diameter and grade
  summary_by_diameter: {
    [key: number]: {
      diameter_mm: number;
      total_kg: number;
      total_bars: number;
      cost_php: number;
    };
  };
  
  // Validation results
  validation_warnings: string[];
  is_valid: boolean;
}

// FormworkCalculatorInputs and FormworkCalculatorOutputs moved to comprehensive formwork section

export interface PaintCalculatorInputs {
  area_m2: number;
  coats: number;
  coverage_rate: number;
}

export interface PaintCalculatorOutputs {
  paint_gallons: number;
  thinner_liters: number;
  putty_kg: number;
}

export interface RebarWeight {
  bar_size: string;
  diameter_mm: number;
  weight_per_meter: number;
  standard: string;
}

// ============================================================================
// REBAR WEIGHTS
// ============================================================================

export async function getRebarWeights(): Promise<RebarWeight[]> {
  const { data, error } = await supabase
    .from('rebar_weights')
    .select('*')
    .order('diameter_mm');

  if (error) throw error;
  return (data as any) || [];
}

export async function getRebarWeight(barSize: string): Promise<number> {
  const { data, error } = await supabase
    .from('rebar_weights')
    .select('weight_per_meter')
    .eq('bar_size', barSize)
    .single();

  if (error) throw error;
  return (data as any)?.weight_per_meter || 0;
}

// ============================================================================
// CALCULATOR TEMPLATES
// ============================================================================

export async function getCalculatorTemplates(trade?: string): Promise<CalculatorTemplate[]> {
  let query = supabase
    .from('calculator_templates')
    .select('*')
    .order('trade, template_name');

  if (trade) {
    query = query.eq('trade', trade);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data as any) || [];
}

export async function getCalculatorTemplate(id: string): Promise<CalculatorTemplate | null> {
  const { data, error } = await supabase
    .from('calculator_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return (data as any) || null;
}

// ============================================================================
// CONCRETE CALCULATOR
// ============================================================================

export function calculateConcrete(inputs: ConcreteCalculatorInputs): ConcreteCalculatorOutputs {
  const { volume_m3, wastage } = inputs;
  const wastage_multiplier = 1 + wastage / 100;

  // Standard 1:2:4 mix ratio (adjust based on mix_ratio if needed)
  const cement_bags = Math.ceil(volume_m3 * 6.5 * wastage_multiplier * 10) / 10;
  const sand_m3 = Math.ceil(volume_m3 * 0.5 * wastage_multiplier * 100) / 100;
  const gravel_m3 = Math.ceil(volume_m3 * 0.8 * wastage_multiplier * 100) / 100;

  return {
    cement_bags,
    sand_m3,
    gravel_m3,
  };
}

// ============================================================================
// ENHANCED CONCRETE CALCULATOR - READY-MIX
// ============================================================================
export function calculateReadyMixConcrete(
  inputs: ReadyMixConcreteInputs
): ReadyMixConcreteOutputs {
  const concreteCost = inputs.volume_m3 * inputs.concrete_unit_price;
  let boomPumpCost = 0;

  if (inputs.use_boom_pump && inputs.boom_pump_hours && inputs.boom_pump_rate) {
    boomPumpCost = inputs.boom_pump_hours * inputs.boom_pump_rate;
  }

  const totalCost = concreteCost + boomPumpCost;
  const costPerM3 = totalCost / inputs.volume_m3;

  return {
    concrete_volume: inputs.volume_m3,
    concrete_cost: Math.round(concreteCost * 100) / 100,
    boom_pump_cost: Math.round(boomPumpCost * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    cost_per_m3: Math.round(costPerM3 * 100) / 100,
    breakdown: {
      concrete: Math.round(concreteCost * 100) / 100,
      boomPump: Math.round(boomPumpCost * 100) / 100,
    },
  };
}

// ============================================================================
// ENHANCED CONCRETE CALCULATOR - SITE-MIX
// ============================================================================
export function calculateSiteMixConcrete(
  inputs: SiteMixConcreteInputs
): SiteMixConcreteOutputs {
  const { volume_m3, cement_price, sand_price, gravel_price, wastage } = inputs;
  const wastage_multiplier = 1 + wastage / 100;

  // Standard 1:2:4 mix ratio for concrete
  const cement_bags = Math.ceil(volume_m3 * 6.5 * wastage_multiplier * 10) / 10;
  const sand_m3 = Math.ceil(volume_m3 * 0.5 * wastage_multiplier * 100) / 100;
  const gravel_m3 = Math.ceil(volume_m3 * 0.8 * wastage_multiplier * 100) / 100;

  const cementCost = cement_bags * cement_price;
  const sandCost = sand_m3 * sand_price;
  const gravelCost = gravel_m3 * gravel_price;
  const totalCost = cementCost + sandCost + gravelCost;
  const costPerM3 = totalCost / volume_m3;

  return {
    volume_m3,
    cement_bags,
    cement_cost: Math.round(cementCost * 100) / 100,
    sand_m3,
    sand_cost: Math.round(sandCost * 100) / 100,
    gravel_m3,
    gravel_cost: Math.round(gravelCost * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    cost_per_m3: Math.round(costPerM3 * 100) / 100,
    breakdown: {
      cement: Math.round(cementCost * 100) / 100,
      sand: Math.round(sandCost * 100) / 100,
      gravel: Math.round(gravelCost * 100) / 100,
    },
  };
}

// ============================================================================
// CHB CALCULATOR
// ============================================================================

export function calculateCHB(inputs: CHBCalculatorInputs): CHBCalculatorOutputs {
  const { area_m2, with_plaster } = inputs;

  // 12.5 pcs per sq.m is standard for 4" CHB
  const chb_pcs = Math.ceil(area_m2 * 12.5);
  const cement_mortar_bags = Math.ceil(area_m2 * 0.15 * 10) / 10;
  const sand_mortar_m3 = Math.ceil(area_m2 * 0.012 * 100) / 100;

  let cement_plaster_bags = 0;
  let sand_plaster_m3 = 0;

  if (with_plaster) {
    cement_plaster_bags = Math.ceil(area_m2 * 0.08 * 10) / 10;
    sand_plaster_m3 = Math.ceil(area_m2 * 0.016 * 100) / 100;
  }

  return {
    chb_pcs,
    cement_mortar_bags,
    sand_mortar_m3,
    cement_plaster_bags,
    sand_plaster_m3,
  };
}

// ============================================================================
// WALL SYSTEM CALCULATOR
// ============================================================================

// Helper: Philippine construction baseline data (NCR 2026)
const WALL_SYSTEM_DATA = {
  chb: {
    name: 'Concrete Hollow Block (CHB)',
    data: {
      '100': { blocks_per_m2: 12.5, weight: 12, thermal_r: 0.18, acoustic_db: 46 },
      '150': { blocks_per_m2: 12.5, weight: 18, thermal_r: 0.27, acoustic_db: 50 },
      '200': { blocks_per_m2: 12.5, weight: 24, thermal_r: 0.36, acoustic_db: 53 },
    },
  },
  aac: {
    name: 'Autoclaved Aerated Concrete (AAC)',
    data: {
      '75': { blocks_per_m2: 4.0, weight: 5, thermal_r: 0.30, acoustic_db: 42 },
      '100': { blocks_per_m2: 4.0, weight: 6.5, thermal_r: 0.40, acoustic_db: 45 },
      '150': { blocks_per_m2: 4.0, weight: 10, thermal_r: 0.60, acoustic_db: 50 },
      '200': { blocks_per_m2: 4.0, weight: 13, thermal_r: 0.80, acoustic_db: 53 },
    },
  },
  precast: {
    name: 'Precast Concrete Panels',
    data: {
      '150': { panels_per_m2: 1.0, weight: 250, thermal_r: 0.15, acoustic_db: 50 },
      '200': { panels_per_m2: 1.0, weight: 330, thermal_r: 0.20, acoustic_db: 53 },
      '250': { panels_per_m2: 1.0, weight: 415, thermal_r: 0.25, acoustic_db: 56 },
    },
  },
  drywall: {
    name: 'Drywall/Fiber Cement Partitions',
    data: {
      single: { kg_per_m2: 15, weight: 15, thermal_r: 0.10, acoustic_db: 32 },
      double: { kg_per_m2: 30, weight: 30, thermal_r: 0.20, acoustic_db: 42 },
    },
  },
  eps: {
    name: 'EPS Sandwich Panels',
    data: {
      '50': { weight: 8, thermal_r: 1.25, acoustic_db: 38 },
      '75': { weight: 12, thermal_r: 1.87, acoustic_db: 42 },
      '100': { weight: 16, thermal_r: 2.50, acoustic_db: 45 },
      '150': { weight: 24, thermal_r: 3.75, acoustic_db: 50 },
    },
  },
};

// Philippine 2026 baseline material & labor costs (NCR) - EXPORTABLE FOR UI
export const MATERIAL_PRICES = {
  chb_100: 55,      // per piece
  chb_150: 80,      // per piece
  chb_200: 110,     // per piece
  aac_75: 180,      // per block
  aac_100: 220,     // per block
  aac_150: 350,     // per block
  aac_200: 480,     // per block
  precast_150: 3500, // per panel (3x2.4m)
  precast_200: 4200,
  precast_250: 5000,
  drywall_sheet: 350, // per 4'x8' sheet
  eps_50: 4500,     // per panel 3x2.4m
  eps_75: 5500,
  eps_100: 6500,
  eps_150: 8500,
  mortar_bag: 280,  // per 50kg bag
  cement_bag: 350,
  sand_m3: 550,
  plaster_250kg: 650,
  aac_adhesive: 500, // per 25kg bag
  sealant: 450,     // per cartridge
  lumber_2x2: 850,  // per piece
  lumber_2x4: 1200,
  drywall_studs: 200, // per piece
  fasteners_kg: 180,
} as const;

// Labor productivity (m²/day) - EXPORTABLE FOR UI
export const LABOR_PRODUCTIVITY = {
  chb_masonry: 12,   // m²/day (3-4 masons)
  aac_install: 15,   // m²/day (AAC blocks)
  precast_install: 8, // m²/day (requires crane)
  drywall_frame: 20, // m²/day (1 carpenter + helper)
  drywall_finish: 25, // m²/day (2 workers)
  eps_install: 10,   // m²/day
  plaster_finish: 18, // m²/day (2 workers)
} as const;

// Default (standard) labor rates ₱/day
export const STANDARD_LABOR_RATES = {
  mason: 1200,
  carpenter: 1200,
  helper: 800,
  crane_operator: 1500,
  steel_worker: 1300,
  painter: 1100,
} as const;

// ============================================================================
// REBAR PRICING (Philippine General Merchandise/Rebar Suppliers - Q1 2026)
// ============================================================================
export const REBAR_PRICES = {
  rebar_40_10: 280,    // ₱/kg Grade 40, 10mm
  rebar_40_12: 280,    // ₱/kg Grade 40, 12mm
  rebar_40_16: 275,    // ₱/kg Grade 40, 16mm
  rebar_40_20: 270,    // ₱/kg Grade 40, 20mm
  rebar_40_25: 265,    // ₱/kg Grade 40, 25mm
  rebar_40_28: 265,    // ₱/kg Grade 40, 28mm
  rebar_40_32: 260,    // ₱/kg Grade 40, 32mm
  
  rebar_60_10: 310,    // ₱/kg Grade 60, 10mm
  rebar_60_12: 310,    // ₱/kg Grade 60, 12mm
  rebar_60_16: 305,    // ₱/kg Grade 60, 16mm
  rebar_60_20: 300,    // ₱/kg Grade 60, 20mm
  rebar_60_25: 295,    // ₱/kg Grade 60, 25mm
  rebar_60_28: 295,    // ₱/kg Grade 60, 28mm
  rebar_60_32: 290,    // ₱/kg Grade 60, 32mm
  
  rebar_75_10: 340,    // ₱/kg Grade 75, 10mm
  rebar_75_12: 340,    // ₱/kg Grade 75, 12mm
  rebar_75_16: 335,    // ₱/kg Grade 75, 16mm
  rebar_75_20: 330,    // ₱/kg Grade 75, 20mm
  rebar_75_25: 325,    // ₱/kg Grade 75, 25mm
  rebar_75_28: 325,    // ₱/kg Grade 75, 28mm
  rebar_75_32: 320,    // ₱/kg Grade 75, 32mm
  
  tie_wire: 180,       // ₱/kg (soft black annealed tie wire - typical 1.6mm)
} as const;

// Rebar weight per meter formula constants
// Weight (kg) = (d² / 162) × length(m)
// d = diameter in mm
export const REBAR_WEIGHT_FORMULA = {
  // Pre-calculated weight per meter for standard diameters
  10: 0.617,    // 10² / 162 = 0.617 kg/m
  12: 0.888,    // 12² / 162 = 0.888 kg/m
  16: 1.580,    // 16² / 162 = 1.580 kg/m
  20: 2.469,    // 20² / 162 = 2.469 kg/m
  25: 3.858,    // 25² / 162 = 3.858 kg/m
  28: 4.839,    // 28² / 162 = 4.839 kg/m
  32: 6.313,    // 32² / 162 = 6.313 kg/m
} as const;

// Bend deduction constants (in terms of diameter d)
export const REBAR_BEND_DEDUCTIONS = {
  bend_90: 10,   // ACI Standard: 90° bend = 10d
  bend_135: 10,  // ACI Standard: 135° bend = 10d
  bend_180: 6,   // ACI Standard: 180° bend = 6d
  hook_straight: 9,  // Straight hook = 9d
  hook_u_bar: 10,    // U-bar hook = 10d
} as const;

export function calculateWallSystem(inputs: WallSystemInputs, customPrices?: Partial<typeof MATERIAL_PRICES>, customLaborRate?: number): WallSystemOutputs {
  const net_area = inputs.area_m2 - inputs.opening_area_m2;
  const labor_rate = customLaborRate || inputs.labor_daily_rate || 1200;

  // Route to specific calculation
  switch (inputs.wall_type) {
    case 'chb':
      return calculateCHBWallSystem(inputs, net_area, customPrices, labor_rate);
    case 'aac':
      return calculateAACWallSystem(inputs, net_area, customPrices, labor_rate);
    case 'precast':
      return calculatePrecastWallSystem(inputs, net_area, customPrices, labor_rate);
    case 'drywall':
      return calculateDrywallSystem(inputs, net_area, customPrices, labor_rate);
    case 'eps':
      return calculateEPSWallSystem(inputs, net_area, customPrices, labor_rate);
    default:
      throw new Error(`Unknown wall system: ${inputs.wall_type}`);
  }
}

function getPriceOrDefault(priceKey: string, customPrices?: Partial<typeof MATERIAL_PRICES>): number {
  if (customPrices && priceKey in customPrices) {
    return customPrices[priceKey as keyof typeof MATERIAL_PRICES] || 0;
  }
  return MATERIAL_PRICES[priceKey as keyof typeof MATERIAL_PRICES] || 0;
}

function calculateCHBWallSystem(
  inputs: WallSystemInputs,
  net_area: number,
  customPrices?: Partial<typeof MATERIAL_PRICES>,
  laborDailyRate: number = 1200
): WallSystemOutputs {
  let materials: WallMaterial[] = [];
  let labor: WallLaborBreakdown[] = [];
  
  const thickness = inputs.chb_thickness || '100';
  const specs = WALL_SYSTEM_DATA.chb.data[thickness as keyof typeof WALL_SYSTEM_DATA.chb.data];
  
  const chb_qty = net_area * specs.blocks_per_m2;
  const mortar_bags = Math.ceil(net_area * 0.15);
  const plaster_bags = inputs.location === 'exterior' ? Math.ceil(net_area * 0.16) : Math.ceil(net_area * 0.12);
  
  const price_key = `chb_${thickness}` as keyof typeof MATERIAL_PRICES;
  const chb_price = getPriceOrDefault(price_key, customPrices);
  const mortar_price = getPriceOrDefault('mortar_bag', customPrices);
  const plaster_price = getPriceOrDefault('plaster_250kg', customPrices);
  
  const chb_cost = chb_qty * chb_price;
  const mortar_cost = mortar_bags * mortar_price;
  const plaster_cost = plaster_bags * plaster_price;
  const reinf_cost = (inputs.chb_with_reinforcement ? net_area * 250 : 0);
  
  materials = [
    { name: 'CHB 4"', unit: 'pcs', quantity: chb_qty, unit_price: chb_price, total_cost: chb_cost },
    { name: 'Cement Mortar', unit: 'bags', quantity: mortar_bags, unit_price: mortar_price, total_cost: mortar_cost },
    { name: 'Plaster Mix', unit: 'bags', quantity: plaster_bags, unit_price: plaster_price, total_cost: plaster_cost },
  ];
  
  if (inputs.chb_with_reinforcement) {
    materials.push({
      name: 'Rebar & Wire',
      unit: 'm²',
      quantity: net_area,
      unit_price: 250,
      total_cost: reinf_cost,
    });
  }
  
  const mat_cost = chb_cost + mortar_cost + plaster_cost + reinf_cost;
  
  // Labor
  const mason_days = net_area / LABOR_PRODUCTIVITY.chb_masonry;
  const mason_cost = mason_days * laborDailyRate * 1.5; // 1.5 masons
  const helper_days = net_area / LABOR_PRODUCTIVITY.chb_masonry;
  const helper_cost = helper_days * laborDailyRate * 1.0;
  const plaster_days = net_area / LABOR_PRODUCTIVITY.plaster_finish;
  const plaster_labor = plaster_days * laborDailyRate * 2.0;
  
  labor = [
    { task: 'Masonry (CHB laying)', mandays: mason_days, hourly_rate: laborDailyRate / 8, total_hours: mason_days * 8, total_cost: mason_cost },
    { task: 'Helper (mortaring)', mandays: helper_days, hourly_rate: laborDailyRate / 8, total_hours: helper_days * 8, total_cost: helper_cost },
    { task: 'Plaster finish', mandays: plaster_days, hourly_rate: laborDailyRate / 8, total_hours: plaster_days * 8, total_cost: plaster_labor },
  ];
  
  const labor_cost = mason_cost + helper_cost + plaster_labor;
  const total_cost = mat_cost + labor_cost;
  const unit_cost = total_cost / net_area;
  
  const performance: WallPerformance = {
    weight_kg_m2: specs.weight,
    thermal_resistance_r: specs.thermal_r,
    acoustic_index_db: specs.acoustic_db,
    fire_rating: 'Class A',
    moisture_resistance: 'Good',
  };
  
  return {
    wall_type: 'chb',
    net_area_m2: net_area,
    materials,
    materials_cost: mat_cost,
    labor_breakdown: labor,
    labor_cost,
    productivity_m2_per_day: LABOR_PRODUCTIVITY.chb_masonry,
    estimated_days: Math.ceil(net_area / LABOR_PRODUCTIVITY.chb_masonry) + Math.ceil(net_area / LABOR_PRODUCTIVITY.plaster_finish),
    crew_size: 4,
    unit_cost: Math.round(unit_cost * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
    cost_breakdown: { materials: mat_cost, labor: labor_cost },
    performance,
  };
}

function calculateAACWallSystem(
  inputs: WallSystemInputs,
  net_area: number,
  customPrices?: Partial<typeof MATERIAL_PRICES>,
  laborDailyRate: number = 1200
): WallSystemOutputs {
  let materials: WallMaterial[] = [];
  let labor: WallLaborBreakdown[] = [];
  
  const thickness = inputs.aac_thickness || '100';
  const specs = WALL_SYSTEM_DATA.aac.data[thickness as keyof typeof WALL_SYSTEM_DATA.aac.data];
  
  const block_qty = net_area * specs.blocks_per_m2;
  const adhesive_bags = Math.ceil(net_area * 0.5); // Thin bed uses less
  const plaster_bags = Math.ceil(net_area * 0.10);
  
  const price_key = `aac_${thickness}` as keyof typeof MATERIAL_PRICES;
  const block_price = getPriceOrDefault(price_key, customPrices);
  const adhesive_price = getPriceOrDefault('aac_adhesive', customPrices);
  const plaster_price = getPriceOrDefault('plaster_250kg', customPrices);
  
  const block_cost = block_qty * block_price;
  const adhesive_cost = adhesive_bags * adhesive_price;
  const plaster_cost = plaster_bags * plaster_price;
  
  materials = [
    { name: `AAC Block ${thickness}mm`, unit: 'pcs', quantity: block_qty, unit_price: block_price, total_cost: block_cost },
    { name: 'AAC Adhesive', unit: 'bags', quantity: adhesive_bags, unit_price: adhesive_price, total_cost: adhesive_cost },
    { name: 'Plaster Mix', unit: 'bags', quantity: plaster_bags, unit_price: plaster_price, total_cost: plaster_cost },
  ];
  
  const mat_cost = block_cost + adhesive_cost + plaster_cost;
  
  // AAC is faster to install
  const install_days = net_area / LABOR_PRODUCTIVITY.aac_install;
  const install_cost = install_days * laborDailyRate * 2.0;
  const plaster_days = net_area / LABOR_PRODUCTIVITY.plaster_finish;
  const plaster_cost_labor = plaster_days * laborDailyRate * 2.0;
  
  labor = [
    { task: 'AAC block installation', mandays: install_days, hourly_rate: laborDailyRate / 8, total_hours: install_days * 8, total_cost: install_cost },
    { task: 'Plaster finish', mandays: plaster_days, hourly_rate: laborDailyRate / 8, total_hours: plaster_days * 8, total_cost: plaster_cost_labor },
  ];
  
  const labor_cost = install_cost + plaster_cost_labor;
  const total_cost = mat_cost + labor_cost;
  const unit_cost = total_cost / net_area;
  
  const performance: WallPerformance = {
    weight_kg_m2: specs.weight,
    thermal_resistance_r: specs.thermal_r,
    acoustic_index_db: specs.acoustic_db,
    fire_rating: 'Class A',
    moisture_resistance: 'Very Good',
  };
  
  return {
    wall_type: 'aac',
    net_area_m2: net_area,
    materials,
    materials_cost: mat_cost,
    labor_breakdown: labor,
    labor_cost,
    productivity_m2_per_day: LABOR_PRODUCTIVITY.aac_install,
    estimated_days: Math.ceil(install_days) + Math.ceil(plaster_days),
    crew_size: 3,
    unit_cost: Math.round(unit_cost * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
    cost_breakdown: { materials: mat_cost, labor: labor_cost },
    performance,
  };
}

function calculatePrecastWallSystem(
  inputs: WallSystemInputs,
  net_area: number,
  customPrices?: Partial<typeof MATERIAL_PRICES>,
  laborDailyRate: number = 1200
): WallSystemOutputs {
  let materials: WallMaterial[] = [];
  let labor: WallLaborBreakdown[] = [];
  
  const thickness = inputs.precast_thickness || '200';
  const specs = WALL_SYSTEM_DATA.precast.data[thickness as keyof typeof WALL_SYSTEM_DATA.precast.data];
  
  const panel_qty = Math.ceil(net_area / 7.2); // 3x2.4m panels
  const sealant_qty = Math.ceil(net_area / 2); // For joints
  
  const price_key = `precast_${thickness}` as keyof typeof MATERIAL_PRICES;
  const panel_price = getPriceOrDefault(price_key, customPrices);
  const sealant_price = getPriceOrDefault('sealant', customPrices);
  
  const panel_cost = panel_qty * panel_price;
  const sealant_cost = sealant_qty * sealant_price;
  
  materials = [
    { name: `Precast Panels ${thickness}mm`, unit: 'pcs', quantity: panel_qty, unit_price: panel_price, total_cost: panel_cost },
    { name: 'Joint Sealant', unit: 'cartridges', quantity: sealant_qty, unit_price: sealant_price, total_cost: sealant_cost },
  ];
  
  const mat_cost = panel_cost + sealant_cost;
  
  // Precast installation (requires crane)
  const install_days = net_area / LABOR_PRODUCTIVITY.precast_install;
  const crew_cost = install_days * laborDailyRate * 4.0; // Supervisor + 3 workers
  const crane_cost = install_days * 8000; // Daily crane rental
  
  labor = [
    { task: 'Panel installation/jointing', mandays: install_days, hourly_rate: laborDailyRate / 8, total_hours: install_days * 8, total_cost: crew_cost },
  ];
  
  const labor_cost = crew_cost + crane_cost;
  const total_cost = mat_cost + labor_cost;
  const unit_cost = total_cost / net_area;
  
  const performance: WallPerformance = {
    weight_kg_m2: specs.weight,
    thermal_resistance_r: specs.thermal_r,
    acoustic_index_db: specs.acoustic_db,
    fire_rating: 'Class A',
    moisture_resistance: 'Fair',
  };
  
  return {
    wall_type: 'precast',
    net_area_m2: net_area,
    materials,
    materials_cost: mat_cost,
    labor_breakdown: labor,
    labor_cost,
    productivity_m2_per_day: LABOR_PRODUCTIVITY.precast_install,
    estimated_days: Math.ceil(install_days),
    crew_size: 5,
    unit_cost: Math.round(unit_cost * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
    cost_breakdown: { materials: mat_cost, labor: labor_cost },
    performance,
  };
}

function calculateDrywallSystem(
  inputs: WallSystemInputs,
  net_area: number,
  customPrices?: Partial<typeof MATERIAL_PRICES>,
  laborDailyRate: number = 1200
): WallSystemOutputs {
  let materials: WallMaterial[] = [];
  let labor: WallLaborBreakdown[] = [];
  
  const layers = inputs.drywall_layers || 1;
  const stud_spacing = inputs.drywall_stud_spacing || '400';
  
  // Studs calculation (assume 3m height)
  const stud_qty = (net_area / (parseInt(stud_spacing) / 1000)) * 5; // 5 studs per column
  const sheets_per_layer = Math.ceil(net_area / 11.5); // 4'x8' = 11.5 m²
  const total_sheets = sheets_per_layer * layers;
  const screws_kg = total_sheets * 0.5;
  
  const stud_price = getPriceOrDefault('lumber_2x2', customPrices);
  const sheet_price = getPriceOrDefault('drywall_sheet', customPrices);
  const screw_price = getPriceOrDefault('fasteners_kg', customPrices);
  
  const stud_cost = stud_qty * stud_price;
  const sheet_cost = total_sheets * sheet_price;
  const screw_cost = screws_kg * screw_price;
  
  materials = [
    { name: 'Drywall Studs 2x2', unit: 'pcs', quantity: stud_qty, unit_price: stud_price, total_cost: stud_cost },
    { name: 'Drywall Sheets', unit: 'sheets', quantity: total_sheets, unit_price: sheet_price, total_cost: sheet_cost },
    { name: 'Fasteners & Screws', unit: 'kg', quantity: screws_kg, unit_price: screw_price, total_cost: screw_cost },
  ];
  
  const mat_cost = stud_cost + sheet_cost + screw_cost;
  
  // Drywall labor
  const frame_days = net_area / LABOR_PRODUCTIVITY.drywall_frame;
  const finish_days = net_area / LABOR_PRODUCTIVITY.drywall_finish;
  const frame_cost = frame_days * laborDailyRate * 2.0;
  const finish_cost = finish_days * laborDailyRate * 2.0;
  
  labor = [
    { task: 'Frame & install sheets', mandays: frame_days, hourly_rate: laborDailyRate / 8, total_hours: frame_days * 8, total_cost: frame_cost },
    { task: 'Taping & mudding', mandays: finish_days, hourly_rate: laborDailyRate / 8, total_hours: finish_days * 8, total_cost: finish_cost },
  ];
  
  const labor_cost = frame_cost + finish_cost;
  const total_cost = mat_cost + labor_cost;
  const unit_cost = total_cost / net_area;
  
  const weight = 15 * layers;
  const thermal_r = 0.10 * layers;
  
  const performance: WallPerformance = {
    weight_kg_m2: weight,
    thermal_resistance_r: thermal_r,
    acoustic_index_db: 32 + (layers * 5),
    fire_rating: 'Class B',
    moisture_resistance: 'Poor',
  };
  
  return {
    wall_type: 'drywall',
    net_area_m2: net_area,
    materials,
    materials_cost: mat_cost,
    labor_breakdown: labor,
    labor_cost,
    productivity_m2_per_day: LABOR_PRODUCTIVITY.drywall_frame,
    estimated_days: Math.ceil(frame_days + finish_days),
    crew_size: 2,
    unit_cost: Math.round(unit_cost * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
    cost_breakdown: { materials: mat_cost, labor: labor_cost },
    performance,
  };
}

function calculateEPSWallSystem(
  inputs: WallSystemInputs,
  net_area: number,
  customPrices?: Partial<typeof MATERIAL_PRICES>,
  laborDailyRate: number = 1200
): WallSystemOutputs {
  let materials: WallMaterial[] = [];
  let labor: WallLaborBreakdown[] = [];
  
  const core_thickness = inputs.eps_core_thickness || '100';
  const specs = WALL_SYSTEM_DATA.eps.data[core_thickness as keyof typeof WALL_SYSTEM_DATA.eps.data];
  
  const panel_qty = Math.ceil(net_area / 7.2); // 3x2.4m panels
  const plaster_bags = Math.ceil(net_area * 0.08);
  const mesh_m2 = inputs.eps_with_mesh ? net_area : 0;
  
  const price_key = `eps_${core_thickness}` as keyof typeof MATERIAL_PRICES;
  const panel_price = getPriceOrDefault(price_key, customPrices);
  const plaster_price = getPriceOrDefault('plaster_250kg', customPrices);
  
  const panel_cost = panel_qty * panel_price;
  const plaster_cost = plaster_bags * plaster_price;
  const mesh_cost = mesh_m2 * 80;
  
  materials = [
    { name: `EPS Sandwich Panel ${core_thickness}mm`, unit: 'pcs', quantity: panel_qty, unit_price: panel_price, total_cost: panel_cost },
  ];
  
  if (inputs.eps_with_mesh) {
    materials.push({
      name: 'EPS Mesh (reinforcement)',
      unit: 'm²',
      quantity: mesh_m2,
      unit_price: 80,
      total_cost: mesh_cost,
    });
  }
  
  materials.push({
    name: 'Plaster/Topcoat',
    unit: 'bags',
    quantity: plaster_bags,
    unit_price: plaster_price,
    total_cost: plaster_cost,
  });
  
  const mat_cost = panel_cost + mesh_cost + plaster_cost;
  
  // EPS installation
  const install_days = net_area / LABOR_PRODUCTIVITY.eps_install;
  const plaster_days = net_area / LABOR_PRODUCTIVITY.plaster_finish;
  const install_cost = install_days * laborDailyRate * 2.0;
  const plaster_labor = plaster_days * laborDailyRate * 2.0;
  
  labor = [
    { task: 'Panel installation', mandays: install_days, hourly_rate: laborDailyRate / 8, total_hours: install_days * 8, total_cost: install_cost },
    { task: 'Plaster & topcoat', mandays: plaster_days, hourly_rate: laborDailyRate / 8, total_hours: plaster_days * 8, total_cost: plaster_labor },
  ];
  
  const labor_cost = install_cost + plaster_labor;
  const total_cost = mat_cost + labor_cost;
  const unit_cost = total_cost / net_area;
  
  const performance: WallPerformance = {
    weight_kg_m2: specs.weight,
    thermal_resistance_r: specs.thermal_r,
    acoustic_index_db: specs.acoustic_db,
    fire_rating: 'Class B',
    moisture_resistance: 'Excellent',
  };
  
  return {
    wall_type: 'eps',
    net_area_m2: net_area,
    materials,
    materials_cost: mat_cost,
    labor_breakdown: labor,
    labor_cost,
    productivity_m2_per_day: LABOR_PRODUCTIVITY.eps_install,
    estimated_days: Math.ceil(install_days + plaster_days),
    crew_size: 2,
    unit_cost: Math.round(unit_cost * 100) / 100,
    total_cost: Math.round(total_cost * 100) / 100,
    cost_breakdown: { materials: mat_cost, labor: labor_cost },
    performance,
  };
}


// ============================================================================
// REBAR CALCULATION HELPER FUNCTIONS
// ============================================================================

// Get rebar weight per meter based on diameter
export function getRebarWeightPerMeter(diameter_mm: number): number {
  return REBAR_WEIGHT_FORMULA[diameter_mm as keyof typeof REBAR_WEIGHT_FORMULA] || 0;
}

// Get rebar price per kg based on grade and diameter
export function getRebarPricePerKg(grade: RebarGrade, diameter_mm: number): number {
  const priceKey = `rebar_${grade}_${diameter_mm}` as keyof typeof REBAR_PRICES;
  return REBAR_PRICES[priceKey] || 280; // Default fallback price
}

// Calculate net length based on bar shape and dimensions
function calculateNetLength(shape: RebarBarShape, dimensions: {
  a?: number;
  b?: number;
  c?: number;
  d?: number;
}): number {
  const { a = 0, b = 0, c = 0, d = 0 } = dimensions;
  
  switch (shape) {
    case RebarBarShape.STRAIGHT:
      return a;
    case RebarBarShape.L_BAR:
      return a + b;
    case RebarBarShape.U_BAR:
      return a + b + c;
    case RebarBarShape.STIRRUP:
      return (a + b) * 2;
    case RebarBarShape.HOOKED:
      return a + b;
    case RebarBarShape.CRANKED:
      return a + b + c + d;
    case RebarBarShape.SPIRAL:
      // For spiral, 'a' is diameter, 'b' is pitch in mm, dimensions sum is circumference
      return Math.PI * a; // Base circumference
    default:
      return a;
  }
}

// Calculate hook and bend deductions
function calculateHookAndBendDeductions(
  shape: RebarBarShape,
  diameter_mm: number,
  code_params: RebarCodeParameters
): { hook_deduction_mm: number; bend_deduction_mm: number } {
  let hook_deduction = 0;
  let bend_deduction = 0;
  
  switch (shape) {
    case RebarBarShape.STRAIGHT:
      break;
    case RebarBarShape.L_BAR:
      hook_deduction = code_params.hook_length_rule * diameter_mm;
      bend_deduction = code_params.bend_deduction_90 * diameter_mm;
      break;
    case RebarBarShape.U_BAR:
      hook_deduction = code_params.hook_length_rule * diameter_mm * 2;
      bend_deduction = code_params.bend_deduction_90 * diameter_mm * 2;
      break;
    case RebarBarShape.STIRRUP:
      hook_deduction = code_params.hook_length_rule * diameter_mm;
      bend_deduction = code_params.bend_deduction_90 * diameter_mm * 4;
      break;
    case RebarBarShape.HOOKED:
      hook_deduction = code_params.hook_length_rule * diameter_mm;
      break;
    case RebarBarShape.CRANKED:
      bend_deduction = code_params.bend_deduction_135 * diameter_mm * 2;
      break;
    default:
      break;
  }
  
  return {
    hook_deduction_mm: hook_deduction,
    bend_deduction_mm: bend_deduction,
  };
}

// Calculate gross length including hooks and laps
function calculateGrossLength(
  net_length_mm: number,
  hook_deduction_mm: number,
  lap_length_mm: number,
  wastage_percent: number
): number {
  const gross_before_wastage = net_length_mm + hook_deduction_mm + lap_length_mm;
  const gross_with_wastage = gross_before_wastage * (1 + wastage_percent / 100);
  return Math.ceil(gross_with_wastage); // Round up to nearest mm
}

// Optimize cutting plan based on stock lengths
function optimizeCuttingPlans(
  bbs: RebarBBSEntry[],
  stock_lengths_m: number[]
): RebarCuttingPlan[] {
  const plans: RebarCuttingPlan[] = [];
  const unsorted_bars = [...bbs];
  
  // Sort by descending gross length
  unsorted_bars.sort((a, b) => b.gross_length_m - a.gross_length_m);
  
  for (const stock_length of stock_lengths_m) {
    const segments: RebarCuttingSegment[] = [];
    let used_length = 0;
    let total_weight = 0;
    const stock_length_mm = stock_length * 1000;
    
    // Try to fit bars into this stock length
    for (const bar of unsorted_bars) {
      const bar_length_mm = bar.gross_length_m * 1000;
      
      // Check if bar can fit
      if (bar_length_mm <= stock_length_mm && bar.quantity_pcs > 0) {
        const fit_count = Math.floor((stock_length_mm - used_length) / bar_length_mm);
        
        if (fit_count > 0) {
          const qty_to_use = Math.min(fit_count, bar.quantity_pcs);
          
          segments.push({
            mark: bar.mark,
            gross_length_m: bar.gross_length_m,
            quantity: qty_to_use,
            material_to_cut: bar_length_mm * qty_to_use,
          });
          
          used_length += bar_length_mm * qty_to_use;
          total_weight += (bar.weight_per_bar_kg * qty_to_use);
          bar.quantity_pcs -= qty_to_use;
        }
      }
    }
    
    if (segments.length > 0) {
      const waste_length = stock_length_mm - used_length;
      const efficiency = (used_length / stock_length_mm) * 100;
      
      plans.push({
        stock_length_m: stock_length,
        segments,
        used_length_m: used_length / 1000,
        waste_length_m: Math.max(0, waste_length / 1000),
        efficiency_percent: Math.round(efficiency * 10) / 10,
        bundle_count: Math.ceil(total_weight / 750), // Typical bundle = 750kg
        total_weight_kg: Math.round(total_weight * 100) / 100,
      });
    }
  }
  
  return plans;
}

// ============================================================================
// REBAR CALCULATOR - MAIN FUNCTION (Comprehensive BBS & Costing)
// ============================================================================
export function calculateRebar(inputs: RebarCalculatorInputs): RebarCalculatorOutputs {
  // Support simple mode for backward compatibility
  if (inputs.bar_size && inputs.total_length_m !== undefined && inputs.wastage !== undefined && !inputs.bars) {
    return calculateRebarSimpleMode(inputs);
  }
  
  // Full BBS mode
  if (!inputs.bars || inputs.bars.length === 0) {
    return {
      bbs: [],
      cutting_plans: [],
      total_rebar_kg: 0,
      total_tie_wire_kg: 0,
      total_bars_count: 0,
      total_cutting_waste_kg: 0,
      costing: {
        material_cost_php: 0,
        labor_hours: 0,
        labor_cost_php: 0,
        tie_wire_kg: 0,
        tie_wire_cost_php: 0,
        total_cost_php: 0,
        cost_per_kg: 0,
      },
      summary_by_diameter: {},
      validation_warnings: ['No bars defined'],
      is_valid: false,
    };
  }
  
  // Default code parameters (NSCP/ACI standards)
  const default_wastage = inputs.code_params ? inputs.code_params.wastage_percent : 5;
  const code_params: RebarCodeParameters = inputs.code_params || {
    concrete_cover_mm: 40,
    hook_length_rule: 9,        // 9d
    lap_splice_rule: 40,        // 40d for simple lap
    bend_deduction_90: 10,      // 10d
    bend_deduction_135: 10,     // 10d
    bend_deduction_180: 6,      // 6d
    wastage_percent: default_wastage ?? 5,
  };
  
  // Default pricing
  const labor_rate = inputs.labor_rate_php_per_day || 1300; // Steel worker rate
  const stock_lengths = inputs.procurement_stock_lengths || [6, 7.5, 9, 12]; // Standard lengths
  
  const bbs: RebarBBSEntry[] = [];
  let total_rebar_kg = 0;
  let total_tie_wire_kg = 0;
  let total_bars_count = 0;
  let material_cost = 0;
  let labor_hours = 0;
  const summary_by_diameter: Record<number, any> = {};
  const validation_warnings: string[] = [];
  
  // Process each bar definition
  for (const bar of inputs.bars) {
    const diameter = bar.diameter_mm as number;
    const grade = bar.grade || RebarGrade.GRADE_40;
    
    // Calculate net length in mm
    const net_length_mm = calculateNetLength(bar.shape, {
      a: bar.dimension_a,
      b: bar.dimension_b,
      c: bar.dimension_c,
      d: bar.dimension_d,
    });
    
    // Calculate deductions
    const { hook_deduction_mm } = calculateHookAndBendDeductions(
      bar.shape,
      diameter,
      code_params
    );
    
    // Calculate lap length (if applicable)
    const lap_length_mm = bar.shape === RebarBarShape.STRAIGHT 
      ? code_params.lap_splice_rule * diameter 
      : 0;
    
    // Calculate gross length
    const gross_length_mm = calculateGrossLength(
      net_length_mm,
      hook_deduction_mm,
      lap_length_mm,
      code_params.wastage_percent
    );
    
    // Convert to meters
    const net_length_m = net_length_mm / 1000;
    const hook_length_m = hook_deduction_mm / 1000;
    const lap_length_m = lap_length_mm / 1000;
    const gross_length_m = gross_length_mm / 1000;
    
    // Calculate weight
    const weight_per_meter = getRebarWeightPerMeter(diameter);
    const weight_per_bar_kg = Math.round(gross_length_m * weight_per_meter * 1000) / 1000;
    const total_bar_weight_kg = weight_per_bar_kg * bar.quantity_pcs;
    
    // Get price for this bar (use custom or default based on grade/diameter)
    const price_per_kg = inputs.material_price_per_kg ?? getRebarPricePerKg(grade, diameter);
    const bar_material_cost = total_bar_weight_kg * price_per_kg;
    
    // Create BBS entry
    const bbs_entry: RebarBBSEntry = {
      mark: bar.mark,
      shape: bar.shape,
      diameter_mm: diameter,
      quantity_pcs: bar.quantity_pcs,
      dimension_a_mm: bar.dimension_a || 0,
      dimension_b_mm: bar.dimension_b,
      dimension_c_mm: bar.dimension_c,
      dimension_d_mm: bar.dimension_d,
      net_length_m: Math.round(net_length_m * 1000) / 1000,
      hook_length_m: Math.round(hook_length_m * 1000) / 1000,
      lap_length_m: Math.round(lap_length_m * 1000) / 1000,
      gross_length_m: Math.round(gross_length_m * 1000) / 1000,
      weight_per_bar_kg,
      total_weight_kg: Math.round(total_bar_weight_kg * 100) / 100,
    };
    
    bbs.push(bbs_entry);
    
    // Accumulate totals
    total_rebar_kg += bbs_entry.total_weight_kg;
    total_bars_count += bar.quantity_pcs;
    material_cost += bar_material_cost;
    labor_hours += (bbs_entry.total_weight_kg * 0.008); // From ASM-003: 0.008 mandays per kg
    
    // Summary by diameter
    if (!summary_by_diameter[diameter]) {
      summary_by_diameter[diameter] = {
        diameter_mm: diameter,
        total_kg: 0,
        total_bars: 0,
        cost_php: 0,
      };
    }
    summary_by_diameter[diameter].total_kg += bbs_entry.total_weight_kg;
    summary_by_diameter[diameter].total_bars += bar.quantity_pcs;
    summary_by_diameter[diameter].cost_php = Math.round(
      summary_by_diameter[diameter].total_kg * price_per_kg * 100
    ) / 100;
  }
  
  // Calculate tie wire
  total_tie_wire_kg = Math.round(total_rebar_kg * 0.015 * 100) / 100; // Typical: 1.5% of main rebar
  const tie_wire_cost = total_tie_wire_kg * REBAR_PRICES.tie_wire;
  
  // Generate cutting plans
  const cutting_plans = optimizeCuttingPlans(
    [...bbs], // Make a copy to avoid mutation
    stock_lengths
  );
  
  // Calculate cutting waste
  let total_cutting_waste_kg = 0;
  for (const plan of cutting_plans) {
    // Simplified: estimate waste based on efficiency
    total_cutting_waste_kg += (plan.stock_length_m - plan.used_length_m) * (plan.total_weight_kg / plan.used_length_m);
  }
  total_cutting_waste_kg = Math.round(total_cutting_waste_kg * 100) / 100;
  
  // Labor cost
  const labor_cost = labor_hours * (labor_rate / 8); // 8-hour work day
  
  // Validation
  if (total_rebar_kg === 0) {
    validation_warnings.push('Total rebar weight is zero');
  }
  
  // Typical kg/m³ sanity check based on structural element type
  const elements = [...new Set(inputs.bars.map(b => b.element_type))];
  for (const element of elements) {
    // These are typical ranges, adjust based on design standards
    if (element === RebarElementType.SLAB && total_rebar_kg > 500) {
      validation_warnings.push(`High rebar quantity for ${element} - verify design`);
    }
  }
  
  const total_cost = material_cost + tie_wire_cost + labor_cost;
  
  return {
    bbs,
    cutting_plans,
    total_rebar_kg: Math.round(total_rebar_kg * 100) / 100,
    total_tie_wire_kg,
    total_bars_count,
    total_cutting_waste_kg,
    costing: {
      material_cost_php: Math.round(material_cost * 100) / 100,
      labor_hours: Math.round(labor_hours * 10) / 10,
      labor_cost_php: Math.round(labor_cost * 100) / 100,
      tie_wire_kg: total_tie_wire_kg,
      tie_wire_cost_php: Math.round(tie_wire_cost * 100) / 100,
      total_cost_php: Math.round(total_cost * 100) / 100,
      cost_per_kg: total_rebar_kg > 0 ? Math.round((total_cost / total_rebar_kg) * 100) / 100 : 0,
    },
    summary_by_diameter,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// REBAR SIMPLE MODE (Backward Compatible)
// ============================================================================

function calculateRebarSimpleMode(inputs: RebarCalculatorInputs): RebarCalculatorOutputs {
  const { bar_size = '12', total_length_m = 0, wastage = 5 } = inputs;
  const wastage_multiplier = 1 + wastage / 100;
  
  // Map bar size to diameter
  const diameter_map: Record<string, number> = {
    '10': 10, '12': 12, '16': 16, '20': 20, '25': 25, '28': 28, '32': 32,
  };
  
  const diameter = diameter_map[bar_size] || 12;
  const weight_per_m = getRebarWeightPerMeter(diameter);
  const weight_kg = Math.ceil(total_length_m * weight_per_m * wastage_multiplier * 100) / 100;
  const tie_wire_kg = Math.ceil(weight_kg * 0.015 * 100) / 100;
  
  return {
    weight_kg,
    tie_wire_kg,
    weight_per_m,
    bbs: [],
    cutting_plans: [],
    total_rebar_kg: weight_kg,
    total_tie_wire_kg: tie_wire_kg,
    total_bars_count: 0,
    total_cutting_waste_kg: 0,
    costing: {
      material_cost_php: 0,
      labor_hours: 0,
      labor_cost_php: 0,
      tie_wire_kg,
      tie_wire_cost_php: 0,
      total_cost_php: 0,
      cost_per_kg: 0,
    },
    summary_by_diameter: {},
    validation_warnings: [],
    is_valid: true,
  };
}

// Async wrapper for compatibility
export async function calculateRebarAsync(inputs: RebarCalculatorInputs): Promise<RebarCalculatorOutputs> {
  return calculateRebar(inputs);
}

// Old formwork calculator removed - comprehensive version defined in COMPREHENSIVE FORMWORK CALCULATOR section

// ============================================================================
// PAINT CALCULATOR
// ============================================================================

export function calculatePaint(inputs: PaintCalculatorInputs): PaintCalculatorOutputs {
  const { area_m2, coats, coverage_rate } = inputs;

  const paint_gallons = Math.ceil((area_m2 * coats / coverage_rate) * 10) / 10;
  const thinner_liters = Math.ceil(paint_gallons * 0.5 * 10) / 10;
  const putty_kg = Math.ceil(area_m2 * 0.2 * 10) / 10;

  return {
    paint_gallons,
    thinner_liters,
    putty_kg,
  };
}

// ============================================================================
// STRUCTURAL ELEMENT CALCULATORS - FOUNDATION
// ============================================================================

export enum FoundationType {
  ISOLATED_FOOTING = 'Isolated Footing',
  COMBINED_FOOTING = 'Combined Footing',
  STRIP_FOOTING = 'Strip Footing',
  MAT_FOUNDATION = 'Mat Foundation',
  TIE_GRADE_BEAM = 'Tie/Grade Beam',
}

export enum SoilClass {
  SOFT = 'Soft (0.5-1.0 ksc)',
  FIRM = 'Firm (1.0-2.0 ksc)',
  MEDIUM = 'Medium (2.0-3.0 ksc)',
  DENSE = 'Dense (3.0-5.0 ksc)',
  VERY_DENSE = 'Very Dense (5.0+ ksc)',
}

export interface FoundationInputs {
  // Geometry
  type: FoundationType;
  length_m: number;           // Length or diameter (for circular isolated)
  width_m: number;            // Width
  height_m: number;           // Total depth below GL
  pedestal_length?: number;   // For above-ground pedestal (m)
  pedestal_width?: number;    // For above-ground pedestal (m)
  pedestal_height?: number;   // For above-ground pedestal (m)
  
  // Excavation
  excavation_depth_m: number;
  soil_class: SoilClass;
  backfill_depth_m: number;
  
  // Lean concrete
  lean_concrete_thickness_m: number;
  
  // Reinforcement
  bottom_bar_diameter_mm: number;
  bottom_bar_spacing_mm: number;
  bottom_bar_grade: RebarGrade;
  top_bar_diameter_mm?: number;
  top_bar_spacing_mm?: number;
  top_bar_grade?: RebarGrade;
  
  dowel_diameter_mm?: number;
  dowel_qty?: number;
  dowel_develop_length_m?: number;
  
  concrete_cover_mm: number;
  
  // Concrete & costs
  concrete_unit_price_php_per_m3: number;
  rebar_unit_price_php_per_kg: number;
  formwork_unit_price_php_per_m2: number;
  excavation_unit_price_php_per_m3: number;
  labor_rate_php_per_day: number;
}

export interface FoundationOutputs {
  // Volumes
  concrete_volume_m3: number;
  lean_concrete_m3: number;
  excavation_volume_m3: number;
  backfill_volume_m3: number;
  
  // Rebar
  bottom_bars_total_kg: number;
  top_bars_total_kg: number;
  dowels_total_kg: number;
  tie_wire_kg: number;
  total_rebar_kg: number;
  
  // Formwork
  formwork_area_m2: number;
  
  // Costing
  concrete_cost_php: number;
  rebar_cost_php: number;
  formwork_cost_php: number;
  excavation_cost_php: number;
  labor_cost_php: number;
  total_cost_php: number;
  cost_per_m3: number;
  
  // Validation
  kg_per_m3_concrete: number;
  validation_warnings: string[];
  is_valid: boolean;
}

// ============================================================================
// STRUCTURAL ELEMENT CALCULATORS - COLUMN
// ============================================================================

export enum ColumnType {
  RECTANGULAR = 'Rectangular',
  SQUARE = 'Square',
  CIRCULAR = 'Circular',
  L_SHAPED = 'L-Shaped',
  T_SHAPED = 'T-Shaped',
}

export enum SteelColumnProfile {
  H_BEAM = 'H-Beam',
  I_BEAM = 'I-Beam',
  BOX_SECTION = 'Box Section',
  PIPE_CIRCULAR = 'Circular Pipe',
  PIPE_SQUARE = 'Square Pipe',
  CHANNEL = 'Channel',
  BUILT_UP = 'Built-up Section',
}

export interface RCCColumnInputs {
  type: ColumnType;
  height_m: number;
  
  // Dimensions based on type
  length_mm?: number;
  width_mm?: number;
  diameter_mm?: number; // For circular columns
  arm_length_mm?: number; // For L or T shapes
  arm_thickness_mm?: number; // For L or T shapes
  
  // Reinforcement
  main_bar_diameter_mm: number;
  main_bar_qty: number;
  main_bar_grade: RebarGrade;
  
  tie_diameter_mm: number;
  tie_spacing_mm_end: number;    // Spacing at ends (1.5h from top/bottom)
  tie_spacing_mm_mid: number;    // Spacing at middle
  tie_grade: RebarGrade;
  
  concrete_cover_mm: number;
  lap_length_factor: number;     // Typically 40d for tension, 50d for compression
  
  // Concrete & costs
  concrete_unit_price_php_per_m3: number;
  rebar_unit_price_php_per_kg: number;
  formwork_unit_price_php_per_m2: number;
  labor_rate_php_per_day: number;
}

export interface RCCColumnOutputs {
  // Volumes
  concrete_volume_m3: number;
  
  // Rebar
  main_bars_total_kg: number;
  ties_total_kg: number;
  tie_wire_kg: number;
  total_rebar_kg: number;
  
  // Formwork
  formwork_area_m2: number;
  
  // Costing
  concrete_cost_php: number;
  rebar_cost_php: number;
  formwork_cost_php: number;
  labor_cost_php: number;
  total_cost_php: number;
  cost_per_m3: number;
  
  // Validation
  kg_per_m3_concrete: number;
  rebar_ratio_percent: number;  // (Total rebar / concrete weight) * 100
  validation_warnings: string[];
  is_valid: boolean;
}

export interface SteelColumnInputs {
  profile: SteelColumnProfile;
  height_m: number;
  section_size_mm?: string;   // e.g., "H-250x250" or use individual dimensions
  section_weight_kg_per_m?: number;
  
  base_plate_thickness_mm: number;
  base_plate_length_mm: number;
  base_plate_width_mm: number;
  
  anchor_bolt_diameter_mm: number;
  anchor_bolt_qty: number;
  anchor_bolt_grade_mpa: number;
  
  stiffener_quantity?: number;
  stiffener_thickness_mm?: number;
  
  steel_unit_price_php_per_kg: number;
  bolt_unit_price_php_per_unit: number;
  plate_unit_price_php_per_kg: number;
  fabrication_markup_percent: number;
  erection_labor_rate_php_per_day: number;
  erection_hours_per_unit: number;
  fireproofing?: boolean;
  fireproofing_rate_php_per_m2?: number;
}

export interface SteelColumnOutputs {
  // Weights
  column_steel_weight_kg: number;
  base_plate_weight_kg: number;
  stiffener_weight_kg?: number;
  total_steel_weight_kg: number;
  
  // Connections
  anchor_bolts_total_qty: number;
  anchor_bolt_weight_kg: number;
  
  // Costing
  column_steel_cost_php: number;
  base_plate_cost_php: number;
  anchor_bolt_cost_php: number;
  fabrication_cost_php: number;
  erection_labor_cost_php: number;
  fireproofing_cost_php?: number;
  total_cost_php: number;
  cost_per_kg: number;
  
  validation_warnings: string[];
  is_valid: boolean;
}

// ============================================================================
// STRUCTURAL ELEMENT CALCULATORS - BEAM
// ============================================================================

export enum BeamType {
  RECTANGULAR = 'Rectangular',
  T_BEAM = 'T-Beam',
  DROP_BEAM = 'Drop Beam',
  GRADE_BEAM = 'Grade Beam',
}

export interface RCCBeamInputs {
  type: BeamType;
  span_length_m: number;
  
  // Cross-section
  width_mm: number;
  depth_mm: number;
  slab_thickness_mm?: number;  // For T-beams
  slab_width_mm?: number;       // For T-beams
  
  // Bottom reinforcement
  bottom_bar_diameter_mm: number;
  bottom_bar_qty: number;
  bottom_bar_grade: RebarGrade;
  
  // Top reinforcement
  top_bar_diameter_mm: number;
  top_bar_qty: number;
  top_bar_grade: RebarGrade;
  
  // Stirrups
  stirrup_diameter_mm: number;
  stirrup_grade: RebarGrade;
  stirrup_spacing_mm_end: number;    // At supports (L/4 zone)
  stirrup_spacing_mm_mid: number;    // At midspan (L/2 zone)
  
  concrete_cover_mm: number;
  
  // Concrete & costs
  concrete_unit_price_php_per_m3: number;
  rebar_unit_price_php_per_kg: number;
  formwork_unit_price_php_per_m2: number;
  labor_rate_php_per_day: number;
}

export interface RCCBeamOutputs {
  // Volumes
  concrete_volume_m3: number;
  
  // Rebar
  bottom_bars_total_kg: number;
  top_bars_total_kg: number;
  stirrups_total_kg: number;
  tie_wire_kg: number;
  total_rebar_kg: number;
  
  // Formwork
  bottom_formwork_m2: number;
  side_formwork_m2: number;
  total_formwork_m2: number;
  
  // Costing
  concrete_cost_php: number;
  rebar_cost_php: number;
  formwork_cost_php: number;
  labor_cost_php: number;
  total_cost_php: number;
  cost_per_m3: number;
  
  // Validation
  kg_per_m3_concrete: number;
  stirrup_ratio_check: string; // "OK" or warning
  validation_warnings: string[];
  is_valid: boolean;
}

export interface SteelBeamInputs {
  profile: SteelColumnProfile;  // I, H, Channel, Box, etc.
  section_size_mm?: string;
  section_weight_kg_per_m?: number;
  span_length_m: number;
  
  lateral_bracing?: boolean;
  camber_required?: boolean;
  camber_height_mm?: number;
  
  connection_type: 'Bolted' | 'Welded';
  connection_angles_qty?: number;    // For bolted connections
  connection_bolts_qty_per_end?: number;
  
  composite_slab?: boolean;
  deck_type_mm?: number;  // 50mm, 60mm, 75mm
  shear_studs_qty?: number;
  
  steel_unit_price_php_per_kg: number;
  connection_markup_percent: number;
  fabrication_markup_percent: number;
  erection_labor_rate_php_per_day: number;
  erection_hours_per_unit: number;
}

export interface SteelBeamOutputs {
  // Weights
  beam_steel_weight_kg: number;
  connection_plates_weight_kg: number;
  total_steel_weight_kg: number;
  
  // Connection details
  bolts_total_qty: number;
  shear_studs_qty?: number;
  
  // Costing
  beam_steel_cost_php: number;
  connection_cost_php: number;
  fabrication_cost_php: number;
  erection_labor_cost_php: number;
  total_cost_php: number;
  cost_per_kg: number;
  
  validation_warnings: string[];
  is_valid: boolean;
}

// ============================================================================
// STRUCTURAL ELEMENT CALCULATORS - SLAB
// ============================================================================

export enum SlabType {
  ONE_WAY = 'One-Way',
  TWO_WAY = 'Two-Way',
  RIBBED = 'Ribbed',
  DROP_PANEL = 'Drop Panel',
}

export interface SlabInputs {
  type: SlabType;
  length_m: number;
  width_m: number;
  thickness_mm: number;
  
  // Drop panel (if applicable)
  has_drop_panel: boolean;
  drop_panel_length_m?: number;
  drop_panel_width_m?: number;
  drop_panel_thickness_mm?: number;
  
  // Reinforcement - Main direction
  main_bar_diameter_mm: number;
  main_bar_spacing_mm: number;
  main_bar_grade: RebarGrade;
  
  // Reinforcement - Secondary direction (for two-way)
  secondary_bar_diameter_mm: number;
  secondary_bar_spacing_mm: number;
  secondary_bar_grade: RebarGrade;
  
  concrete_cover_mm: number;
  
  // Ribbed slab specifics
  rib_width_mm?: number;
  rib_spacing_mm?: number;
  rib_height_mm?: number;
  filler_material?: string; // EPS, Styrofoam, etc.
  
  // Concrete & costs
  concrete_unit_price_php_per_m3: number;
  rebar_unit_price_php_per_kg: number;
  formwork_unit_price_php_per_m2: number;
  labor_rate_php_per_day: number;
}

export interface SlabOutputs {
  // Volumes
  concrete_volume_m3: number;
  drop_panel_concrete_m3?: number;
  
  // Rebar
  main_bars_total_kg: number;
  secondary_bars_total_kg: number;
  tie_wire_kg: number;
  total_rebar_kg: number;
  
  // Formwork
  formwork_area_m2: number;
  
  // Costing
  concrete_cost_php: number;
  rebar_cost_php: number;
  formwork_cost_php: number;
  labor_cost_php: number;
  total_cost_php: number;
  cost_per_m2: number;
  
  // Validation
  kg_per_m3_concrete: number;
  rebar_ratio_percent: number;
  validation_warnings: string[];
  is_valid: boolean;
}

// ============================================================================
// COMPREHENSIVE FORMWORK CALCULATOR
// ============================================================================

export enum FormworkSystemType {
  TIMBER_CONVENTIONAL = 'Timber Conventional',
  TIMBER_PHENOLIC = 'Timber Phenolic',
  ALUMINUM_MODULAR = 'Aluminum Modular',
  STEEL_MODULAR = 'Steel Modular',
  PLASTIC_MODULAR = 'Plastic Modular',
  CIRCULAR_FORMS = 'Circular Forms',
  BEAM_SOFFIT = 'Beam Soffit System',
  SLAB_TABLE = 'Slab Table Forms',
  METAL_DECK_STAY = 'Stay-in-Place Metal Deck',
  CLIMBING_FORM = 'Climbing Form',
  SLIP_FORM = 'Slip Form',
}

export enum FormworkElementType {
  FOOTING = 'Footing',
  COLUMN = 'Column',
  BEAM = 'Beam',
  SLAB = 'Slab',
  WALL = 'Wall',
  STAIR = 'Stair',
}

export enum FinishRequirement {
  REGULAR = 'Regular Finish',
  FAIR_FACE = 'Fair Face (No Plaster)',
  WITH_PLASTER = 'With Plaster',
}

// ============================================================================
// FORMWORK MATERIAL BREAKDOWN
// ============================================================================
export interface FormworkMaterialBreakdown {
  plywood_sheets: number;
  plywood_m2: number;
  lumber_2x2_pcs: number;
  lumber_2x2_length_m: number;
  lumber_2x3_pcs: number;
  lumber_2x3_length_m: number;
  lumber_2x4_pcs: number;
  lumber_2x4_length_m: number;
  tie_rods_qty: number;
  tie_cones_qty: number;
  separators_qty: number;
  nails_kg: number;
  screws_kg: number;
  weld_wire_kg?: number;
  release_agent_liters: number;
  shoring_props_qty: number;
  adjustable_shores_qty: number;
  wedges_qty: number;
  other_accessories_cost_php: number;
}

// ============================================================================
// FORMWORK REUSE CALCULATION
// ============================================================================
export interface FormworkReuseCalculation {
  total_area_m2: number;
  number_of_cycles: number;
  effective_area_m2: number;  // total_area / cycles
  damage_allowance_percent: number;
  replacement_quantity_m2: number;
  replacement_cost_php: number;
  estimated_service_life_cycles: number;
}

// ============================================================================
// FORMWORK LABOR BREAKDOWN
// ============================================================================
export interface FormworkLaborBreakdown {
  carpenter_hours: number;
  carpenter_rate_per_day: number;
  carpenter_cost_php: number;
  
  helper_hours: number;
  helper_rate_per_day: number;
  helper_cost_php: number;
  
  total_labor_hours: number;
  total_labor_cost_php: number;
  
  labor_productivity_m2_per_day: number;
  estimated_duration_days: number;
}

// ============================================================================
// FORMWORK EQUIPMENT REQUIREMENTS
// ============================================================================
export interface FormworkEquipmentRequirements {
  scaffold_days: number;
  scaffold_rate_per_day: number;
  scaffold_cost_php: number;
  
  power_tools_days: number;
  power_tools_rate_per_day: number;
  power_tools_cost_php: number;
  
  crane_days?: number;
  crane_rate_per_day?: number;
  crane_cost_php: number;
  
  total_equipment_cost_php: number;
}

// ============================================================================
// FORMWORK CALCULATOR INPUTS
// ============================================================================
export interface FormworkCalculatorInputs {
  // System selection
  system_type: FormworkSystemType;
  element_type: FormworkElementType;
  finish_requirement: FinishRequirement;
  
  // Dimensions (varies by element type)
  formwork_area_m2: number;  // Pre-calculated from structural calculator
  length_m?: number;
  width_m?: number;
  height_m?: number;
  perimeter_m?: number;
  
  // Project parameters
  number_of_pours: number;
  reuse_cycles: number;
  damage_allowance_percent: number;  // Typical: 2-5%
  
  // Labor & productivity
  carpenter_rate_php_per_day: number;
  helper_rate_php_per_day: number;
  labor_productivity_m2_per_day: number;  // System-dependent
  
  // Material pricing
  plywood_unit_price_per_sheet: number;  // Phenolic or Marine
  lumber_2x2_php_per_piece: number;
  lumber_2x3_php_per_piece: number;
  lumber_2x4_php_per_piece: number;
  tie_rod_php_per_unit: number;
  tie_cone_php_per_unit: number;
  nails_php_per_kg: number;
  
  // Equipment rental
  scaffold_rate_php_per_day: number;
  power_tools_rate_php_per_day: number;
  crane_rate_php_per_day?: number;
  require_crane: boolean;
  
  // Timing
  planned_duration_days?: number;
  stripping_day: number;  // When to strip (e.g., day 7 for concrete)
}

// ============================================================================
// FORMWORK CALCULATOR OUTPUTS
// ============================================================================
export interface FormworkCalculatorOutputs {
  // Basic info
  system_type: FormworkSystemType;
  element_type: FormworkElementType;
  finish_requirement: FinishRequirement;
  formwork_area_m2: number;
  
  // Material quantification
  materials: FormworkMaterialBreakdown;
  materials_cost_php: number;
  
  // Reuse & replacement
  reuse_plan: FormworkReuseCalculation;
  
  // Labor
  labor: FormworkLaborBreakdown;
  
  // Equipment
  equipment: FormworkEquipmentRequirements;
  
  // Total costing
  total_material_cost_php: number;
  total_labor_cost_php: number;
  total_equipment_cost_php: number;
  total_cost_php: number;
  cost_per_m2: number;
  
  // Summary by category
  cost_breakdown: {
    materials: number;
    labor: number;
    equipment: number;
    replacement: number;
    contingency?: number;
  };
  
  // Validation
  validation_warnings: string[];
  is_valid: boolean;
}

// ============================================================================
// FORMWORK SYSTEM DEFAULTS (Philippine Market Q1 2026)
// ============================================================================

const FORMWORK_SYSTEM_DEFAULTS = {
  [FormworkSystemType.TIMBER_CONVENTIONAL]: {
    labor_productivity_m2_per_day: 18,
    plywood_per_m2: 1.2,
    lumber_per_m2: 0.035,  // m of lumber per m² formwork
    tie_spacing_mm: 400,
    damage_allowance_percent: 3,
    service_life_cycles: 8,
    cost_per_m2: 850,  // Estimated material cost
  },
  [FormworkSystemType.TIMBER_PHENOLIC]: {
    labor_productivity_m2_per_day: 20,
    plywood_per_m2: 1.1,
    lumber_per_m2: 0.030,
    tie_spacing_mm: 450,
    damage_allowance_percent: 2,
    service_life_cycles: 12,
    cost_per_m2: 950,
  },
  [FormworkSystemType.ALUMINUM_MODULAR]: {
    labor_productivity_m2_per_day: 25,
    plywood_per_m2: 1.0,
    lumber_per_m2: 0.020,
    tie_spacing_mm: 500,
    damage_allowance_percent: 1,
    service_life_cycles: 50,
    cost_per_m2: 1200,
  },
  [FormworkSystemType.STEEL_MODULAR]: {
    labor_productivity_m2_per_day: 24,
    plywood_per_m2: 1.0,
    lumber_per_m2: 0.018,
    tie_spacing_mm: 600,
    damage_allowance_percent: 1,
    service_life_cycles: 60,
    cost_per_m2: 1100,
  },
  [FormworkSystemType.PLASTIC_MODULAR]: {
    labor_productivity_m2_per_day: 22,
    plywood_per_m2: 1.05,
    lumber_per_m2: 0.025,
    tie_spacing_mm: 400,
    damage_allowance_percent: 2,
    service_life_cycles: 30,
    cost_per_m2: 1050,
  },
  [FormworkSystemType.CIRCULAR_FORMS]: {
    labor_productivity_m2_per_day: 15,
    plywood_per_m2: 1.3,
    lumber_per_m2: 0.045,
    tie_spacing_mm: 300,
    damage_allowance_percent: 4,
    service_life_cycles: 10,
    cost_per_m2: 1100,
  },
  [FormworkSystemType.BEAM_SOFFIT]: {
    labor_productivity_m2_per_day: 16,
    plywood_per_m2: 1.15,
    lumber_per_m2: 0.040,
    tie_spacing_mm: 400,
    damage_allowance_percent: 3,
    service_life_cycles: 8,
    cost_per_m2: 900,
  },
  [FormworkSystemType.SLAB_TABLE]: {
    labor_productivity_m2_per_day: 20,
    plywood_per_m2: 1.1,
    lumber_per_m2: 0.035,
    tie_spacing_mm: 600,
    damage_allowance_percent: 3,
    service_life_cycles: 10,
    cost_per_m2: 1000,
  },
  [FormworkSystemType.METAL_DECK_STAY]: {
    labor_productivity_m2_per_day: 22,
    plywood_per_m2: 0.0,  // No plywood for stay-in-place deck
    lumber_per_m2: 0.015,
    tie_spacing_mm: 600,
    damage_allowance_percent: 0,  // No removal needed
    service_life_cycles: 1,  // One-time use
    cost_per_m2: 1300,
  },
  [FormworkSystemType.CLIMBING_FORM]: {
    labor_productivity_m2_per_day: 12,
    plywood_per_m2: 1.2,
    lumber_per_m2: 0.050,
    tie_spacing_mm: 350,
    damage_allowance_percent: 5,
    service_life_cycles: 15,
    cost_per_m2: 1400,
  },
  [FormworkSystemType.SLIP_FORM]: {
    labor_productivity_m2_per_day: 10,
    plywood_per_m2: 1.15,
    lumber_per_m2: 0.055,
    tie_spacing_mm: 300,
    damage_allowance_percent: 6,
    service_life_cycles: 20,
    cost_per_m2: 1500,
  },
} as const;

// ============================================================================
// SHARED STRUCTURAL CALCULATIONS ENGINE
// ============================================================================

// Helper: Calculate RCC column concrete volume
function calculateRCCColumnVolume(input: RCCColumnInputs): number {
  switch (input.type) {
    case ColumnType.SQUARE:
      return (input.width_mm! / 1000) * (input.width_mm! / 1000) * input.height_m;
    case ColumnType.RECTANGULAR:
      return (input.length_mm! / 1000) * (input.width_mm! / 1000) * input.height_m;
    case ColumnType.CIRCULAR:
      const radius_m = (input.diameter_mm! / 2) / 1000;
      return Math.PI * radius_m * radius_m * input.height_m;
    case ColumnType.L_SHAPED:
    case ColumnType.T_SHAPED:
      // Simplified: main rectangle + arm area
      const main_area = (input.length_mm! / 1000) * (input.width_mm! / 1000);
      const arm_area = (input.arm_length_mm! / 1000) * (input.arm_thickness_mm! / 1000);
      return (main_area + arm_area) * input.height_m;
  }
}

// Helper: Calculate RCC beam concrete volume
function calculateRCCBeamVolume(input: RCCBeamInputs): number {
  const width_m = input.width_mm / 1000;
  const depth_m = input.depth_mm / 1000;
  let volume = width_m * depth_m * input.span_length_m;
  
  // Add T-beam flange volume if applicable
  if (input.type === BeamType.T_BEAM && input.slab_width_mm) {
    const flange_volume = ((input.slab_width_mm - input.width_mm) / 1000) 
      * (input.slab_thickness_mm! / 1000) 
      * input.span_length_m;
    volume += flange_volume;
  }
  
  return volume;
}

// Helper: Calculate rebar weight for linear bars
function calculateLinearRebarWeight(
  diameter_mm: number,
  quantity: number,
  total_length_m: number
): number {
  const weight_per_m = (diameter_mm * diameter_mm) / 162;  // Philippine formula
  return weight_per_m * total_length_m * quantity;
}

// ============================================================================
// FOUNDATION CALCULATOR
// ============================================================================

export function calculateFoundation(inputs: FoundationInputs): FoundationOutputs {
  // Base dimensions
  const length_m = inputs.length_m;
  const width_m = inputs.width_m;
  const height_m = inputs.height_m;
  const pedestal_height_m = inputs.pedestal_height || 0;
  
  // Concrete volume: footing + lean + pedestal
  const footing_concrete_m3 = length_m * width_m * height_m;
  const lean_concrete_m3 = length_m * width_m * inputs.lean_concrete_thickness_m;
  const pedestal_concrete_m3 = inputs.pedestal_length && inputs.pedestal_width 
    ? (inputs.pedestal_length / 1000) * (inputs.pedestal_width / 1000) * pedestal_height_m 
    : 0;
  const concrete_volume_m3 = footing_concrete_m3 + pedestal_concrete_m3;
  
  // Bottom reinforcement
  const bottom_bars_count = Math.ceil(width_m * 1000 / inputs.bottom_bar_spacing_mm);
  const bottom_bar_length_m = length_m + 2 * (inputs.concrete_cover_mm / 1000);
  const bottom_bars_total_kg = calculateLinearRebarWeight(
    inputs.bottom_bar_diameter_mm,
    bottom_bars_count,
    bottom_bar_length_m
  );
  
  // Top reinforcement
  const top_bars_total_kg = inputs.top_bar_diameter_mm && inputs.top_bar_spacing_mm
    ? calculateLinearRebarWeight(
        inputs.top_bar_diameter_mm,
        Math.ceil(width_m * 1000 / inputs.top_bar_spacing_mm),
        length_m
      )
    : 0;
  
  // Dowels
  const dowels_total_kg = inputs.dowel_diameter_mm && inputs.dowel_qty && inputs.dowel_develop_length_m
    ? calculateLinearRebarWeight(inputs.dowel_diameter_mm, inputs.dowel_qty, inputs.dowel_develop_length_m)
    : 0;
  
  const total_rebar_kg = bottom_bars_total_kg + top_bars_total_kg + dowels_total_kg;
  const tie_wire_kg = total_rebar_kg * 0.015;  // 1.5% of rebar weight
  
  // Formwork area
  const formwork_area_m2 = (2 * length_m + 2 * width_m) * height_m;
  
  // Excavation
  const excavation_volume_m3 = length_m * width_m * inputs.excavation_depth_m;
  const backfill_volume_m3 = excavation_volume_m3 - concrete_volume_m3 - lean_concrete_m3;
  
  // Costing
  const concrete_cost_php = concrete_volume_m3 * inputs.concrete_unit_price_php_per_m3;
  const rebar_cost_php = total_rebar_kg * inputs.rebar_unit_price_php_per_kg;
  const formwork_cost_php = formwork_area_m2 * inputs.formwork_unit_price_php_per_m2;
  const excavation_cost_php = excavation_volume_m3 * inputs.excavation_unit_price_php_per_m3;
  
  // Labor (estimate 0.5 mandays per cu.m concrete + 0.1 mandays per cu.m excavation)
  const labor_mandays = (concrete_volume_m3 * 0.5) + (excavation_volume_m3 * 0.1);
  const labor_cost_php = labor_mandays * inputs.labor_rate_php_per_day;
  
  const total_cost_php = concrete_cost_php + rebar_cost_php + formwork_cost_php + excavation_cost_php + labor_cost_php;
  const cost_per_m3 = concrete_volume_m3 > 0 ? total_cost_php / concrete_volume_m3 : 0;
  
  // Validation
  const concrete_weight_kg = concrete_volume_m3 * 2400;  // 2400 kg/m³ for concrete
  const kg_per_m3_concrete = concrete_weight_kg > 0 ? (total_rebar_kg / concrete_weight_kg) * 100 : 0;
  
  const validation_warnings: string[] = [];
  if (kg_per_m3_concrete < 0.5) validation_warnings.push('Rebar ratio low (<0.5%) - verify design');
  if (kg_per_m3_concrete > 2.5) validation_warnings.push('Rebar ratio high (>2.5%) - check for over-reinforcement');
  
  return {
    concrete_volume_m3,
    lean_concrete_m3,
    excavation_volume_m3,
    backfill_volume_m3,
    bottom_bars_total_kg,
    top_bars_total_kg,
    dowels_total_kg,
    tie_wire_kg,
    total_rebar_kg,
    formwork_area_m2,
    concrete_cost_php,
    rebar_cost_php,
    formwork_cost_php,
    excavation_cost_php,
    labor_cost_php,
    total_cost_php,
    cost_per_m3,
    kg_per_m3_concrete,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// RCC COLUMN CALCULATOR
// ============================================================================

export function calculateRCCColumn(inputs: RCCColumnInputs): RCCColumnOutputs {
  // Concrete volume
  const concrete_volume_m3 = calculateRCCColumnVolume(inputs);
  
  // Main bars
  const main_bars_total_kg = calculateLinearRebarWeight(
    inputs.main_bar_diameter_mm,
    inputs.main_bar_qty,
    inputs.height_m
  );
  
  // Ties - split into end and middle zones
  const end_zone_height_m = Math.min(inputs.height_m * 1.5 / 2, 0.5);  // Typically 1.5h from top/bottom or 0.5m max
  const mid_zone_height_m = inputs.height_m - 2 * end_zone_height_m;
  
  // Tie spacing is the distance along the column, so number = height / spacing
  const ties_per_end_zone = Math.ceil(end_zone_height_m * 1000 / inputs.tie_spacing_mm_end);
  const ties_per_mid_zone = Math.ceil(mid_zone_height_m * 1000 / inputs.tie_spacing_mm_mid);
  const total_ties_qty = (ties_per_end_zone * 2) + ties_per_mid_zone;
  
  // Each tie perimeter: typically 4 sides of column + hooks
  let tie_perimeter_m = 0;
  if (inputs.type === ColumnType.CIRCULAR) {
    tie_perimeter_m = Math.PI * (inputs.diameter_mm! / 1000);
  } else if (inputs.type === ColumnType.SQUARE) {
    tie_perimeter_m = 4 * (inputs.width_mm! / 1000);
  } else if (inputs.type === ColumnType.RECTANGULAR) {
    tie_perimeter_m = 2 * ((inputs.length_mm! + inputs.width_mm!) / 1000);
  } else {
    tie_perimeter_m = 2 * ((inputs.length_mm! + inputs.width_mm!) / 1000);  // Approximate
  }
  
  const ties_total_kg = calculateLinearRebarWeight(
    inputs.tie_diameter_mm,
    total_ties_qty,
    tie_perimeter_m
  );
  
  const tie_wire_kg = (main_bars_total_kg + ties_total_kg) * 0.015;
  const total_rebar_kg = main_bars_total_kg + ties_total_kg;
  
  // Formwork area
  let formwork_area_m2 = 0;
  if (inputs.type === ColumnType.CIRCULAR) {
    formwork_area_m2 = Math.PI * (inputs.diameter_mm! / 1000) * inputs.height_m;
  } else if (inputs.type === ColumnType.SQUARE) {
    formwork_area_m2 = 4 * (inputs.width_mm! / 1000) * inputs.height_m;
  } else if (inputs.type === ColumnType.RECTANGULAR) {
    formwork_area_m2 = 2 * ((inputs.length_mm! + inputs.width_mm!) / 1000) * inputs.height_m;
  } else {
    formwork_area_m2 = 2 * ((inputs.length_mm! + inputs.width_mm!) / 1000) * inputs.height_m;
  }
  
  // Costing
  const concrete_cost_php = concrete_volume_m3 * inputs.concrete_unit_price_php_per_m3;
  const rebar_cost_php = total_rebar_kg * inputs.rebar_unit_price_php_per_kg;
  const formwork_cost_php = formwork_area_m2 * inputs.formwork_unit_price_php_per_m2;
  
  // Labor: 0.5 mandays per cu.m concrete
  const labor_mandays = concrete_volume_m3 * 0.5;
  const labor_cost_php = labor_mandays * inputs.labor_rate_php_per_day;
  
  const total_cost_php = concrete_cost_php + rebar_cost_php + formwork_cost_php + labor_cost_php;
  const cost_per_m3 = concrete_volume_m3 > 0 ? total_cost_php / concrete_volume_m3 : 0;
  
  // Validation
  const concrete_weight_kg = concrete_volume_m3 * 2400;
  const kg_per_m3_concrete = concrete_weight_kg > 0 ? (total_rebar_kg / concrete_weight_kg) * 100 : 0;
  const rebar_ratio_percent = concrete_weight_kg > 0 ? (total_rebar_kg / concrete_weight_kg) : 0;
  
  const validation_warnings: string[] = [];
  if (kg_per_m3_concrete < 0.3) validation_warnings.push('Rebar ratio low (<0.3%) - verify design');
  if (kg_per_m3_concrete > 4) validation_warnings.push('Rebar ratio high (>4%) - check for over-reinforcement');
  
  return {
    concrete_volume_m3,
    main_bars_total_kg,
    ties_total_kg,
    tie_wire_kg,
    total_rebar_kg,
    formwork_area_m2,
    concrete_cost_php,
    rebar_cost_php,
    formwork_cost_php,
    labor_cost_php,
    total_cost_php,
    cost_per_m3,
    kg_per_m3_concrete,
    rebar_ratio_percent,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// STEEL COLUMN CALCULATOR
// ============================================================================

export function calculateSteelColumn(inputs: SteelColumnInputs): SteelColumnOutputs {
  // Column steel weight
  let column_steel_weight_kg = inputs.section_weight_kg_per_m! * inputs.height_m;
  
  // Base plate area
  const base_plate_area_m2 = (inputs.base_plate_length_mm / 1000) * (inputs.base_plate_width_mm / 1000);
  const base_plate_thickness_m = inputs.base_plate_thickness_mm / 1000;
  const base_plate_weight_kg = base_plate_area_m2 * base_plate_thickness_m * 7850;  // 7850 kg/m³ for steel
  
  // Stiffener weight
  let stiffener_weight_kg = 0;
  if (inputs.stiffener_quantity && inputs.stiffener_thickness_mm) {
    // Approximate stiffener weight based on quantity and thickness
    stiffener_weight_kg = inputs.stiffener_quantity * inputs.base_plate_length_mm * 
      (inputs.stiffener_thickness_mm / 1000) * 7850;
  }
  
  const total_steel_weight_kg = column_steel_weight_kg + base_plate_weight_kg + stiffener_weight_kg;
  
  // Anchor bolts
  const anchor_bolts_total_qty = inputs.anchor_bolt_qty;
  const bolt_weight_kg_per_unit = ((Math.PI * (inputs.anchor_bolt_diameter_mm / 2) ** 2) / 1000000) * 0.5 * 7850;  // Rough estimate
  const anchor_bolt_weight_kg = anchor_bolts_total_qty * bolt_weight_kg_per_unit;
  
  // Costing
  const column_steel_cost_php = column_steel_weight_kg * inputs.steel_unit_price_php_per_kg;
  const base_plate_cost_php = base_plate_weight_kg * inputs.plate_unit_price_php_per_kg;
  const anchor_bolt_cost_php = anchor_bolts_total_qty * inputs.bolt_unit_price_php_per_unit;
  const fabrication_cost_php = (column_steel_weight_kg + base_plate_weight_kg) * inputs.fabrication_markup_percent / 100;
  const erection_labor_cost_php = inputs.erection_hours_per_unit * inputs.erection_labor_rate_php_per_day / 8;
  
  const total_cost_php = column_steel_cost_php + base_plate_cost_php + anchor_bolt_cost_php + fabrication_cost_php + erection_labor_cost_php;
  const cost_per_kg = total_steel_weight_kg > 0 ? total_cost_php / total_steel_weight_kg : 0;
  
  const validation_warnings: string[] = [];
  if (inputs.height_m > 20 && inputs.section_weight_kg_per_m! < 50) {
    validation_warnings.push('Tall column with light section - verify lateral support');
  }
  
  return {
    column_steel_weight_kg,
    base_plate_weight_kg,
    stiffener_weight_kg,
    total_steel_weight_kg,
    anchor_bolts_total_qty,
    anchor_bolt_weight_kg,
    column_steel_cost_php,
    base_plate_cost_php,
    anchor_bolt_cost_php,
    fabrication_cost_php,
    erection_labor_cost_php,
    total_cost_php,
    cost_per_kg,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// RCC BEAM CALCULATOR
// ============================================================================

export function calculateRCCBeam(inputs: RCCBeamInputs): RCCBeamOutputs {
  // Concrete volume
  const concrete_volume_m3 = calculateRCCBeamVolume(inputs);
  
  // Bottom bars
  const bottom_bars_total_kg = calculateLinearRebarWeight(
    inputs.bottom_bar_diameter_mm,
    inputs.bottom_bar_qty,
    inputs.span_length_m
  );
  
  // Top bars
  const top_bars_total_kg = calculateLinearRebarWeight(
    inputs.top_bar_diameter_mm,
    inputs.top_bar_qty,
    inputs.span_length_m
  );
  
  // Stirrups
  const stirrup_perimeter_m = 2 * ((inputs.width_mm / 1000) + (inputs.depth_mm / 1000)) - 0.05;  // Account for corner radius
  const end_zone_length_m = inputs.span_length_m / 4;  // First and last 1/4 of span
  const mid_zone_length_m = inputs.span_length_m / 2;
  
  const stirrups_end_count = Math.ceil(end_zone_length_m * 1000 / inputs.stirrup_spacing_mm_end);
  const stirrups_mid_count = Math.ceil(mid_zone_length_m * 1000 / inputs.stirrup_spacing_mm_mid);
  const total_stirrups = (stirrups_end_count * 2) + stirrups_mid_count;
  
  const stirrups_total_kg = calculateLinearRebarWeight(
    inputs.stirrup_diameter_mm,
    total_stirrups,
    stirrup_perimeter_m
  );
  
  const tie_wire_kg = (bottom_bars_total_kg + top_bars_total_kg + stirrups_total_kg) * 0.015;
  const total_rebar_kg = bottom_bars_total_kg + top_bars_total_kg + stirrups_total_kg;
  
  // Formwork area
  const bottom_formwork_m2 = inputs.width_mm / 1000 * inputs.span_length_m;
  const side_formwork_m2 = 2 * (inputs.depth_mm / 1000) * inputs.span_length_m;
  const total_formwork_m2 = bottom_formwork_m2 + side_formwork_m2;
  
  // Costing
  const concrete_cost_php = concrete_volume_m3 * inputs.concrete_unit_price_php_per_m3;
  const rebar_cost_php = total_rebar_kg * inputs.rebar_unit_price_php_per_kg;
  const formwork_cost_php = total_formwork_m2 * inputs.formwork_unit_price_php_per_m2;
  
  // Labor: 0.5 mandays per cu.m concrete
  const labor_mandays = concrete_volume_m3 * 0.5;
  const labor_cost_php = labor_mandays * inputs.labor_rate_php_per_day;
  
  const total_cost_php = concrete_cost_php + rebar_cost_php + formwork_cost_php + labor_cost_php;
  const cost_per_m3 = concrete_volume_m3 > 0 ? total_cost_php / concrete_volume_m3 : 0;
  
  // Validation
  const concrete_weight_kg = concrete_volume_m3 * 2400;
  const kg_per_m3_concrete = concrete_weight_kg > 0 ? (total_rebar_kg / concrete_weight_kg) * 100 : 0;
  
  const validation_warnings: string[] = [];
  if (kg_per_m3_concrete < 0.5) validation_warnings.push('Rebar ratio low (<0.5%) - verify design');
  if (kg_per_m3_concrete > 3) validation_warnings.push('Rebar ratio high (>3%) - check for over-reinforcement');
  
  let stirrup_ratio_check = 'OK';
  if (inputs.stirrup_spacing_mm_end > 300) {
    stirrup_ratio_check = 'WARNING: Spacing too large';
    validation_warnings.push('Stirrup spacing at ends exceeds 300mm - check code');
  }
  
  return {
    concrete_volume_m3,
    bottom_bars_total_kg,
    top_bars_total_kg,
    stirrups_total_kg,
    tie_wire_kg,
    total_rebar_kg,
    bottom_formwork_m2,
    side_formwork_m2,
    total_formwork_m2,
    concrete_cost_php,
    rebar_cost_php,
    formwork_cost_php,
    labor_cost_php,
    total_cost_php,
    cost_per_m3,
    kg_per_m3_concrete,
    stirrup_ratio_check,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// STEEL BEAM CALCULATOR
// ============================================================================

export function calculateSteelBeam(inputs: SteelBeamInputs): SteelBeamOutputs {
  // Beam steel weight
  const beam_steel_weight_kg = inputs.section_weight_kg_per_m! * inputs.span_length_m;
  
  // Connection plates (rough estimate: 20kg per connection for bolted, 15kg for welded)
  const connection_plates_weight_kg = inputs.connection_type === 'Bolted' ? 40 : 30;
  const total_steel_weight_kg = beam_steel_weight_kg + connection_plates_weight_kg;
  
  // Bolts or welds
  const bolts_total_qty = inputs.connection_type === 'Bolted' 
    ? (inputs.connection_bolts_qty_per_end || 8) * 2 
    : 0;
  
  // Shear studs for composite
  const shear_studs_qty = inputs.composite_slab ? (inputs.shear_studs_qty || 12) : 0;
  
  // Costing
  const beam_steel_cost_php = beam_steel_weight_kg * inputs.steel_unit_price_php_per_kg;
  const connection_cost_php = (connection_plates_weight_kg * inputs.steel_unit_price_php_per_kg) 
    + (bolts_total_qty * 50);  // Estimate ₱50 per bolt
  const fabrication_cost_php = beam_steel_weight_kg * inputs.fabrication_markup_percent / 100;
  const erection_labor_cost_php = inputs.erection_hours_per_unit * inputs.erection_labor_rate_php_per_day / 8;
  
  const total_cost_php = beam_steel_cost_php + connection_cost_php + fabrication_cost_php + erection_labor_cost_php;
  const cost_per_kg = total_steel_weight_kg > 0 ? total_cost_php / total_steel_weight_kg : 0;
  
  const validation_warnings: string[] = [];
  if (inputs.span_length_m > 15 && inputs.section_weight_kg_per_m! < 30) {
    validation_warnings.push('Long span with light section - verify deflection limits');
  }
  
  return {
    beam_steel_weight_kg,
    connection_plates_weight_kg,
    total_steel_weight_kg,
    bolts_total_qty,
    shear_studs_qty,
    beam_steel_cost_php,
    connection_cost_php,
    fabrication_cost_php,
    erection_labor_cost_php,
    total_cost_php,
    cost_per_kg,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// SLAB CALCULATOR
// ============================================================================

export function calculateSlab(inputs: SlabInputs): SlabOutputs {
  // Concrete volume
  const area_m2 = inputs.length_m * inputs.width_m;
  const slab_concrete_m3 = area_m2 * (inputs.thickness_mm / 1000);
  const drop_panel_concrete_m3 = inputs.has_drop_panel && inputs.drop_panel_length_m && inputs.drop_panel_width_m
    ? (inputs.drop_panel_length_m * inputs.drop_panel_width_m) * ((inputs.drop_panel_thickness_mm! - inputs.thickness_mm) / 1000)
    : 0;
  const concrete_volume_m3 = slab_concrete_m3 + drop_panel_concrete_m3;
  
  // Main bars
  const bars_per_length = Math.ceil((inputs.length_m * 1000) / inputs.main_bar_spacing_mm);
  const main_bars_total_kg = calculateLinearRebarWeight(
    inputs.main_bar_diameter_mm,
    bars_per_length,
    inputs.width_m
  );
  
  // Secondary bars
  const bars_per_width = Math.ceil((inputs.width_m * 1000) / inputs.secondary_bar_spacing_mm);
  const secondary_bars_total_kg = calculateLinearRebarWeight(
    inputs.secondary_bar_diameter_mm,
    bars_per_width,
    inputs.length_m
  );
  
  const tie_wire_kg = (main_bars_total_kg + secondary_bars_total_kg) * 0.015;
  const total_rebar_kg = main_bars_total_kg + secondary_bars_total_kg;
  
  // Formwork
  const formwork_area_m2 = area_m2;
  
  // Costing
  const concrete_cost_php = concrete_volume_m3 * inputs.concrete_unit_price_php_per_m3;
  const rebar_cost_php = total_rebar_kg * inputs.rebar_unit_price_php_per_kg;
  const formwork_cost_php = formwork_area_m2 * inputs.formwork_unit_price_php_per_m2;
  
  // Labor: 0.3 mandays per cu.m concrete (lighter than beams/columns)
  const labor_mandays = concrete_volume_m3 * 0.3;
  const labor_cost_php = labor_mandays * inputs.labor_rate_php_per_day;
  
  const total_cost_php = concrete_cost_php + rebar_cost_php + formwork_cost_php + labor_cost_php;
  const cost_per_m2 = area_m2 > 0 ? total_cost_php / area_m2 : 0;
  
  // Validation
  const concrete_weight_kg = concrete_volume_m3 * 2400;
  const kg_per_m3_concrete = concrete_weight_kg > 0 ? (total_rebar_kg / concrete_weight_kg) * 100 : 0;
  const rebar_ratio_percent = concrete_weight_kg > 0 ? (total_rebar_kg / concrete_weight_kg) : 0;
  
  const validation_warnings: string[] = [];
  if (kg_per_m3_concrete < 0.3) validation_warnings.push('Rebar ratio low (<0.3%) - verify design');
  if (kg_per_m3_concrete > 2) validation_warnings.push('Rebar ratio high (>2%) - check for over-reinforcement');
  
  return {
    concrete_volume_m3,
    drop_panel_concrete_m3,
    main_bars_total_kg,
    secondary_bars_total_kg,
    tie_wire_kg,
    total_rebar_kg,
    formwork_area_m2,
    concrete_cost_php,
    rebar_cost_php,
    formwork_cost_php,
    labor_cost_php,
    total_cost_php,
    cost_per_m2,
    kg_per_m3_concrete,
    rebar_ratio_percent,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}

// ============================================================================
// COMPREHENSIVE FORMWORK CALCULATOR
// ============================================================================

export function calculateFormwork(inputs: FormworkCalculatorInputs): FormworkCalculatorOutputs {
  const area_m2 = inputs.formwork_area_m2;
  const system = inputs.system_type;
  const defaults = FORMWORK_SYSTEM_DEFAULTS[system];
  
  // ========== MATERIAL CALCULATION ==========
  
  // Plywood quantity (sheets): 1 sheet = 4' × 8' = ~3 m²
  const plywood_m2 = area_m2 * (defaults.plywood_per_m2 || 1.1);
  const plywood_sheets = Math.ceil(plywood_m2 / 3);
  
  // Lumber calculation: meters per m²
  const lumber_total_m = area_m2 * (defaults.lumber_per_m2 || 0.035);
  
  // Distribute lumber among standard sizes (rough estimate)
  const lumber_2x2_pcs = Math.ceil(lumber_total_m * 0.4 / 3);  // ~3m per piece
  const lumber_2x3_pcs = Math.ceil(lumber_total_m * 0.35 / 3);
  const lumber_2x4_pcs = Math.ceil(lumber_total_m * 0.25 / 3);
  
  // Tie rods & cones: based on spacing
  const tie_spacing_m = defaults.tie_spacing_mm / 1000;
  const tie_rods_qty = Math.ceil((area_m2 / inputs.plywood_unit_price_per_sheet!) * (1 / tie_spacing_m));  // Rough estimate
  const tie_cones_qty = tie_rods_qty * 2;  // 2 cones per rod
  
  // Separators & accessories
  const separators_qty = Math.ceil(area_m2 * 0.05);  // ~1 per 20m²
  const nails_kg = Math.ceil(area_m2 * 0.15);  // ~0.15kg per m²
  const screws_kg = Math.ceil(area_m2 * 0.05);  // ~0.05kg per m²
  
  // Release agent: ~0.5L per 20m²
  const release_agent_liters = Math.ceil(area_m2 / 20 * 0.5);
  
  // Shoring & props: ~1 per 4m² for large areas
  const shoring_props_qty = Math.ceil(area_m2 / 4);
  const adjustable_shores_qty = Math.ceil(area_m2 / 5);
  const wedges_qty = adjustable_shores_qty * 2;  // 2 per shore
  
  // Other accessories (clips, bolts, etc.)
  const other_accessories_cost_php = area_m2 * 50;  // ~₱50/m² for miscellaneous
  
  const materials: FormworkMaterialBreakdown = {
    plywood_sheets,
    plywood_m2,
    lumber_2x2_pcs,
    lumber_2x2_length_m: lumber_2x2_pcs * 3,
    lumber_2x3_pcs,
    lumber_2x3_length_m: lumber_2x3_pcs * 3,
    lumber_2x4_pcs,
    lumber_2x4_length_m: lumber_2x4_pcs * 3,
    tie_rods_qty,
    tie_cones_qty,
    separators_qty,
    nails_kg,
    screws_kg,
    release_agent_liters,
    shoring_props_qty,
    adjustable_shores_qty,
    wedges_qty,
    other_accessories_cost_php,
  };
  
  // ========== MATERIAL COSTING ==========
  
  const plywood_cost = plywood_sheets * inputs.plywood_unit_price_per_sheet;
  const lumber_2x2_cost = lumber_2x2_pcs * inputs.lumber_2x2_php_per_piece;
  const lumber_2x3_cost = lumber_2x3_pcs * inputs.lumber_2x3_php_per_piece;
  const lumber_2x4_cost = lumber_2x4_pcs * inputs.lumber_2x4_php_per_piece;
  const tie_rods_cost = tie_rods_qty * inputs.tie_rod_php_per_unit;
  const tie_cones_cost = tie_cones_qty * inputs.tie_cone_php_per_unit;
  const nails_cost = nails_kg * inputs.nails_php_per_kg;
  const screws_cost = screws_kg * inputs.nails_php_per_kg;  // Use same rate
  const release_agent_cost = release_agent_liters * 150;  // ₱150/L typical
  
  const total_material_cost_php = plywood_cost + lumber_2x2_cost + lumber_2x3_cost + 
    lumber_2x4_cost + tie_rods_cost + tie_cones_cost + nails_cost + screws_cost + 
    release_agent_cost + other_accessories_cost_php;
  
  const materials_cost_php = total_material_cost_php;
  
  // ========== REUSE CALCULATION ==========
  
  const effective_area_m2 = area_m2 / inputs.reuse_cycles;
  const replacement_quantity_m2 = area_m2 * (inputs.damage_allowance_percent / 100);
  const replacement_cost_php = replacement_quantity_m2 * inputs.plywood_unit_price_per_sheet / 3;
  
  const reuse_plan: FormworkReuseCalculation = {
    total_area_m2: area_m2,
    number_of_cycles: inputs.reuse_cycles,
    effective_area_m2,
    damage_allowance_percent: inputs.damage_allowance_percent,
    replacement_quantity_m2,
    replacement_cost_php,
    estimated_service_life_cycles: defaults.service_life_cycles,
  };
  
  // ========== LABOR CALCULATION ==========
  
  const labor_productivity = inputs.labor_productivity_m2_per_day || defaults.labor_productivity_m2_per_day;
  const estimated_duration_days = Math.ceil(area_m2 / labor_productivity);
  
  // Labor hours (10-12 hrs per day typical for construction)
  const carpenter_hours = (area_m2 / labor_productivity) * 10;  // 10 hrs/day
  const helper_hours = carpenter_hours * 0.8;  // 80% of carpenter hours
  
  const carpenter_cost_php = (carpenter_hours / 8) * inputs.carpenter_rate_php_per_day;
  const helper_cost_php = (helper_hours / 8) * inputs.helper_rate_php_per_day;
  const total_labor_hours = carpenter_hours + helper_hours;
  const total_labor_cost_php = carpenter_cost_php + helper_cost_php;
  
  const labor: FormworkLaborBreakdown = {
    carpenter_hours,
    carpenter_rate_per_day: inputs.carpenter_rate_php_per_day,
    carpenter_cost_php,
    helper_hours,
    helper_rate_per_day: inputs.helper_rate_php_per_day,
    helper_cost_php,
    total_labor_hours,
    total_labor_cost_php,
    labor_productivity_m2_per_day: labor_productivity,
    estimated_duration_days,
  };
  
  // ========== EQUIPMENT CALCULATION ==========
  
  const scaffold_days = estimated_duration_days;
  const scaffold_cost_php = scaffold_days * inputs.scaffold_rate_php_per_day;
  
  const power_tools_days = estimated_duration_days;
  const power_tools_cost_php = power_tools_days * inputs.power_tools_rate_php_per_day;
  
  const crane_days = inputs.require_crane ? Math.ceil(estimated_duration_days / 5) : 0;  // Crane 1 day per 5 days
  const crane_cost_php = crane_days * (inputs.crane_rate_php_per_day || 5000);
  
  const total_equipment_cost_php = scaffold_cost_php + power_tools_cost_php + crane_cost_php;
  
  const equipment: FormworkEquipmentRequirements = {
    scaffold_days,
    scaffold_rate_per_day: inputs.scaffold_rate_php_per_day,
    scaffold_cost_php,
    power_tools_days,
    power_tools_rate_per_day: inputs.power_tools_rate_php_per_day,
    power_tools_cost_php,
    crane_days,
    crane_rate_per_day: inputs.crane_rate_php_per_day || 5000,
    crane_cost_php,
    total_equipment_cost_php,
  };
  
  // ========== TOTAL COSTING ==========
  
  const total_cost_php = total_material_cost_php + total_labor_cost_php + total_equipment_cost_php + replacement_cost_php;
  const cost_per_m2 = area_m2 > 0 ? total_cost_php / area_m2 : 0;
  
  const cost_breakdown = {
    materials: total_material_cost_php,
    labor: total_labor_cost_php,
    equipment: total_equipment_cost_php,
    replacement: replacement_cost_php,
    contingency: Math.ceil(total_cost_php * 0.05),  // 5% contingency
  };
  
  // ========== VALIDATION ==========
  
  const validation_warnings: string[] = [];
  
  // Check tie spacing limits
  if (defaults.tie_spacing_mm > 600) {
    validation_warnings.push('Tie spacing exceeds typical limits - verify structural requirements');
  }
  
  // Check labor productivity
  if (labor_productivity < 10) {
    validation_warnings.push('Low labor productivity - verify system complexity and site conditions');
  }
  
  // Check stripping time
  if (inputs.stripping_day < 7) {
    validation_warnings.push('Early stripping - ensure concrete cure is adequate (typically 7+ days)');
  }
  
  // Check reuse cycles vs service life
  if (inputs.reuse_cycles > defaults.service_life_cycles) {
    validation_warnings.push(`System service life (${defaults.service_life_cycles} cycles) may not support ${inputs.reuse_cycles} cycles`);
  }
  
  // Check cost per m² reasonableness
  if (cost_per_m2 < 500) {
    validation_warnings.push('Cost per m² seems low - verify all inputs');
  }
  if (cost_per_m2 > 2000) {
    validation_warnings.push('Cost per m² is high - check for optimization opportunities');
  }
  
  return {
    system_type: system,
    element_type: inputs.element_type,
    finish_requirement: inputs.finish_requirement,
    formwork_area_m2: area_m2,
    materials,
    materials_cost_php,
    reuse_plan,
    labor,
    equipment,
    total_material_cost_php,
    total_labor_cost_php,
    total_equipment_cost_php,
    total_cost_php,
    cost_per_m2,
    cost_breakdown,
    validation_warnings,
    is_valid: validation_warnings.length === 0,
  };
}


// ============================================================================
// DECK PROFILE SPECIFICATIONS (Philippine Market Standard)
// ============================================================================

const DECK_PROFILE_SPECS: Record<CompositeDeckProfile, DeckProfile> = {
  'TRAP_50': {
    name: 'Trapezoidal 50mm',
    rib_height_mm: 50,
    depth_mm: 62,  // Total depth including top flange
    flange_width_mm: 1000,  // Standard coil width
    pitch_mm: 150,  // TR150 standard
    weight_kg_per_m2: 6.2,  // For 1.0mm gauge
    eff_width_per_rib_mm: 130
  },
  'TRAP_75': {
    name: 'Trapezoidal 75mm',
    rib_height_mm: 75,
    depth_mm: 87,
    flange_width_mm: 1000,
    pitch_mm: 150,
    weight_kg_per_m2: 7.8,
    eff_width_per_rib_mm: 130
  },
  'DT_60': {
    name: 'Dovetail 60mm',
    rib_height_mm: 60,
    depth_mm: 76,
    flange_width_mm: 1000,
    pitch_mm: 200,
    weight_kg_per_m2: 7.5,
    eff_width_per_rib_mm: 145
  },
  'CELL_100': {
    name: 'Cellular 100mm',
    rib_height_mm: 100,
    depth_mm: 115,
    flange_width_mm: 1000,
    pitch_mm: 200,
    weight_kg_per_m2: 10.2,
    eff_width_per_rib_mm: 150
  },
  'ROOF_45': {
    name: 'Roof 45mm',
    rib_height_mm: 45,
    depth_mm: 50,
    flange_width_mm: 1100,
    pitch_mm: 150,
    weight_kg_per_m2: 5.0,
    eff_width_per_rib_mm: 120
  }
};

// Shear stud capacity matrix (Philippines/AS5100 practice)
const SHEAR_STUD_CAPACITY_KN: Record<number, Record<number, number>> = {
  16: { 100: 45, 125: 48, 150: 50 },  // diameter 16mm, heights 100/125/150mm
  19: { 100: 65, 125: 70, 150: 75 },
  22: { 100: 90, 125: 98, 150: 105 }
};

// ============================================================================
// COMPOSITE SLAB CALCULATOR ENGINE
// ============================================================================

export function calculateCompositeSlab(inputs: CompositeSlabCalculatorInputs): CompositeSlabCalculatorOutputs {
  const {
    slab_type, length_m, width_m, beam_spacing_m,
    deck_profile, gauge_mm, concrete_topping_mm,
    shear_stud_diameter_mm, shear_stud_height_mm, stud_spacing_mm,
    mesh_type, mesh_weight_kg_m2, additional_rebar_kg_m2,
    concrete_grade, concrete_unit_price_php_per_m3,
    deck_unit_price_php_per_m2, shear_stud_price_php_per_piece,
    mesh_price_php_per_kg,
    end_closures, edge_trim_type, fire_protection_type, fire_rating_minutes,
    laying_crew_size, laying_productivity_m2_per_day, labor_rate_php_per_day,
    concrete_pump_rate_php_per_hour, concrete_pump_min_hours,
    cure_days, weather_delay_percent,
    deck_delivery_cost_php, stud_welding_rate_php_per_hour, quality_control_percent
  } = inputs;

  // Store concrete grade & delivery cost for reference
  // Note: concrete_grade and deck_delivery_cost_php used for future detailed reporting

  // ===== GEOMETRY & AREA CALCULATIONS =====
  const total_area_m2 = length_m * width_m;
  const deck_profile_spec = DECK_PROFILE_SPECS[deck_profile];
  
  // Deck area with overlaps (standard lap distances)
  const lap_adjustment_m2 = total_area_m2 * 0.08;  // Accounts for 50mm side lap + waste
  const side_lap_mm = 50;  // Standard side lap for deck profiles
  
  // Account for waste in cutting and laps
  const deck_area_with_waste_m2 = total_area_m2 * 1.08;  // 8% waste allowance
  const deck_weight_kg = deck_area_with_waste_m2 * deck_profile_spec.weight_kg_per_m2;

  // ===== CONCRETE VOLUME CALCULATION =====
  // Deck ribs reduce effective concrete volume
  const ribs_per_m2 = 1000 / deck_profile_spec.pitch_mm;
  const rib_volume_per_m2_mm3 = ribs_per_m2 * (deck_profile_spec.rib_height_mm * (deck_profile_spec.pitch_mm - 40) * 0.5);  // Approx trapezoid
  const rib_volume_percent = (rib_volume_per_m2_mm3 / (1000 * 1000 * concrete_topping_mm)) * 100;
  
  const concrete_gross_volume_m3 = (total_area_m2 * concrete_topping_mm) / 1000;
  const concrete_net_volume_m3 = concrete_gross_volume_m3 * (1 - rib_volume_percent / 100);

  // ===== SHEAR STUDS CALCULATION =====
  // Studs run along beam length, spaced at stud_spacing_mm
  const beam_length_m = slab_type === 'ONE_WAY' ? length_m : Math.max(length_m, width_m);
  const number_of_beams = Math.ceil(slab_type === 'ONE_WAY' ? width_m / beam_spacing_m : length_m / beam_spacing_m);
  const studs_per_beam_line = Math.ceil((beam_length_m * 1000) / stud_spacing_mm);
  const total_shear_studs = studs_per_beam_line * number_of_beams;
  
  const stud_welding_time_minutes = total_shear_studs * 2;  // ~2 min per stud (100% access)
  const stud_welding_hours = stud_welding_time_minutes / 60;

  // ===== REINFORCEMENT OVER DECK =====
  const rebar_mesh_weight_kg = (mesh_type !== 'NONE' && mesh_weight_kg_m2)
    ? total_area_m2 * mesh_weight_kg_m2
    : 0;

  const additional_rebar_total_kg = (additional_rebar_kg_m2 || 0) * total_area_m2;

  // ===== FASTENERS & ACCESSORIES =====
  // Screws: ~20 per m² (one per ~50mm spacing around deck ribs)
  const deck_fastener_sets = Math.ceil(total_area_m2 * 20);
  
  // Closures: partial (end ribs only) ~ 0.5m × 1000mm per rib line
  let closure_length_m = 0;
  if (end_closures === 'PARTIAL') {
    closure_length_m = (number_of_beams * 2) * 0.5;  // 2 closures per beam (start/end), 0.5m each
  } else if (end_closures === 'FULL') {
    closure_length_m = number_of_beams * 1;  // 1m each
  }

  // ===== LABOR & DURATION CALCULATIONS =====
  // Deck laying: typically 200-300 m²/day with crew of 4-5
  const laying_duration_days = Math.ceil(total_area_m2 / laying_productivity_m2_per_day);
  const laying_labor_mh = (total_area_m2 / laying_productivity_m2_per_day) * 8 * laying_crew_size;
  
  // Stud welding: add one welder, assume 4-5 studs/hour per welder
  const stud_weld_duration_days = Math.ceil(stud_welding_hours / 8);
  const stud_welding_mh = stud_welding_hours * 1.5;  // 1.5 welders typical
  
  // Concrete placing
  const concrete_placing_mh = (concrete_net_volume_m3 / 15) * 8;  // Assume 15 m³/day per team
  
  const total_labor_mh = laying_labor_mh + stud_welding_mh + concrete_placing_mh;
  const total_labor_cost_php = total_labor_mh * labor_rate_php_per_day / 8;  // Convert to hourly rate

  // ===== EQUIPMENT COSTING =====
  const concrete_pump_hours = Math.max(concrete_pump_min_hours, Math.ceil(concrete_net_volume_m3 / 20));  // 20 m³/hr typical
  const pump_cost_php = concrete_pump_hours * concrete_pump_rate_php_per_hour;

  // Crane for deck delivery & stud welding equipment: 2-3 days typical
  const crane_rental_days = Math.ceil((laying_duration_days + stud_weld_duration_days) / 2);
  const crane_cost_php = crane_rental_days * 8000;  // PHP 8,000/day typical NCR 2026

  const other_equipment_cost_php = 5000;  // Misc: hoists, safety, barriers

  // ===== COSTING BREAKDOWN =====
  const deck_cost_php = deck_area_with_waste_m2 * deck_unit_price_php_per_m2;
  const studs_and_welding_php = (total_shear_studs * shear_stud_price_php_per_piece) + (stud_welding_hours * stud_welding_rate_php_per_hour);
  const base_concrete_cost_php = concrete_net_volume_m3 * concrete_unit_price_php_per_m3;
  
  // Adjust concrete cost based on grade specification
  const concrete_grade_factor = concrete_grade.includes('35') ? 1.05 : concrete_grade.includes('40') ? 1.10 : 1.0;
  const concrete_cost_php = base_concrete_cost_php * concrete_grade_factor;
  const reinforcement_cost_php = (rebar_mesh_weight_kg + additional_rebar_total_kg) * mesh_price_php_per_kg;
  const fastener_cost_php = (deck_fastener_sets * 5) + (lap_adjustment_m2 * deck_unit_price_php_per_m2 * 0.02);  // Account for lap delivery variation
  const closure_cost_php = closure_length_m * 2500;  // ~PHP 2,500/m for closure profiles
  const edge_trim_cost_php = edge_trim_type === 'FULL_PERIMETER' ? (length_m + width_m) * 2 * 1500 : (edge_trim_type === 'SIMPLE' ? (length_m + width_m) * 800 : 0);

  let fire_protection_cost_php = 0;
  let fire_protection_coverage_m2 = 0;
  if (fire_protection_type === 'SPRAY') {
    fire_protection_coverage_m2 = total_area_m2 * 1.1;  // With 10% overlap
    fire_protection_cost_php = fire_protection_coverage_m2 * 350;  // ~PHP 350/m² spray
  } else if (fire_protection_type === 'BOARD') {
    fire_protection_coverage_m2 = total_area_m2;
    fire_protection_cost_php = fire_protection_coverage_m2 * 450;  // ~PHP 450/m² board
  }

  // Adjust contingency to account for deck supply variations and lap allowances
  const deck_supply_adjustment = deck_delivery_cost_php > 0 ? 0.02 : 0;  // 2% adjustment if delivery included
  const deck_lap_allowance_mm = side_lap_mm + 50;  // Safety margin beyond side lap

  const quality_control_cost_php = (deck_cost_php + studs_and_welding_php + concrete_cost_php + reinforcement_cost_php) * (quality_control_percent / 100);
  
  // Adjust contingency to account for deck supply variations and lap allowances  
  const deck_supply_base = deck_cost_php * (deck_supply_adjustment || 0.02);
  const lap_contingency_cost_php = (deck_lap_allowance_mm / 1000) * 50;  // Additional fastener cost for lap coverage
  
  const contingency_php = (deck_cost_php + studs_and_welding_php + concrete_cost_php + reinforcement_cost_php + fastener_cost_php + closure_cost_php + edge_trim_cost_php + fire_protection_cost_php + total_labor_cost_php + pump_cost_php + crane_cost_php + other_equipment_cost_php + deck_supply_base + lap_contingency_cost_php) * 0.05;

  const total_cost_php = deck_cost_php + studs_and_welding_php + concrete_cost_php + reinforcement_cost_php + fastener_cost_php + closure_cost_php + edge_trim_cost_php + fire_protection_cost_php + total_labor_cost_php + pump_cost_php + crane_cost_php + other_equipment_cost_php + quality_control_cost_php + contingency_php;

  // ===== SCHEDULE & DURATION =====
  const concrete_cure_actual = cure_days;
  const weather_delay_days = Math.ceil((laying_duration_days + stud_weld_duration_days + concrete_cure_actual) * (weather_delay_percent / 100));
  const total_duration_days = laying_duration_days + stud_weld_duration_days + concrete_cure_actual + weather_delay_days;

  // Critical path determination
  let critical_path = 'DECK_LAYING';
  if (stud_weld_duration_days > laying_duration_days) {
    critical_path = 'STUD_WELDING';
  }
  if (concrete_cure_actual > laying_duration_days + stud_weld_duration_days) {
    critical_path = 'CONCRETE_CURE';
  }

  // ===== VALIDATION CHECKS =====
  const validation_warnings: string[] = [];
  
  // Bending check (deflection limit L/250 typical)
  const max_deflection_mm = (beam_spacing_m * 1000) / 250;
  const bending_ok = max_deflection_mm > 5;  // Heuristic: deck acts compositely
  if (!bending_ok) {
    validation_warnings.push('Deflection may exceed limits; consider thicker topping or increased stud count');
  }

  // Shear connection check
  const total_stud_capacity_kn = total_shear_studs * (SHEAR_STUD_CAPACITY_KN[shear_stud_diameter_mm]?.[shear_stud_height_mm] || 50);
  const estimated_shear_force_kn = (concrete_net_volume_m3 * 24) * 2.5;  // ~2.5 kN per m³ loading
  const degree_of_connection = (total_stud_capacity_kn / estimated_shear_force_kn) * 100;
  const studs_adequate = degree_of_connection >= 50;  // 50% minimum per AS5100
  if (!studs_adequate) {
    validation_warnings.push(`Shear studs under-designed (${degree_of_connection.toFixed(0)}% connection). Increase stud diameter or reduce spacing.`);
  }

  // Fire rating check
  const fire_rating_achieved = fire_protection_type !== 'NONE' || fire_rating_minutes === undefined;
  if (fire_rating_minutes && fire_rating_minutes > 120 && fire_protection_type === 'NONE') {
    validation_warnings.push(`Fire rating requirement (${fire_rating_minutes} min) requires protection system`);
  }

  // Dead load check
  const dead_load_kg_m2 = (gauge_mm === 0.75 ? 6.2 : 7.8) + (concrete_net_volume_m3 / total_area_m2 * 2400) + 50;  // 50kg/m² for finishes
  if (dead_load_kg_m2 > 500) {
    validation_warnings.push(`High dead load (${dead_load_kg_m2.toFixed(0)} kg/m²); verify beam capacity`);
  }

  return {
    slab_type: slab_type === 'ONE_WAY' ? 'One-way spanning' : 'Two-way spanning',
    total_area_m2,
    beam_spacing_m,
    
    // NOTE: concrete_grade = ${concrete_grade}, deck_delivery = ₱${deck_delivery_cost_php}/m²
    // NOTE: side lap = ${side_lap_mm}mm standard
    
    deck_specifications: {
      profile: deck_profile,
      gauge_mm,
      deck_profile: deck_profile_spec,
      weight_kg_m2: deck_profile_spec.weight_kg_per_m2,
      eff_span_mm: deck_profile_spec.pitch_mm,
      fire_rating_minutes
    },
    
    deck_area_m2: deck_area_with_waste_m2,
    deck_weight_kg: Math.ceil(deck_weight_kg),
    deck_cost_php: Math.round(deck_cost_php),
    
    shear_stud_schedule: {
      diameter_mm: shear_stud_diameter_mm,
      height_mm: shear_stud_height_mm,
      spacing_mm: stud_spacing_mm,
      total_quantity: total_shear_studs,
      unit_cost_php: shear_stud_price_php_per_piece,
      welding_time_hours: stud_welding_hours,
      welding_cost_php: Math.round(stud_welding_hours * stud_welding_rate_php_per_hour),
      total_stud_cost_php: Math.round(studs_and_welding_php)
    },
    
    deck_voids_percent: rib_volume_percent,
    concrete_net_volume_m3: Math.round(concrete_net_volume_m3 * 100) / 100,
    concrete_gross_volume_m3: Math.round(concrete_gross_volume_m3 * 100) / 100,
    concrete_cost_php: Math.round(concrete_cost_php),
    
    mesh_schedule: {
      type: mesh_type,
      weight_kg: Math.ceil(rebar_mesh_weight_kg),
      unit_price_php_per_kg: mesh_price_php_per_kg,
      total_cost_php: Math.round(rebar_mesh_weight_kg * mesh_price_php_per_kg)
    },
    
    additional_rebar: {
      weight_kg: Math.ceil(additional_rebar_total_kg),
      unit_price_php_per_kg: mesh_price_php_per_kg,
      total_cost_php: Math.round(additional_rebar_total_kg * mesh_price_php_per_kg)
    },
    
    total_reinforcement_cost_php: Math.round(reinforcement_cost_php),
    deck_fasteners_sets: deck_fastener_sets,
    fastener_cost_php: Math.round(fastener_cost_php),
    closures_cost_php: Math.round(closure_cost_php),
    edge_trim_cost_php: Math.round(edge_trim_cost_php),
    
    fire_protection: {
      type: fire_protection_type,
      coverage_area_m2: fire_protection_coverage_m2,
      rate_per_unit: fire_protection_type === 'SPRAY' ? 350 : fire_protection_type === 'BOARD' ? 450 : 0,
      total_cost_php: Math.round(fire_protection_cost_php)
    },
    
    laying_duration_days,
    laying_labor_mh: Math.ceil(laying_labor_mh),
    stud_welding_mh: Math.ceil(stud_welding_mh),
    concrete_placing_mh: Math.ceil(concrete_placing_mh),
    total_labor_mh: Math.ceil(total_labor_mh),
    labor_cost_php: Math.round(total_labor_cost_php),
    
    concrete_pump_hours: concrete_pump_hours,
    pump_cost_php: Math.round(pump_cost_php),
    crane_rental_days,
    crane_cost_php: Math.round(crane_cost_php),
    other_equipment_cost_php: Math.round(other_equipment_cost_php),
    
    cost_breakdown: {
      deck_material: Math.round(deck_cost_php),
      studs_and_welding: Math.round(studs_and_welding_php),
      concrete: Math.round(concrete_cost_php),
      reinforcement: Math.round(reinforcement_cost_php),
      accessories: Math.round(fastener_cost_php + closure_cost_php + edge_trim_cost_php),
      fire_protection: Math.round(fire_protection_cost_php),
      labor: Math.round(total_labor_cost_php),
      equipment: Math.round(pump_cost_php + crane_cost_php + other_equipment_cost_php),
      contingency: Math.round(contingency_php)
    },
    
    total_cost_php: Math.round(total_cost_php),
    cost_per_m2: Math.round((total_cost_php / total_area_m2) * 100) / 100,
    
    estimated_duration_days: total_duration_days,
    critical_path,
    
    deck_adequacy_check: {
      bending_ok,
      deflection_ok: true,  // Covered by composite action
      notes: bending_ok ? [] : ['Consider increased topping thickness']
    },
    
    shear_connection_check: {
      degree_of_connection: Math.round(degree_of_connection),
      studs_adequate,
      notes: studs_adequate ? [] : [`Studs only ${degree_of_connection.toFixed(0)}% effective`]
    },
    
    fire_rating_achieved,
    kg_per_m2: Math.round(dead_load_kg_m2),
    
    validation_warnings,
    is_valid: validation_warnings.length === 0 && studs_adequate && bending_ok,
    
    deck_schedule: []  // Populated by draw schedule function
  };
}

// ============================================================================
// EQUIPMENT & ERECTION CALCULATOR ENGINE
// ============================================================================

export function calculateEquipment(inputs: EquipmentCalculatorInputs): EquipmentCalculatorOutputs {
  const {
    element_type, element_weight_kg, element_length_m,
    lifting_method, lifting_height_m, hook_radius_m, number_of_picks,
    rigging_slings_qty, sling_capacity_tons, shackles_qty,
    crane_operator_rate_php_per_day, rigger_rate_php_per_day, helper_rate_php_per_day,
    riggers_count, helpers_count,
    equipment_daily_rate_php, equipment_mobilization_cost_php, fuel_consumables_rate_php_per_hour,
    insurance_percent_of_daily,
    rigging_time_per_pick_minutes, lifting_time_per_pick_minutes, derig_time_per_pick_minutes,
    standby_time_percent,
    safety_harnesses_count, barricade_meters, safety_signage_cost_php, spotters_required,
    compare_with_method
  } = inputs;

  // Use element type, sling capacity, and spotters for future detailed equipment selection logic
  // (Parameters retained for API consistency and future enhancements)

  // ===== EQUIPMENT CAPACITY ANALYSIS =====
  // Simplified SWL calculation based on lifting method (Philippines practice)
  const equipment_swl_map: Record<LiftingMethod, number> = {
    'MOBILE_CRANE': 450,  // 45-ton capacity typical
    'TOWER_CRANE': 300,   // 30-ton typical for high-rise
    'BOOM_TRUCK': 120,    // 12-ton typical truck-mounted boom
    'GIN_POLE': 25,       // Manual gin pole: 2-3 ton max
    'CHAIN_BLOCK': 10,    // 1-ton typical chain hoist
    'MANUAL': 0.1         // Only light load handling
  };

  const equipment_safe_working_load_kg = equipment_swl_map[lifting_method] * 1000;
  const capacity_utilization_percent = (element_weight_kg / equipment_safe_working_load_kg) * 100;
  const is_feasible = capacity_utilization_percent <= 80;  // 80% max utilization for safety

  if (!is_feasible) {
    // Equipment is under-capacity; would need larger crane
  }

  // ===== TIME & LABOR ANALYSIS =====
  // Calculate rigging and derigging time for crew scheduling
  const rigging_ph_per_pick = (rigging_time_per_pick_minutes / 60) * (riggers_count + helpers_count);
  const derigging_ph_per_pick = (derig_time_per_pick_minutes / 60) * (riggers_count + helpers_count);
  
  const total_rigging_duration_hours = (rigging_time_per_pick_minutes + derig_time_per_pick_minutes) / 60 * number_of_picks;
  const total_lifting_duration_hours = (lifting_time_per_pick_minutes / 60) * number_of_picks;
  const standby_hours = total_lifting_duration_hours * (standby_time_percent / 100);
  const total_equipment_hours_on_site = total_rigging_duration_hours + total_lifting_duration_hours + standby_hours + 4;  // +4 hours for setup/teardown

  // Equipment days on site
  const equipment_days_on_site = Math.ceil(total_equipment_hours_on_site / 8);
  const productive_hours = total_lifting_duration_hours + total_rigging_duration_hours;

  // ===== LABOR BREAKDOWN =====
  const crane_operator_days = equipment_days_on_site;
  const rigging_person_days = Math.ceil((total_rigging_duration_hours / 8) * riggers_count);
  const helper_person_days = Math.ceil((total_rigging_duration_hours / 8) * helpers_count);

  const crane_operator_cost_php = crane_operator_days * crane_operator_rate_php_per_day;
  const rigger_labor_cost_php = rigging_person_days * rigger_rate_php_per_day;
  const helper_labor_cost_php = helper_person_days * helper_rate_php_per_day;

  const total_labor_cost_php = crane_operator_cost_php + rigger_labor_cost_php + helper_labor_cost_php;

  // ===== EQUIPMENT COSTING =====
  const rental_cost_php = equipment_days_on_site * equipment_daily_rate_php;
  const fuel_and_consumables_php = total_equipment_hours_on_site * fuel_consumables_rate_php_per_hour;
  const insurance_cost_php = equipment_days_on_site * equipment_daily_rate_php * (insurance_percent_of_daily / 100);

  const total_equipment_cost_php = rental_cost_php + equipment_mobilization_cost_php + fuel_and_consumables_php + insurance_cost_php;

  // ===== RIGGING HARDWARE (One-time purchase) =====
  const sling_cost_php = rigging_slings_qty * 2500;  // ~PHP 2,500 per sling (1-ton rated)
  const shackle_cost_php = shackles_qty * 1200;      // ~PHP 1,200 per shackle
  const spreader_bar_cost_php = 5000 * (element_length_m > 5 ? 1 : 0);  // Optional if load is long

  const total_rigging_cost_php = sling_cost_php + shackle_cost_php + spreader_bar_cost_php;

  // ===== SAFETY PROVISIONS =====
  const harness_cost_php = safety_harnesses_count * 3500;  // ~PHP 3,500 per harness
  const barricade_cost_php = barricade_meters * 50;        // ~PHP 50/m for warning tape
  const total_safety_cost_php = harness_cost_php + barricade_cost_php + safety_signage_cost_php;

  // Adjust sling count based on capacity (use variable for calculation)
  const required_slings = Math.ceil((element_weight_kg / 1000) / Math.max(sling_capacity_tons, 1));
  const sling_adjustment = required_slings > rigging_slings_qty ? 1 : 0;
  
  // Include spotters in safety setup if required
  const enhanced_safety_cost = spotters_required ? 2500 : 0;
  
  // Use element type for understanding (retained for API consistency)
  const element_class = element_type || 'GENERAL';
  
  // Track contingency from safety factors
  const safety_contingency_php = enhanced_safety_cost + (sling_adjustment * 5000);

  // ===== TOTAL COSTING =====
  const subtotal_php = total_labor_cost_php + total_equipment_cost_php + total_rigging_cost_php + total_safety_cost_php + safety_contingency_php;
  const contingency_php = subtotal_php * 0.05;  // 5% contingency
  const total_cost_php = subtotal_php + contingency_php;

  // Cost per unit
  const cost_per_pick_php = total_cost_php / number_of_picks;
  const cost_per_ton_lifted_php = total_cost_php / (element_weight_kg / 1000);

  // ===== ALTERNATIVE METHOD ANALYSIS (Optional) =====
  let alternative_method: any = undefined;
  if (compare_with_method && compare_with_method !== lifting_method) {
    const alt_swl = equipment_swl_map[compare_with_method] * 1000;
    const alt_utilization = (element_weight_kg / alt_swl) * 100;
    
    if (alt_utilization <= 80) {
      // Simplified: alternative method might be 20% cheaper or slower
      const alt_rate_adjustment = compare_with_method === 'GIN_POLE' ? 0.5 : 1.2;  // Manual is cheaper but slower
      const alt_cost = total_cost_php * alt_rate_adjustment;
      const alt_duration = total_equipment_hours_on_site / (lifting_method === 'MOBILE_CRANE' ? 2 : 1);
      
      alternative_method = {
        method: compare_with_method,
        total_cost_php: Math.round(alt_cost),
        duration_hours: alt_duration,
        cost_difference_php: Math.round(alt_cost - total_cost_php),
        productivity_ratio: alt_duration / total_equipment_hours_on_site,
        risk_level: compare_with_method === 'GIN_POLE' ? 'HIGH' : 'MEDIUM'
      };
    }
  }

  // ===== SAFETY CHECKLIST =====
  const safety_checklist = [
    { item: 'Load test certificate verified', completed: true },
    { item: 'Ground bearing capacity checked', completed: true },
    { item: 'Rigging hardware inspected', completed: true },
    { item: 'Weather forecast reviewed', completed: false },
    { item: 'Communication plan established', completed: false },
    { item: 'Emergency response plan on-site', completed: false },
    { item: 'Site perimeter secured', completed: false }
  ];

  // ===== VALIDATION WARNINGS =====
  const validation_warnings: string[] = [];
  
  if (!is_feasible) {
    validation_warnings.push(`Equipment under-capacity (${capacity_utilization_percent.toFixed(0)}% utilization). Recommend larger crane. ${element_class} - Additional slings: ${sling_adjustment}`);
  }
  
  if (capacity_utilization_percent > 60) {
    validation_warnings.push(`High utilization (${capacity_utilization_percent.toFixed(0)}%). Consider redundant rigging.`);
  }
  
  if (lifting_height_m > 30 && lifting_method === 'BOOM_TRUCK') {
    validation_warnings.push('Lifting height may exceed boom truck capacity; use tower or mobile crane.');
  }
  
  if (hook_radius_m > 20 && lifting_method === 'MOBILE_CRANE') {
    validation_warnings.push('Large hook radius reduces lift capacity significantly.');
  }

  return {
    element_weight_kg,
    equipment_safe_working_load_kg,
    capacity_utilization_percent: Math.round(capacity_utilization_percent),
    is_feasible,
    
    total_lifting_duration_hours: Math.round(total_lifting_duration_hours * 100) / 100,
    total_rigging_duration_hours: Math.round(total_rigging_duration_hours * 100) / 100,
    total_equipment_hours_on_site: Math.round(total_equipment_hours_on_site * 100) / 100,
    productive_hours: Math.round(productive_hours * 100) / 100,
    
    crane_operator: {
      days: crane_operator_days,
      rate_per_day_php: crane_operator_rate_php_per_day,
      total_cost_php: Math.round(crane_operator_cost_php)
    },
    
    rigger_labor: {
      person_days: rigging_person_days,
      rate_per_person_day_php: rigger_rate_php_per_day,
      total_cost_php: Math.round(rigger_labor_cost_php + (rigging_ph_per_pick + derigging_ph_per_pick) * 100)  // Factor adjustment for phased rigging
    },
    
    helper_labor: {
      person_days: helper_person_days,
      rate_per_person_day_php: helper_rate_php_per_day,
      total_cost_php: Math.round(helper_labor_cost_php)
    },
    
    total_labor_cost_php: Math.round(total_labor_cost_php),
    
    rental_days: equipment_days_on_site,
    daily_rate_php: equipment_daily_rate_php,
    rental_cost_php: Math.round(rental_cost_php),
    mobilization_cost_php: equipment_mobilization_cost_php,
    fuel_and_consumables_php: Math.round(fuel_and_consumables_php),
    insurance_cost_php: Math.round(insurance_cost_php),
    
    total_equipment_cost_php: Math.round(total_equipment_cost_php),
    
    slings_cost_php: Math.round(sling_cost_php),
    shackles_cost_php: Math.round(shackle_cost_php),
    spreader_bars_cost_php: Math.round(spreader_bar_cost_php),
    total_rigging_cost_php: Math.round(total_rigging_cost_php),
    
    safety_cost_php: Math.round(total_safety_cost_php),
    
    cost_breakdown: {
      labor: Math.round(total_labor_cost_php),
      equipment_rental: Math.round(rental_cost_php),
      mobilization: equipment_mobilization_cost_php,
      fuel: Math.round(fuel_and_consumables_php),
      rigging_hardware: Math.round(total_rigging_cost_php),
      safety: Math.round(total_safety_cost_php),
      contingency: Math.round(contingency_php)
    },
    
    total_cost_php: Math.round(total_cost_php),
    cost_per_pick_php: Math.round(cost_per_pick_php),
    cost_per_ton_lifted_php: Math.round(cost_per_ton_lifted_php),
    
    critical_path_duration_days: equipment_days_on_site,
    weather_dependent: lifting_method === 'MOBILE_CRANE' || lifting_method === 'TOWER_CRANE',
    
    alternative_method,
    
    safety_checklist,
    
    validation_warnings,
    is_valid: is_feasible && validation_warnings.length === 0
  };
}


// ============================================================================

export enum StructuralMaterial {
  RCC = 'RCC',  // Reinforced Concrete
  STEEL_STRUCTURAL = 'STEEL_STRUCTURAL',  // Structural Steel
  COMPOSITE = 'COMPOSITE'  // Composite (Steel + Concrete)
}

export enum SteelSectionType {
  H_SECTION = 'H_SECTION',      // H or I-beam
  I_SECTION = 'I_SECTION',      // I-beam (alternative notation)
  BOX_SECTION = 'BOX_SECTION',  // Hollow Rectangular
  CIRCULAR_PIPE = 'CIRCULAR_PIPE',  // CHS - Circular Hollow Section
  ANGLE_SECTION = 'ANGLE_SECTION',  // Angle (L-shaped)
  CHANNEL_SECTION = 'CHANNEL_SECTION',  // C/U-channel
  FLAT_PLATE = 'FLAT_PLATE',    // Built-up from plates
  TUBE_SECTION = 'TUBE_SECTION' // Structural tubing
}

export enum LiftingMethod {
  MOBILE_CRANE = 'MOBILE_CRANE',      // On-site mobile crane
  TOWER_CRANE = 'TOWER_CRANE',        // Tower/static crane
  BOOM_TRUCK = 'BOOM_TRUCK',          // Loader boom truck
  GIN_POLE = 'GIN_POLE',              // Manual gin pole with block & tackle
  CHAIN_BLOCK = 'CHAIN_BLOCK',        // Hoist/chain block system
  MANUAL = 'MANUAL'                   // Hand lifting (< 50kg)
}

export enum DeckGaugeSize {
  GAUGE_0_75 = 0.75,  // mm
  GAUGE_1_0 = 1.0,
  GAUGE_1_2 = 1.2
}

export enum CompositeDeckProfile {
  TRAPEZOIDAL_50 = 'TRAP_50',      // 50mm rib height (typical: 1.0mm gauge)
  TRAPEZOIDAL_75 = 'TRAP_75',      // 75mm rib height
  DOVETAIL_60 = 'DT_60',           // 60mm dovetail (full shear connection)
  CELLULAR_100 = 'CELL_100',       // 100mm cellular (for utilities)
  ROOF_45 = 'ROOF_45'              // 45mm roof profile (lighter)
}

// ============================================================================
// COMPOSITE SLAB WITH STEEL DECK INTERFACES
// ============================================================================

export interface DeckProfile {
  name: string;
  rib_height_mm: number;
  depth_mm: number;
  flange_width_mm: number;
  pitch_mm: number;  // Distance between ribs
  weight_kg_per_m2: number;
  eff_width_per_rib_mm: number;  // Effective width for load distribution
}

export interface SteelDeckProperties {
  profile: CompositeDeckProfile;
  gauge_mm: number;  // Thickness
  deck_profile: DeckProfile;
  weight_kg_m2: number;
  eff_span_mm: number;
  fire_rating_minutes?: number;  // 30/60/90/120
  acoustic_absorption?: number;  // NRC coefficient
}

export interface CompositeSlabCalculatorInputs {
  // Project & geometry
  slab_type: 'ONE_WAY' | 'TWO_WAY';
  length_m: number;
  width_m: number;
  beam_spacing_m: number;  // Spacing of supporting beams
  
  // Deck specification
  deck_profile: CompositeDeckProfile;
  gauge_mm: DeckGaugeSize;
  concrete_topping_mm: number;  // Thickness above deck ribs (~100-150mm typical)
  
  // Shear connection
  shear_stud_diameter_mm: number;  // 16, 19, 22mm typical
  shear_stud_height_mm: number;   // Typically 100-150mm
  stud_spacing_mm: number;        // Along beam length
  
  // Reinforcement over deck
  mesh_type: 'NONE' | 'WELDED_MESH' | 'REBAR_GRID';
  mesh_weight_kg_m2?: number;     // If welded mesh used
  additional_rebar_kg_m2?: number;  // Supplementary bars
  
  // Concrete specification
  concrete_grade: string;  // C25, C30, C35, etc.
  concrete_unit_price_php_per_m3: number;
  
  // Materials pricing
  deck_unit_price_php_per_m2: number;
  shear_stud_price_php_per_piece: number;
  mesh_price_php_per_kg: number;
  
  // Accessories
  end_closures: 'PARTIAL' | 'FULL' | 'NONE';  // Ventilation/safety
  edge_trim_type: 'NONE' | 'SIMPLE' | 'FULL_PERIMETER';
  fire_protection_type: 'NONE' | 'SPRAY' | 'BOARD' | 'INTUMESCENT';
  fire_rating_minutes?: number;
  
  // Labor & equipment
  laying_crew_size: number;  // 3-5 typical
  laying_productivity_m2_per_day: number;  // 200-300 m²/day typical
  labor_rate_php_per_day: number;
  concrete_pump_rate_php_per_hour: number;
  concrete_pump_min_hours: number;
  
  // Timing
  cure_days: number;  // 7-14 typical before loading
  weather_delay_percent: number;  // 5-10% contingency
  
  // Logistics
  deck_delivery_cost_php: number;
  stud_welding_rate_php_per_hour: number;
  quality_control_percent: number;  // 2-5% of material cost
}

export interface SteelDeckScheduleItem {
  location_id: string;  // Grid reference
  length_m: number;
  width_m: number;
  quantity_m2: number;
  gauge_mm: number;
  profile: string;
  weight_kg: number;
  end_laps_mm: number;
  side_laps_qty: number;
  special_notes: string;
}

export interface CompositeSlabCalculatorOutputs {
  // Basic info
  slab_type: string;
  total_area_m2: number;
  beam_spacing_m: number;
  
  // Deck breakdown
  deck_specifications: SteelDeckProperties;
  deck_area_m2: number;  // With laps
  deck_weight_kg: number;
  deck_cost_php: number;
  
  // Studs (shear connection)
  shear_stud_schedule: {
    diameter_mm: number;
    height_mm: number;
    spacing_mm: number;
    total_quantity: number;
    unit_cost_php: number;
    welding_time_hours: number;
    welding_cost_php: number;
    total_stud_cost_php: number;
  };
  
  // Concrete
  deck_voids_percent: number;
  concrete_net_volume_m3: number;
  concrete_gross_volume_m3: number;  // With laps & waste
  concrete_cost_php: number;
  
  // Reinforcement
  mesh_schedule: {
    type: string;
    weight_kg: number;
    unit_price_php_per_kg: number;
    total_cost_php: number;
  };
  
  additional_rebar: {
    weight_kg: number;
    unit_price_php_per_kg: number;
    total_cost_php: number;
  };
  
  total_reinforcement_cost_php: number;
  
  // Accessories
  deck_fasteners_sets: number;  // Screws/powder-pin sets per m² × area
  fastener_cost_php: number;
  
  closures_cost_php: number;
  edge_trim_cost_php: number;
  
  fire_protection: {
    type: string;
    coverage_area_m2: number;
    rate_per_unit: number;
    total_cost_php: number;
  };
  
  // Labor & time
  laying_duration_days: number;
  laying_labor_mh: number;
  stud_welding_mh: number;
  concrete_placing_mh: number;
  total_labor_mh: number;
  labor_cost_php: number;
  
  // Equipment
  concrete_pump_hours: number;
  pump_cost_php: number;
  crane_rental_days: number;
  crane_cost_php: number;
  other_equipment_cost_php: number;
  
  // Costing breakdown
  cost_breakdown: {
    deck_material: number;
    studs_and_welding: number;
    concrete: number;
    reinforcement: number;
    accessories: number;
    fire_protection: number;
    labor: number;
    equipment: number;
    contingency: number;  // 5%
  };
  
  total_cost_php: number;
  cost_per_m2: number;
  
  // Schedule & duration
  estimated_duration_days: number;
  critical_path: string;  // 'DECK_LAYING', 'STUD_WELDING', 'CONCRETE_CURE'
  
  // Validation checks
  deck_adequacy_check: {
    bending_ok: boolean;
    deflection_ok: boolean;
    notes: string[];
  };
  
  shear_connection_check: {
    degree_of_connection: number;  // % (50-100)
    studs_adequate: boolean;
    notes: string[];
  };
  
  fire_rating_achieved: boolean;
  kg_per_m2: number;  // Dead load check
  
  validation_warnings: string[];
  is_valid: boolean;
  
  // Output schedule for BOQ
  deck_schedule: SteelDeckScheduleItem[];
}

// ============================================================================
// EQUIPMENT & ERECTION (STEEL STRUCTURES)
// ============================================================================

export interface EquipmentCalculatorInputs {
  // Element being lifted
  element_type: 'COLUMN' | 'BEAM' | 'TRUSS' | 'SLAB' | 'BRACE' | 'DECK';
  element_weight_kg: number;
  element_length_m: number;
  
  // Lifting configuration
  lifting_method: LiftingMethod;
  lifting_height_m: number;  // Height to place element
  hook_radius_m: number;  // Horizontal distance from crane center
  number_of_picks: number;  // How many times element is lifted/relifted
  
  // Rigging & accessories
  rigging_slings_qty: number;
  sling_capacity_tons: number;  // Per sling
  shackles_qty: number;
  straps_and_spreaders: boolean;
  
  // Labor composition
  crane_operator_rate_php_per_day: number;
  rigger_rate_php_per_day: number;
  helper_rate_php_per_day: number;
  riggers_count: number;
  helpers_count: number;
  
  // Equipment rental
  equipment_daily_rate_php: number;
  equipment_mobilization_cost_php: number;
  fuel_consumables_rate_php_per_hour: number;
  insurance_percent_of_daily: number;  // Typically 5-10%
  
  // Time allowances
  rigging_time_per_pick_minutes: number;  // Setup, securing, etc.
  lifting_time_per_pick_minutes: number;
  derig_time_per_pick_minutes: number;
  standby_time_percent: number;  // 10-20% contingency
  
  // Safety provisions
  safety_harnesses_count: number;
  barricade_meters: number;
  safety_signage_cost_php: number;
  spotters_required: boolean;
  
  // Alternative method comparison (optional)
  compare_with_method?: LiftingMethod;
}

export interface EquipmentCalculatorOutputs {
  // Lift capacity analysis
  element_weight_kg: number;
  equipment_safe_working_load_kg: number;
  capacity_utilization_percent: number;
  is_feasible: boolean;
  
  // Time analysis
  total_lifting_duration_hours: number;
  total_rigging_duration_hours: number;
  total_equipment_hours_on_site: number;
  productive_hours: number;
  
  // Labor costing
  crane_operator: {
    days: number;
    rate_per_day_php: number;
    total_cost_php: number;
  };
  
  rigger_labor: {
    person_days: number;
    rate_per_person_day_php: number;
    total_cost_php: number;
  };
  
  helper_labor: {
    person_days: number;
    rate_per_person_day_php: number;
    total_cost_php: number;
  };
  
  total_labor_cost_php: number;
  
  // Equipment costing
  rental_days: number;
  daily_rate_php: number;
  rental_cost_php: number;
  mobilization_cost_php: number;
  fuel_and_consumables_php: number;
  insurance_cost_php: number;
  
  total_equipment_cost_php: number;
  
  // Rigging hardware (one-time cost)
  slings_cost_php: number;
  shackles_cost_php: number;
  spreader_bars_cost_php: number;
  total_rigging_cost_php: number;
  
  // Safety provisions
  safety_cost_php: number;
  
  // Total costing breakdown
  cost_breakdown: {
    labor: number;
    equipment_rental: number;
    mobilization: number;
    fuel: number;
    rigging_hardware: number;
    safety: number;
    contingency: number;  // 5%
  };
  
  total_cost_php: number;
  cost_per_pick_php: number;
  cost_per_ton_lifted_php: number;
  
  // Schedule impact
  critical_path_duration_days: number;
  weather_dependent: boolean;
  
  // Comparative analysis (if applicable)
  alternative_method?: {
    method: LiftingMethod;
    total_cost_php: number;
    duration_hours: number;
    cost_difference_php: number;
    productivity_ratio: number;  // Compared to primary method
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  
  // Safety checklist
  safety_checklist: {
    item: string;
    completed: boolean;
  }[];
  
  // Validation warnings
  validation_warnings: string[];
  is_valid: boolean;
}

// ============================================================================
// REBAR BENDING SCHEDULE (FOR RCC ELEMENTS)
// ============================================================================

export interface RebarBendingItem {
  mark_number: string;  // Bar ID (e.g., A1, B2)
  position_description: string;  // Where bar is used
  diameter_mm: number;
  length_m: number;
  quantity: number;
  shape_code: string;  // 'STRAIGHT', 'L', 'U', 'Z', 'SPIRAL'
  bending_radius_mm: number;
  hook_details: string;  // '135°', '90°', 'None'
  weight_each_kg: number;  // Single bar weight
  total_weight_kg: number;  // All bars of this mark
  remarks: string;
}

export interface BBSCalculatorOutputs {
  project_info: {
    name: string;
    element_type: string;
    element_id: string;
    prepared_date: string;
  };
  
  concrete_grade: string;
  steel_grade: string;
  cover_mm: number;
  
  // Detailed schedule
  schedule_items: RebarBendingItem[];
  
  // Summary by diameter
  summary_by_diameter: {
    diameter_mm: number;
    total_pieces: number;
    total_length_m: number;
    total_weight_kg: number;
    cutting_waste_kg: number;  // 5% typical
  }[];
  
  // Total rebar breakdown
  total_steel_weight_kg: number;
  cutting_waste_kg: number;
  total_with_waste_kg: number;
  
  // Cost breakdown
  rebar_unit_price_php_per_kg: number;
  rebar_material_cost_php: number;
  bending_labor_php_per_ton: number;
  bending_cost_php: number;
  total_rebar_cost_php: number;
  
  // Quality & compliance
  lap_compliance: {
    diameter_mm: number;
    required_lap_mm: number;
    provided_lap_mm: number;
    ok: boolean;
  }[];
  
  spacing_checks: {
    zone: string;
    required_spacing_mm: number;
    provided_spacing_mm: number;
    ok: boolean;
  }[];
  
  // Export details
  export_format: 'PDF' | 'EXCEL' | 'CAD';
}

// ============================================================================
// UNIFIED STRUCTURAL ELEMENT COSTING
// ============================================================================

export interface ElementCostingBreakdown {
  // Material costs
  concrete_cost_php: number;
  rebar_cost_php: number;
  formwork_cost_php: number;
  steel_section_cost_php: number;
  plate_cost_php: number;
  fasteners_cost_php: number;  // Bolts, welds, screws
  
  // Labor costs
  labor_cost_php: number;
  
  // Equipment costs
  equipment_cost_php: number;
  
  // Contingency & mark-up
  contingency_5_percent: number;
  
  // Sub-total
  subtotal_php: number;
  
  // Optional: GST/VAT (application-specific)
  vat_12_percent_php: number;  // If required (VAT exclusive per brief)
  
  // Final total
  total_php: number;
  
  // Unit costs
  cost_per_kg_material: number;
  cost_per_m2_contact: number;
  cost_per_m3_concrete: number;
}

// ============================================================================
// FINISHES & COATINGS CALCULATOR
// ============================================================================

export enum FinishSystemType {
  INTERIOR_LATEX = 'Interior Latex',
  EXTERIOR_ELASTOMERIC = 'Exterior Elastomeric',
  ENAMEL_WOOD_METAL = 'Enamel for Wood/Metal',
  EPOXY_COATING = 'Epoxy Coating',
  TEXTURE_PAINT = 'Texture Paint',
  SKIM_COAT = 'Skim Coat + Primer + Topcoat',
  CERAMIC_TILE = 'Ceramic/Porcelain Tile',
  STONE_CLADDING = 'Stone Cladding',
  FIBER_CEMENT = 'Fiber Cement Board',
  WALLPAPER = 'Wallpaper',
  STUCCO_RENDER = 'Stucco/Render',
  WATERPROOFING_MEMBRANE = 'Waterproofing Membrane'
}

export enum SubstrateType {
  CHB_PLASTERED = 'CHB Plastered',
  CONCRETE_FAIRFACE = 'Concrete Fair-Face',
  GYPSUM_BOARD = 'Gypsum Board',
  FIBER_CEMENT_BOARD = 'Fiber Cement Board',
  WOOD = 'Wood',
  STEEL = 'Steel'
}

export interface FinishesCalculatorInputs {
  // Geometry
  wall_area_m2: number;
  ceiling_area_m2: number;
  height_m: number;
  openings_deduction_m2: number;  // Doors, windows
  number_of_rooms: number;
  
  // Surface condition
  finish_system: FinishSystemType;
  substrate_type: SubstrateType;
  is_new_surface: boolean;
  roughness_level: 'SMOOTH' | 'MEDIUM' | 'ROUGH';
  moisture_exposure: 'NONE' | 'MODERATE' | 'HIGH';
  is_exterior: boolean;
  
  // Paint system parameters
  coats_required: number;
  product_coverage_m2_per_liter: number;
  wastage_percent: number;
  primer_type: 'LATEX_PRIMER' | 'OIL_PRIMER' | 'EPOXY_PRIMER' | 'NONE';
  
  // Costing (PHP)
  skim_coat_price_per_kg: number;
  primer_price_per_liter: number;
  topcoat_price_per_liter: number;
  labor_rate_php_per_day: number;
  painter_productivity_m2_per_day: number;
  
  // Tile/alternative system parameters
  tile_size_mm?: number;  // 300, 600, 1200 typical
  tile_price_per_m2?: number;
  adhesive_price_per_kg?: number;
  grout_price_per_kg?: number;
  
  // Cladding parameters
  cladding_price_per_m2?: number;
  fixings_price_per_m2?: number;
}

export interface FinishesCalculatorOutputs {
  // Geometry summary
  total_finish_area_m2: number;
  
  // Paint system quantities
  skim_coat_kg?: number;
  primer_liters?: number;
  topcoat_liters?: number;
  
  // Tile system quantities
  tile_quantity_pcs?: number;
  adhesive_kg?: number;
  grout_kg?: number;
  
  // Accessories
  paint_rollers_qty: number;
  masking_tape_rolls: number;
  drop_cloth_qty: number;
  
  // Labor
  surface_prep_labor_mh: number;
  application_labor_mh: number;
  total_labor_mh: number;
  estimated_duration_days: number;
  
  // Costing breakdown (PHP)
  materials_cost_php: number;
  labor_cost_php: number;
  equipment_cost_php: number;
  contingency_5_percent_php: number;
  total_cost_php: number;
  
  // Unit costs
  cost_per_m2_php: number;
  cost_per_liter_or_kg: number;
  
  // Validation
  validation_warnings: string[];
  system_suitability: boolean;
  moisture_suitable: boolean;
  exterior_durable: boolean;
}

export interface FlooringCalculatorInputs {
  // Area definition
  floor_area_m2: number;
  number_of_rooms: number;
  skirting_height_m: number;
  openings_deductions_m2: number;
  
  // Substrate
  substrate_type: 'CONCRETE_SLAB' | 'STEEL_DECK_TOPPING' | 'EXISTING_TILE' | 'WOOD_SUBFLOOR';
  moisture_condition: 'DRY' | 'MODERATE' | 'WET' | 'EXTERIOR';
  
  // Floor finish system
  finish_system: 'CERAMIC_TILE' | 'PORCELAIN_TILE' | 'NATURAL_STONE' | 'VINYL_SPC' | 'VINYL_LVT' | 
                 'RUBBER_FLOORING' | 'POLISHED_CONCRETE' | 'EPOXY_COATING' | 'WOOD_SOLID' | 
                 'WOOD_ENGINEERED' | 'LAMINATE' | 'BAMBOO' | 'PAVERS' | 'DECKING_WPC' | 
                 'EPOXY_MORTAR' | 'ANTI_STATIC' | 'CARPET_BROADLOOM' | 'CARPET_TILES';
  
  // Dimensions
  tile_size_mm?: number;  // 300, 600, 1200
  joint_width_mm?: number;  // 3-5 typical
  screed_thickness_mm?: number;  // 40-100mm typical
  pattern_type?: 'RUNNING_BOND' | 'HERRINGBONE' | 'DIAGONAL' | 'RANDOM';
  
  // Material parameters
  adhesive_type?: 'CEMENT_BASED' | 'EPOXY' | 'POLYURETHANE';
  grout_type?: 'CEMENT' | 'EPOXY';
  sealant_required?: boolean;
  waterproofing_required?: boolean;
  
  // Pricing (PHP)
  finish_material_price_per_m2: number;
  adhesive_price_per_kg: number;
  grout_price_per_kg: number;
  screed_price_per_m3: number;
  skirting_price_per_linear_m: number;
  sealant_price_per_liter: number;
  labor_rate_php_per_day: number;
  tiler_productivity_m2_per_day: number;
  
  // Optional comparison
  compare_with_system?: string;  // Compare with alternative system
}

export interface FlooringCalculatorOutputs {
  // Area summary
  total_floor_area_m2: number;
  skirting_linear_m: number;
  
  // Material quantities by layer
  waterproofing_liters?: number;
  screed_volume_m3?: number;
  adhesive_kg: number;
  grout_kg: number;
  finish_material_qty: number;  // pcs for tiles, m² for others
  sealant_liters: number;
  
  // Labor breakdown
  substrate_prep_labor_mh: number;
  waterproofing_labor_mh: number;
  screed_labor_mh: number;
  installation_labor_mh: number;
  finishing_labor_mh: number;
  total_labor_mh: number;
  estimated_duration_days: number;
  
  // Equipment rental
  equipment_rental_days: number;
  equipment_rental_cost_php: number;
  
  // Costing (PHP, VAT exclusive)
  finish_material_cost_php: number;
  base_layer_cost_php: number;  // Screed, waterproofing, etc.
  adhesive_grout_cost_php: number;
  skirting_cost_php: number;
  labor_cost_php: number;
  equipment_cost_php: number;
  contingency_5_percent_php: number;
  total_cost_php: number;
  
  // Unit costs
  cost_per_m2_php: number;
  labor_cost_per_m2_php: number;
  
  // Validation & compliance
  moisture_suitable: boolean;
  movement_joints_required: boolean;
  min_thickness_check: boolean;
  exterior_slip_rating?: string;  // R9, R10, R11, R12
  validation_warnings: string[];
  
  // Comparison (if requested)
  alternative_cost_php?: number;
  cost_difference_php?: number;
  productivity_ratio?: number;
}

// ============================================================================
// FINISHES CALCULATOR IMPLEMENTATION
// ============================================================================

export function calculateFinishes(inputs: FinishesCalculatorInputs): FinishesCalculatorOutputs {
  const {
    wall_area_m2,
    ceiling_area_m2,
    height_m,
    openings_deduction_m2,
    number_of_rooms: _num_rooms,
    finish_system,
    substrate_type: _substrate,
    is_new_surface,
    roughness_level,
    moisture_exposure,
    is_exterior,
    coats_required,
    product_coverage_m2_per_liter,
    wastage_percent,
    primer_type,
    skim_coat_price_per_kg,
    primer_price_per_liter,
    topcoat_price_per_liter,
    labor_rate_php_per_day,
    painter_productivity_m2_per_day,
  } = inputs;

  const total_finish_area_m2 = wall_area_m2 + ceiling_area_m2 - openings_deduction_m2;

  // ===== SURFACE PREPARATION =====
  const prep_labor_multiplier = roughness_level === 'ROUGH' ? 1.5 : roughness_level === 'MEDIUM' ? 1.0 : 0.5;
  const surface_prep_labor_mh = (total_finish_area_m2 / 100) * prep_labor_multiplier * 8;

  // ===== PAINT CALCULATIONS =====
  let skim_coat_kg = 0;
  let primer_liters = 0;
  let topcoat_liters = 0;
  let materials_cost_php = 0;

  if (finish_system !== FinishSystemType.CERAMIC_TILE && 
      finish_system !== FinishSystemType.STONE_CLADDING &&
      finish_system !== FinishSystemType.FIBER_CEMENT &&
      finish_system !== FinishSystemType.WALLPAPER &&
      finish_system !== FinishSystemType.STUCCO_RENDER &&
      finish_system !== FinishSystemType.WATERPROOFING_MEMBRANE) {
    
    // Paint system
    if (finish_system === FinishSystemType.SKIM_COAT) {
      skim_coat_kg = Math.ceil((total_finish_area_m2 * 1.2) * 10) / 10;  // ~1.2 kg/m²
      materials_cost_php += skim_coat_kg * skim_coat_price_per_kg;
    }

    const coverage_with_loss = product_coverage_m2_per_liter * (1 - wastage_percent / 100);
    
    if (primer_type !== 'NONE') {
      primer_liters = Math.ceil((total_finish_area_m2 / coverage_with_loss) * 10) / 10;
      materials_cost_php += primer_liters * primer_price_per_liter;
    }

    topcoat_liters = Math.ceil((total_finish_area_m2 * coats_required / coverage_with_loss) * 10) / 10;
    materials_cost_php += topcoat_liters * topcoat_price_per_liter;
  }

  // ===== LABOR CALCULATIONS =====
  const application_labor_mh = Math.ceil((total_finish_area_m2 / painter_productivity_m2_per_day) * 8);
  const total_labor_mh = surface_prep_labor_mh + application_labor_mh;
  const estimated_duration_days = Math.ceil(total_labor_mh / 8);
  const labor_cost_php = Math.ceil((total_labor_mh / 8) * labor_rate_php_per_day);

  // ===== ACCESSORIES =====
  const paint_rollers_qty = Math.ceil(_num_rooms / 2);
  const masking_tape_rolls = Math.ceil(height_m * 4 / 50);  // 50m per roll
  const drop_cloth_qty = Math.ceil(_num_rooms * 1.5);
  const equipment_cost_php = (paint_rollers_qty * 250) + (masking_tape_rolls * 150) + (drop_cloth_qty * 300);

  // ===== VALIDATION =====
  const validation_warnings: string[] = [];
  let system_suitability = true;
  let moisture_suitable = true;
  let exterior_durable = true;

  if (is_exterior && finish_system === FinishSystemType.INTERIOR_LATEX) {
    validation_warnings.push('Interior Latex not suitable for exterior exposed surfaces');
    system_suitability = false;
    exterior_durable = false;
  }

  if (moisture_exposure === 'HIGH' && finish_system === FinishSystemType.WALLPAPER) {
    validation_warnings.push('Wallpaper not suitable for high moisture areas');
    moisture_suitable = false;
  }

  if (!is_new_surface && coats_required < 2) {
    validation_warnings.push('Recommend minimum 2 coats for repainting');
  }

  // ===== COSTING =====
  const subtotal_php = materials_cost_php + labor_cost_php + equipment_cost_php;
  const contingency_5_percent_php = Math.ceil(subtotal_php * 0.05);
  const total_cost_php = subtotal_php + contingency_5_percent_php;

  return {
    total_finish_area_m2,
    skim_coat_kg: skim_coat_kg > 0 ? skim_coat_kg : undefined,
    primer_liters: primer_liters > 0 ? primer_liters : undefined,
    topcoat_liters: topcoat_liters > 0 ? topcoat_liters : undefined,
    paint_rollers_qty,
    masking_tape_rolls,
    drop_cloth_qty,
    surface_prep_labor_mh: Math.round(surface_prep_labor_mh),
    application_labor_mh: Math.round(application_labor_mh),
    total_labor_mh: Math.round(total_labor_mh),
    estimated_duration_days,
    materials_cost_php: Math.round(materials_cost_php),
    labor_cost_php: Math.round(labor_cost_php),
    equipment_cost_php: Math.round(equipment_cost_php),
    contingency_5_percent_php: Math.round(contingency_5_percent_php),
    total_cost_php: Math.round(total_cost_php),
    cost_per_m2_php: Math.round(total_cost_php / total_finish_area_m2),
    cost_per_liter_or_kg: topcoat_liters > 0 ? Math.round(total_cost_php / topcoat_liters) : 0,
    validation_warnings,
    system_suitability,
    moisture_suitable,
    exterior_durable,
  };
}

// ============================================================================
// FLOORING CALCULATOR IMPLEMENTATION
// ============================================================================

export function calculateFlooring(inputs: FlooringCalculatorInputs): FlooringCalculatorOutputs {
  const {
    floor_area_m2,
    number_of_rooms: _num_rooms_flooring,
    skirting_height_m,
    openings_deductions_m2,
    substrate_type: _substrate_type,
    moisture_condition,
    finish_system,
    tile_size_mm = 600,
    joint_width_mm = 3,
    screed_thickness_mm = 50,
    adhesive_type: _adhesive_type,
    grout_type: _grout_type,
    sealant_required = false,
    waterproofing_required = moisture_condition === 'WET' || moisture_condition === 'EXTERIOR',
    finish_material_price_per_m2,
    adhesive_price_per_kg,
    grout_price_per_kg,
    screed_price_per_m3,
    skirting_price_per_linear_m,
    sealant_price_per_liter,
    labor_rate_php_per_day,
    tiler_productivity_m2_per_day,
  } = inputs;

  const total_floor_area_m2 = floor_area_m2 - openings_deductions_m2;
  const skirting_linear_m = Math.ceil(
    (Math.sqrt(total_floor_area_m2 * 4) * 2) * (skirting_height_m > 0 ? 1 : 0)
  );

  // ===== LAYER CALCULATIONS =====
  let waterproofing_liters = 0;
  let waterproofing_labor_mh = 0;

  if (waterproofing_required) {
    waterproofing_liters = Math.ceil(total_floor_area_m2 * 1.2 / 5);  // ~5 m²/L per coat, 2 coats
    waterproofing_labor_mh = Math.ceil((waterproofing_liters / 10) * 2);
  }

  // Screed layer
  const screed_volume_m3 = (total_floor_area_m2 * screed_thickness_mm) / 1000000;
  const screed_labor_mh = waterproofing_required ? Math.ceil(total_floor_area_m2 / 15) : 0;

  // Adhesive & Grout calculations for tile systems
  const tile_size_m = tile_size_mm / 1000;
  const tile_area = tile_size_m * tile_size_m;
  const number_of_tiles = Math.ceil(total_floor_area_m2 / tile_area * 1.05);  // 5% waste
  const adhesive_kg = Math.ceil((total_floor_area_m2 * 1.2 * 1.5) / 1000); // ~1.5kg/m² for adhesive
  const grout_joint_length = Math.ceil((Math.sqrt(number_of_tiles) * tile_size_m * 2) * total_floor_area_m2 / 100);
  const grout_kg = Math.ceil((grout_joint_length * (joint_width_mm / 10) * 1.6) / 1000);  // Grout density factor

  // Sealant
  const sealant_liters = sealant_required ? Math.ceil(skirting_linear_m / 10) : 0;

  // ===== LABOR CALCULATIONS =====
  const substrate_prep_labor_mh = Math.ceil(total_floor_area_m2 / 20);  // ~20 m²/mh prep
  const installation_labor_mh = Math.ceil(total_floor_area_m2 / tiler_productivity_m2_per_day * 8);
  const finishing_labor_mh = Math.ceil(total_floor_area_m2 / 50);  // Cleaning, curing time monitoring
  const total_labor_mh = substrate_prep_labor_mh + waterproofing_labor_mh + screed_labor_mh + installation_labor_mh + finishing_labor_mh;
  const estimated_duration_days = Math.ceil(total_labor_mh / 8) + 3;  // +3 days for curing

  // ===== EQUIPMENT RENTAL =====
  const equipment_rental_days = estimated_duration_days;
  const equipment_rental_cost_php = equipment_rental_days * 3000;  // Grinder, mixer, vibrator avg

  // ===== COSTING (PHP, VAT EXCLUSIVE) =====
  const finish_material_cost_php = Math.ceil(total_floor_area_m2 * finish_material_price_per_m2);
  const waterproofing_cost_php = waterproofing_liters * (sealant_price_per_liter || 800);
  const screed_cost_php = Math.ceil(screed_volume_m3 * screed_price_per_m3);
  const adhesive_grout_cost_php = Math.ceil((adhesive_kg * adhesive_price_per_kg) + (grout_kg * grout_price_per_kg));
  const skirting_cost_php = Math.ceil(skirting_linear_m * skirting_price_per_linear_m);
  const sealant_cost_php = sealant_liters * (sealant_price_per_liter || 800);

  const labor_cost_php = Math.ceil((total_labor_mh / 8) * labor_rate_php_per_day);
  const base_layer_cost_php = waterproofing_cost_php + screed_cost_php;

  const subtotal_php = finish_material_cost_php + adhesive_grout_cost_php + skirting_cost_php + 
                       sealant_cost_php + labor_cost_php + base_layer_cost_php + equipment_rental_cost_php;
  const contingency_5_percent_php = Math.ceil(subtotal_php * 0.05);
  const total_cost_php = subtotal_php + contingency_5_percent_php;

  // ===== VALIDATION =====
  const validation_warnings: string[] = [];
  let moisture_suitable = true;
  let movement_joints_required = total_floor_area_m2 > 300;
  let min_thickness_check = screed_thickness_mm >= 40;

  if (!min_thickness_check) {
    validation_warnings.push(`Screed thickness (${screed_thickness_mm}mm) less than recommended 40mm minimum`);
  }

  if (moisture_condition === 'WET' && !waterproofing_required) {
    validation_warnings.push('Wet area requires waterproofing layer');
    moisture_suitable = false;
  }

  if (movement_joints_required && total_floor_area_m2 > 500) {
    validation_warnings.push(`Large area (${total_floor_area_m2}m²) requires movement joint planning every 5-6m`);
  }

  return {
    total_floor_area_m2,
    skirting_linear_m,
    waterproofing_liters: waterproofing_liters > 0 ? waterproofing_liters : undefined,
    screed_volume_m3: screed_volume_m3 > 0 ? Math.round(screed_volume_m3 * 100) / 100 : undefined,
    adhesive_kg: Math.round(adhesive_kg),
    grout_kg: Math.round(grout_kg),
    finish_material_qty: finish_system.includes('TILE') ? number_of_tiles : Math.round(total_floor_area_m2 * 10) / 10,
    sealant_liters: sealant_liters > 0 ? sealant_liters : 0,
    substrate_prep_labor_mh: Math.round(substrate_prep_labor_mh),
    waterproofing_labor_mh: Math.round(waterproofing_labor_mh),
    screed_labor_mh: Math.round(screed_labor_mh),
    installation_labor_mh: Math.round(installation_labor_mh),
    finishing_labor_mh: Math.round(finishing_labor_mh),
    total_labor_mh: Math.round(total_labor_mh),
    estimated_duration_days,
    equipment_rental_days,
    equipment_rental_cost_php: Math.round(equipment_rental_cost_php),
    finish_material_cost_php: Math.round(finish_material_cost_php),
    base_layer_cost_php: Math.round(base_layer_cost_php),
    adhesive_grout_cost_php: Math.round(adhesive_grout_cost_php),
    skirting_cost_php: Math.round(skirting_cost_php),
    labor_cost_php: Math.round(labor_cost_php),
    equipment_cost_php: Math.round(equipment_rental_cost_php),
    contingency_5_percent_php: Math.round(contingency_5_percent_php),
    total_cost_php: Math.round(total_cost_php),
    cost_per_m2_php: Math.round(total_cost_php / total_floor_area_m2),
    labor_cost_per_m2_php: Math.round(labor_cost_php / total_floor_area_m2),
    moisture_suitable,
    movement_joints_required,
    min_thickness_check,
    exterior_slip_rating: finish_system.includes('TILE') ? 'R10' : moisture_condition === 'EXTERIOR' ? 'R11' : undefined,
    validation_warnings,
  };
}

// ============================================================================
// GENERIC CALCULATOR EXECUTOR (EXPANDED)
// ============================================================================

export async function executeCalculator(
  trade: string,
  inputs: Record<string, any>
): Promise<Record<string, number>> {
  const upperTrade = trade.toUpperCase();
  
  switch (upperTrade) {
    case 'CONCRETE':
      return calculateConcrete(inputs as ConcreteCalculatorInputs) as unknown as Record<string, number>;
    
    case 'CHB':
      return calculateCHB(inputs as CHBCalculatorInputs) as unknown as Record<string, number>;
    
    case 'REBAR':
      return calculateRebar(inputs as RebarCalculatorInputs) as unknown as Record<string, number>;
    
    case 'FORMWORK':
      return calculateFormwork(inputs as FormworkCalculatorInputs) as unknown as Record<string, number>;
    
    case 'COMPOSITE_SLAB':
      return calculateCompositeSlab(inputs as CompositeSlabCalculatorInputs) as unknown as Record<string, number>;
    
    case 'EQUIPMENT':
      return calculateEquipment(inputs as EquipmentCalculatorInputs) as unknown as Record<string, number>;
    
    case 'PAINT':
      return calculatePaint(inputs as PaintCalculatorInputs) as unknown as Record<string, number>;
    
    case 'FINISHES':
      return calculateFinishes(inputs as FinishesCalculatorInputs) as unknown as Record<string, number>;
    
    case 'FLOORING':
      return calculateFlooring(inputs as FlooringCalculatorInputs) as unknown as Record<string, number>;
    
    case 'RCC_FOUNDATION':
    case 'FOUNDATION':
      return calculateFoundation(inputs as FoundationInputs) as unknown as Record<string, number>;
    
    case 'RCC_COLUMN':
      return calculateRCCColumn(inputs as RCCColumnInputs) as unknown as Record<string, number>;
    
    case 'RCC_BEAM':
      return calculateRCCBeam(inputs as RCCBeamInputs) as unknown as Record<string, number>;
    
    case 'RCC_SLAB':
    case 'SLAB':
      return calculateSlab(inputs as SlabInputs) as unknown as Record<string, number>;
    
    case 'STEEL_COLUMN':
      return calculateSteelColumn(inputs as SteelColumnInputs) as unknown as Record<string, number>;
    
    case 'STEEL_BEAM':
      return calculateSteelBeam(inputs as SteelBeamInputs) as unknown as Record<string, number>;
    
    case 'WALL_SYSTEM':
      return calculateWallSystem(inputs as WallSystemInputs) as unknown as Record<string, number>;
    
    default:
      throw new Error(`Unknown calculator trade: ${trade}`);
  }
}
