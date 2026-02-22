# Wall System Calculator - Integration Guide

## Overview
The **Wall System Calculator** is an enhanced multi-system partition/wall comparison tool supporting 5 wall technologies with full cost, labor, time, and performance analysis.

## Supported Wall Systems (5 Types)

### 1. **Concrete Hollow Block (CHB)** 
- Block sizes: 100mm (4"), 150mm (6"), 200mm (8")
- Optional reinforcement bands
- Mortar options (Class A, B)
- Installation: 12 m²/day
- Labor: 3-4 workers

### 2. **AAC (Autoclaved Aerated Concrete)**
- Lightweight blocks: 75-200mm
- Adhesive-based installation (faster than mortar)
- Superior thermal properties (R = 0.30-0.80)
- Installation: 15 m²/day (fastest)
- Labor: 3 workers

### 3. **Precast Concrete Panels**
- Large format panels (3m x 2.4m)
- Thickness: 150-250mm
- Structural load-bearing capability
- Requires crane for installation
- Installation: 8 m²/day
- Labor: 5 workers + crane operator

### 4. **Drywall/Fiber Cement Partitions**
- Lightweight framing with gypsum/fiber cement sheets
- Single or double layer options
- Stud spacing: 400mm or 600mm
- Installation: 20-25 m²/day (fastest frame)
- Labor: 2 workers

### 5. **EPS Sandwich Panels**
- Core thickness: 50-150mm
- Superior insulation (R = 1.25-3.75)
- With/without mesh reinforcement
- Installation: 10 m²/day
- Labor: 2 workers

## Usage

### Import
```typescript
import { WallSystemCalculatorModal } from '@/components/modals/TradeCalculatorModals';
import { calculateWallSystem, WallSystemInputs, WallSystemOutputs } from '@/services/calculatorService';
```

### Basic Implementation
```tsx
const [wallCalcOpen, setWallCalcOpen] = useState(false);

<WallSystemCalculatorModal
  open={wallCalcOpen}
  onClose={() => setWallCalcOpen(false)}
  onApply={(results: WallSystemOutputs) => {
    // Apply results to BOQ item
    console.log(`Selected: ${results.wall_type.toUpperCase()}`);
    console.log(`Unit Cost: ₱${results.unit_cost}/m²`);
    console.log(`Total Cost: ₱${results.total_cost}`);
  }}
/>
```

### Direct Calculation (No UI)
```typescript
const inputs: WallSystemInputs = {
  area_m2: 100,
  height_m: 3,
  wall_type: 'chb',
  opening_area_m2: 5,
  location: 'interior',
  finish_type: 'plaster',
  labor_daily_rate: 1200,
  chb_thickness: '100',
  chb_with_reinforcement: true,
};

const results = calculateWallSystem(inputs);
console.log(`Cost per m²: ₱${results.unit_cost}`);
console.log(`Total Cost: ₱${results.total_cost}`);
console.log(`Duration: ${results.estimated_days} days`);
```

## Input Parameters

### Core Inputs (All Systems)
- **area_m2**: Gross wall area
- **height_m**: Wall height (for reference)
- **wall_type**: 'chb' | 'aac' | 'precast' | 'drywall' | 'eps'
- **opening_area_m2**: Door/window deductions
- **location**: 'interior' | 'exterior'
- **finish_type**: Type of finish (plaster, paint, etc.)
- **labor_daily_rate**: Local labor rate in ₱/day (NCR baseline: 1,200-1,500)

### System-Specific Inputs

#### CHB
- `chb_thickness`: '100' | '150' | '200'
- `chb_with_reinforcement`: boolean (adds steel bands)
- `mortar_type`: 'Class A' | 'Class B'

#### AAC
- `aac_thickness`: '75' | '100' | '150' | '200'
- `aac_adhesive_type`: 'Standard' | 'Thin-bed'

#### Precast
- `precast_thickness`: '150' | '200' | '250'
- `precast_joint_type`: 'Mortar' | 'Sealant'

#### Drywall
- `drywall_stud_spacing`: '400' | '600'
- `drywall_layers`: 1 | 2

#### EPS
- `eps_core_thickness`: '50' | '75' | '100' | '150'
- `eps_with_mesh`: boolean (adds fiberglass mesh)

## Output Structure

### WallSystemOutputs
```typescript
{
  wall_type: WallSystemType;
  net_area_m2: number;
  
  // Materials
  materials: WallMaterial[]; // Itemized BOM
  materials_cost: number;
  
  // Labor
  labor_breakdown: WallLaborBreakdown[];
  labor_cost: number;
  
  // Time & Productivity
  productivity_m2_per_day: number;
  estimated_days: number;
  crew_size: number;
  
  // Costs
  unit_cost: number; // ₱/m²
  total_cost: number; // ₱ (exclusive VAT)
  cost_breakdown: {
    materials: number;
    labor: number;
  };
  
  // Performance Metrics
  performance: {
    weight_kg_m2: number;
    thermal_resistance_r: number;
    acoustic_index_db: number;
    fire_rating: string; // 'Class A', 'Class B'
    moisture_resistance: string;
  };
}
```

## Cost Baseline (NCR 2026)

### Materials Pricing
- CHB 100mm: ₱55/pc, 150mm: ₱80/pc, 200mm: ₱110/pc
- AAC 100mm: ₱220/block, 150mm: ₱350/block
- Precast: ₱3,500-5,000/panel (3x2.4m)
- Drywall: ₱350/sheet (4'x8')
- EPS: ₱4,500-8,500/panel (varies by core thickness)
- Cement: ₱350/bag, Sand: ₱550/m³, Plaster: ₱650/bag

### Labor (NCR Baseline)
- Daily Rate: ₱1,200-1,500
- Crane Rental: ₱8,000/day
- Productivity: 8-20 m²/day (system-dependent)

## Modal UI Features

### Single System Mode
- System selector dropdown
- Project input panel (area, height, openings, etc.)
- Real-time cost summary
- Bill of materials (itemized)
- Labor breakdown & schedule
- Performance characteristics
- Apply to BOQ button

### Comparison Mode
- All 5 systems analyzed simultaneously
- Cost cards showing side-by-side unit costs
- Performance comparison table
- Duration comparison
- Weight, thermal, acoustic, fire rating metrics
- Cost per m², total cost, installation time

## Integration Points

### BOQ Editor
```tsx
// Import and instantiate modal
const [wallCalcOpen, setWallCalcOpen] = useState(false);

// In BOQ Item row:
<Button 
  onClick={() => setWallCalcOpen(true)}
  size="sm"
  variant="outline"
>
  Calculate Wall
</Button>

// Handle results:
onApply={(results) => {
  // Update BOQ item unit_price
  updateItem(index, 'unit_price', results.unit_cost);
  // Store performance data in remarks
  updateItem(index, 'remarks', `${results.wall_type.toUpperCase()} - ${results.estimated_days}d, ${results.crew_size} crew`);
}}
```

### Estimate Detail Page
```tsx
// Add calculator button near wall items
<Button 
  onClick={() => setWallCalcOpen(true)}
  variant="outline"
  size="sm"
  className="gap-2"
>
  <Calculator className="w-4 h-4" />
  Wall System
</Button>
```

## Performance Comparison Examples

### 100m² Interior Wall (3m height, 5m² openings)
**Net Area: 95 m²**

| Metric | CHB (100mm) | AAC (100mm) | Precast | Drywall | EPS (100mm) |
|--------|-------------|------------|---------|---------|------------|
| **Unit Cost** | ₱1,850/m² | ₱1,920/m² | ₱3,200/m² | ₱850/m² | ₱2,100/m² |
| **Total Cost** | ₱175,750 | ₱182,400 | ₱304,000 | ₱80,750 | ₱199,500 |
| **Duration** | 11 days | 8 days | 12 days | 6 days | 11 days |
| **Weight** | 1,200 kg/m² | 650 kg/m² | 2,475 kg/m² | 300 kg/m² | 1,520 kg/m² |
| **R-Value** | 0.18 | 0.40 | 0.20 | 0.10 | 2.50 |
| **Acoustic (dB)** | 46 | 45 | 50 | 32 | 45 |
| **Fire Rating** | Class A | Class A | Class A | Class B | Class B |

## Typical Use Cases

1. **Quick Cost Estimate**: User inputs area → Compare all systems → Select best option
2. **Bid Comparison**: Calculate material + labor for competing systems
3. **Performance Selection**: Filter by thermal/acoustic requirements first
4. **Duration Planning**: Select system that meets project timeline
5. **Material Procurement**: Export BOM to supplier for quotes

## Philippine Construction Context

✅ Baseline pricing (NCR 2026)
✅ Local material availability
✅ Common labor practices (mandays, crew composition)
✅ standard fire ratings (Class A construction typical)
✅ Humidity/tropical climate performance
✅ Currency in Philippine Pesos (₱)

## Future Enhancements

- [ ] Regional pricing adjustment (not just NCR)
- [ ] Material supplier integration
- [ ] Export to PDF/Excel (BOM + cost breakdown)
- [ ] Save configurations to assembly templates
- [ ] Multi-story building automation
- [ ] Integration with project scheduling
- [ ] Real-time material price API
