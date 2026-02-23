import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileDown,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { estimateService } from '@/services/estimateService';
import { assemblyService } from '@/services/assemblyService';
import { formatCurrency } from '@/lib/currency';
import {
  ConcreteCalculatorModal,
  WallSystemCalculatorModal,
  RebarBBSCalculatorModal,
  FormworkCalculatorModal,
  PaintCalculatorModal,
  FinishesCalculatorModal,
  FlooringCalculatorModal,
} from '@/components/modals/TradeCalculatorModals';
import {
  StructuralCalculatorModal,
} from '@/components/modals/StructuralElementCalculatorModals';
import { boqTemplateItems } from '@/data/boqTemplate';

type EnhancedBOQEditorPageProps = {
  embedded?: boolean;
  onSaved?: () => void;
};

export default function EnhancedBOQEditorPage({ embedded = false, onSaved }: EnhancedBOQEditorPageProps) {
  const { id, projectId } = useParams<{ id: string; projectId?: string }>();
  const navigate = useNavigate();

  const [estimate, setEstimate] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calculator modals
  const [showConcreteCalc, setShowConcreteCalc] = useState(false);
  const [showWallSystemCalc, setShowWallSystemCalc] = useState(false);
  const [showRebarCalc, setShowRebarCalc] = useState(false);
  const [showFormworkCalc, setShowFormworkCalc] = useState(false);
  const [showPaintCalc, setShowPaintCalc] = useState(false);
  const [showFinishesCalc, setShowFinishesCalc] = useState(false);
  const [showFlooringCalc, setShowFlooringCalc] = useState(false);
  const [showStructuralCalc, setShowStructuralCalc] = useState(false);

  // Cross-calculator linking (for future enhancements)
  // const [lastBeamSpacing, setLastBeamSpacing] = useState<number | undefined>(undefined);

  // Sections
  const SECTIONS = [
    'ITEM I. GENERAL REQUIREMENTS',
    'ITEM II. SITE WORKS',
    'ITEM III. CIVIL/ STRUCTURAL WORKS',
    'ITEM IV. ARCHITECTURAL WORKS',
    'ITEM V. SANITARY/ PLUMBING WORKS',
    'ITEM VI. ELECTRICAL WORKS',
    'ITEM VII. UTILITY AND ANCILLARY WORKS',
    'ITEM VIII. MECHANICAL / HVAC WORKS',
  ];

  const LEGACY_SECTION_MAP: Record<string, string> = {
    'PART A. GENERAL REQUIREMENTS': 'ITEM I. GENERAL REQUIREMENTS',
    'PART B. TEMPORARY FACILITIES': 'ITEM I. GENERAL REQUIREMENTS',
    'PART C. SITE WORKS': 'ITEM II. SITE WORKS',
    'PART D. EARTHWORKS & CONCRETE': 'ITEM III. CIVIL/ STRUCTURAL WORKS',
    'PART E. MASONRY WORKS': 'ITEM III. CIVIL/ STRUCTURAL WORKS',
    'PART F. REBAR & STRUCTURAL': 'ITEM III. CIVIL/ STRUCTURAL WORKS',
    'PART G. FORMWORK': 'ITEM III. CIVIL/ STRUCTURAL WORKS',
    'PART H. FINISHING WORKS': 'ITEM IV. ARCHITECTURAL WORKS',
    'PART I. MEP WORKS': 'ITEM V. SANITARY/ PLUMBING WORKS',
    'PART J. MISCELLANEOUS': 'ITEM VII. UTILITY AND ANCILLARY WORKS',
    'PART K. OTHER WORKS': 'ITEM VII. UTILITY AND ANCILLARY WORKS',
  };

  const normalizeSection = (section?: string | null) => {
    if (!section) return 'ITEM I. GENERAL REQUIREMENTS';
    if (SECTIONS.includes(section)) return section;
    return LEGACY_SECTION_MAP[section] || 'ITEM I. GENERAL REQUIREMENTS';
  };

  const TRADE_OPTIONS = [
    'General Requirements',
    'Temporary Facilities',
    'Siteworks',
    'Earthworks',
    'Concrete',
    'Masonry',
    'Rebar',
    'Structural Steel',
    'Formwork',
    'Carpentry',
    'Roofing',
    'Waterproofing',
    'Finishes',
    'Painting',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Fire Protection',
    'Communications',
    'Low Voltage',
    'Doors and Windows',
    'Glazing',
    'Flooring',
    'Ceiling',
    'Landscaping',
    'External Works',
    'Miscellaneous',
  ];

  const CUSTOM_TRADE_VALUE = '__custom__';

  const ITEM_I_DESCRIPTIONS = [
    'Mobilization/Demobilization',
    'Permits and Licenses',
    'Bonds',
    'As-Built Shop Drawings',
    'Billboard',
    'Clearing, Hauling and Disposal of Construction Materials and Debris',
    'Construction Safety and Health',
    'Scaffolding',
    'Temporary Electrical and Water Facilities',
    'Fencing and Security',
  ];

  const CUSTOM_ITEM_I_VALUE = '__custom_item_i__';

  const ITEM_II_DESCRIPTIONS = [
    'Demolition Works',
    'Layout and Staking',
    'Site Clearing and Preparation',
    'Excavation',
    'Backfill and Compaction',
    'Soil Treatment',
  ];

  const CUSTOM_ITEM_II_VALUE = '__custom_item_ii__';

  const ITEM_III_DESCRIPTIONS = [
    'Foundation Works - Footings (Isolated/Combined/Strip)',
    'Foundation Works - Tie Beams & Grade Beams',
    'Foundation Works - Pile / Deep Foundations',
    'Formworks - Phenolic Boards',
    'Formworks - Marine Plywood',
    'Formworks - Steel Forms & Scaffolding',
    'Formworks - Shores, Props & Accessories',
    'Reinforcement Works - Rebar (Grade 40/60/75)',
    'Reinforcement Works - Tie Wire & Spacers',
    'Reinforcement Works - Couplers & Dowels',
    'Concrete Works - 21 MPa',
    'Concrete Works - 28 MPa',
    'Concrete Works - 35 MPa',
    'Concrete Placement & Pumping',
    'Concrete Curing & Protection',
    'Structural Elements - Columns',
    'Structural Elements - Beams & Girders',
    'Structural Elements - Suspended Slabs',
    'Structural Elements - Stairs & Ramps',
    'Masonry Works - CHB (100mm)',
    'Masonry Works - CHB (150mm)',
    'Masonry Works - CHB (200mm)',
    'Steel Structures - Grade & Connections',
    'Waterproofing & Protection',
  ];

  const CUSTOM_ITEM_III_VALUE = '__custom_item_iii__';

  const ITEM_IV_DESCRIPTIONS = [
    'Masonry & Plastering - CHB Walls (100/150/200mm)',
    'Masonry & Plastering - Interior Cement Plaster',
    'Masonry & Plastering - Exterior Plaster',
    'Masonry & Plastering - Drywall & Gypsum',
    'Floor Finishes - Ceramic/Porcelain Tiles',
    'Floor Finishes - Natural Stone (Granite/Marble)',
    'Floor Finishes - Vinyl / SPC Flooring',
    'Floor Finishes - Cement Finishes (Polished/Epoxy)',
    'Ceiling Works - Gypsum Ceiling',
    'Ceiling Works - Fiber Cement Ceiling',
    'Ceiling Works - T-grid Acoustic & Cove',
    'Doors & Windows - Solid Wood Panel Doors',
    'Doors & Windows - Flush Doors & PVC',
    'Doors & Windows - Fire-rated Doors',
    'Doors & Windows - Aluminum Framed Glass',
    'Doors & Windows - Aluminum Windows (Sliding/Casement)',
    'Carpentry & Cabinets - Kitchen Cabinets',
    'Carpentry & Cabinets - Wardrobes & Closets',
    'Carpentry & Cabinets - Shelves & Countertops',
    'Painting - Interior (Putty/Primer/Latex)',
    'Painting - Exterior (Elastomeric/Waterproofing)',
    'Roofing - Long Span GI & Metal Tiles',
    'Roofing - Gutters, Flashing & Fascia',
    'Glass & Aluminum - Frameless Doors & Enclosures',
    'Glass & Aluminum - Sealants & Accessories',
    'Waterproofing - Membrane & Sealants',
    'Fixtures & Fittings - Toilet & Bath',
    'Fixtures & Fittings - Kitchen (Sink/Hood)',
    'Fixtures & Fittings - Mirrors, Signages, Grilles',
  ];

  const CUSTOM_ITEM_IV_VALUE = '__custom_item_iv__';

  const ITEM_V_DESCRIPTIONS = [
    'Water Supply - uPVC/PPR Pipes (SDR Series)',
    'Water Supply - GI Pipes Schedule 40',
    'Water Supply - Copper Tubing (Type L/M)',
    'Water Supply - HDPE Main Lines',
    'Water Supply - Fittings (Elbows/Tees/Couplings)',
    'Water Supply - Valves (Ball/Gate/Check/PRV)',
    'Water Supply - Water Meter Installation',
    'Water Supply - Tank & Booster System',
    'Water Supply - Pressure Tank & Filtration',
    'Water Supply - Backflow Preventer & Safety',
    'Sanitary/Waste - uPVC DWV & Sewer Pipes',
    'Sanitary/Waste - Vent Pipes & Cleanouts',
    'Sanitary/Waste - Floor & Trench Drains',
    'Sanitary/Waste - Grease Trap & Oil Separator',
    'Sanitary/Waste - P-traps & Bottle Traps',
    'Sanitary/Waste - Flexible Waste Hoses',
    'Sanitary/Waste - Septic Tank Piping',
    'Sanitary/Waste - Distribution Box & Leach Field',
    'Sanitary/Waste - Inspection Chambers & Vents',
    'Storm Drainage - Downspouts & Gutters',
    'Storm Drainage - Catch Basins & Area Drains',
    'Storm Drainage - Sump Pit & Submersible Pump',
    'Fixtures - Water Closet (One-piece/Two-piece)',
    'Fixtures - Bidet & Pedestal Sink',
    'Fixtures - Lavatory & Shower Set',
    'Fixtures - Bathtub & Rain Shower',
    'Fixtures - Kitchen Sink & Laundry Sink',
    'Fixtures - Faucet Mixer & Sensor Faucets',
    'Fixtures Accessories - Supply Hoses & Valves',
    'Fire Protection - Standpipes & Hose Cabinets',
    'Fire Protection - Sprinkler Heads & Alarm Valves',
    'Fire Protection - Fire Pump & Siamese Connection',
    'Installation - Roughing-in & Pressure Testing',
    'Installation - Leak Testing & Commissioning',
  ];

  const CUSTOM_ITEM_V_VALUE = '__custom_item_v__';

  const ITEM_VI_DESCRIPTIONS = [
    'Power Distribution - Service Entrance (Drop/Lateral)',
    'Power Distribution - Meter Base & Main Breaker',
    'Power Distribution - Grounding Electrode System',
    'Power Distribution - Main Distribution Panel (MDP)',
    'Power Distribution - Sub-panels & Distribution',
    'Power Distribution - Circuit Breakers (MCB/MCCB)',
    'Power Distribution - Bus Bars & Panel Schedule',
    'Power Distribution - Feeders (THHN/THWN/XLPE)',
    'Power Distribution - Conduits (uPVC/IMC/EMT/RSC)',
    'Power Distribution - Cable Trays, Pull Boxes & Glands',
    'Wiring Devices - Duplex & Weatherproof Outlets',
    'Wiring Devices - GFCI Outlets & Floor Outlets',
    'Wiring Devices - USB & Specialty Outlets',
    'Wiring Devices - Single Pole Switches',
    'Wiring Devices - 3-way & 4-way Switches',
    'Wiring Devices - Dimmer & Smart Switches',
    'Wiring Devices - Timer Switches',
    'Wiring Devices - Utility & Junction Boxes',
    'Wiring Devices - Faceplates, Knockouts & Bushings',
    'Lighting - LED Downlights',
    'Lighting - LED Panels',
    'Lighting - T5/T8 Batten Lights',
    'Lighting - Flood Lights & Bollards',
    'Lighting - Emergency Lights & Exit Signs',
    'Lighting Controls - Photocell & Motion Sensors',
    'Lighting Controls - Lighting Contactor & Dimming',
    'Lighting Controls - Smart Control System',
    'Lighting Accessories - Hanging Kits, Drivers, Diffusers',
    'Auxiliary/ELV - Telephone & Data Cabling',
    'Auxiliary/ELV - CCTV System & Cabling',
    'Auxiliary/ELV - Intercom System',
    'Auxiliary/ELV - CAT6 Cabling (Data/Network)',
    'Auxiliary/ELV - Access Control System',
    'Auxiliary/ELV - PA System',
    'Auxiliary/ELV - Fire Alarm System',
    'Grounding & Protection - Ground Rods & Wires',
    'Grounding & Protection - Exothermic Welding',
    'Grounding & Protection - Lightning Arresters',
    'Grounding & Protection - Bonding Jumpers',
    'Installation - Roughing-in & Cable Pulling',
    'Installation - Termination & Megger Testing',
    'Installation - Functional Testing & Commissioning',
  ];

  const CUSTOM_ITEM_VI_VALUE = '__custom_item_vi__';

  const ITEM_VII_DESCRIPTIONS = [
    'Water Supply Utilities - Connection to Water District',
    'Water Supply Utilities - Service Line Tapping & Meter',
    'Water Supply Utilities - Main Distribution Line',
    'Water Supply Utilities - Valve Boxes & Booster House',
    'Water Supply Utilities - Elevated Tank Foundation',
    'Water Supply Utilities - Cistern & Underground Tank',
    'Water Supply Utilities - Water Treatment System',
    'Power Utilities - Meralco/Coop Service Application',
    'Power Utilities - Primary/Secondary Pole Installation',
    'Power Utilities - Transformer Pad & Service Entrance',
    'Power Utilities - Metering Kiosk & Generator Setup',
    'Power Utilities - ATS Room',
    'Telecom Utilities - Fiber/Telephone Tapping',
    'Telecom Utilities - Handholes & Manholes',
    'Telecom Utilities - Conduit Banks & MDF Room',
    'Telecom Utilities - Data Cabinet Provision',
    'Drainage & Sewer - Connection to Public Sewer',
    'Drainage & Sewer - Storm Outfall Structure',
    'Drainage & Sewer - Catch Basins & RC Culverts',
    'Drainage & Sewer - Box Culverts & Lift Station',
    'Road & Pavements - PCC Driveway',
    'Road & Pavements - Asphalt Overlay',
    'Road & Pavements - Interlocking Pavers',
    'Road & Pavements - Wheel Stops, Markings & Speed Humps',
    'Perimeter Works - Perimeter Fence (CHB/Steel)',
    'Perimeter Works - Gate (Sliding/Swing)',
    'Perimeter Works - Guardhouse & Turnstile',
    'Landscaping - Soil Preparation & Turfing',
    'Landscaping - Planter Boxes & Irrigation Line',
    'Landscaping - Tree Planting & Hardscape',
    'External Lighting - Post Lights & Bollards',
    'External Lighting - Landscape & Solar Lights',
    'External Lighting - Conduit Trenching',
    'Temporary Facilities - Site Office & Barracks',
    'Temporary Facilities - Storage Container & Toilets',
    'Temporary Facilities - First Aid & Waste Area',
    'Temporary Utilities - Temporary Power & Water',
    'Temporary Utilities - Generator & Fuel Storage',
    'Temporary Utilities - Internet Connection',
    'Safety Provisions - Site Fencing & Signage',
    'Safety Provisions - PPE & Fire Extinguishers',
    'Safety Provisions - Traffic Management',
    'Construction Support - Scaffolding & Ramps',
    'Construction Support - Debris Chute & Roofing',
    'Construction Support - Formwork Yard',
    'Environmental - Silt Trap & Oil Separator',
    'Environmental - Sediment Control & Tree Protection',
    'Environmental - Noise & Dust Control',
    'Environmental - Water Truck',
    'Testing & Commissioning - Utility Coordination',
    'Testing & Commissioning - Pressure & CCTV Testing',
    'Testing & Commissioning - Electrical Energization',
    'Testing & Commissioning - Generator Commissioning',
    'Testing & Commissioning - As-built Surveys',
  ];

  const CUSTOM_ITEM_VII_VALUE = '__custom_item_vii__';

  const ITEM_VIII_DESCRIPTIONS = [
    'HVAC - Split AC Unit (Indoor)',
    'HVAC - Split AC Unit (Outdoor)',
    'HVAC - Window AC Unit',
    'HVAC - Packaged AC Unit',
    'HVAC - Ducted Central AC System',
    'HVAC - Ductless Mini Split System',
    'HVAC - Air Handler Installation',
    'HVAC - Condensing Unit Installation',
    'HVAC - Refrigerant Piping & Insulation',
    'HVAC - Thermostat & Controls',
    'Ventilation - Exhaust Fan (Bathroom)',
    'Ventilation - Inline Duct Fan',
    'Ventilation - Axial Fan',
    'Ventilation - Centrifugal Blower',
    'Ventilation - Kitchen Range Hood',
    'Ventilation - Ductwork & Registers',
    'Ventilation - Fresh Air Intake System',
    'Ventilation - Heat Recovery Ventilator (HRV)',
    'Mechanical - Hot Water Boiler',
    'Mechanical - Furnace System',
    'Mechanical - Heat Pump Installation',
    'Mechanical - Piping & Valves',
    'Mechanical - Radiators & Convectors',
    'Mechanical - Baseboard Heaters',
    'Mechanical - Expansion Tank & Accessories',
    'Mechanical - Insulation & Lagging',
    'Building Systems - Building Automation (BAS)',
    'Building Systems - Energy Management System',
    'Building Systems - Smart HVAC Controls',
    'Building Systems - Monitoring & Sensors',
    'Building Systems - Fire Dampers',
    'Building Systems - Smoke Dampers',
    'Building Systems - Balancing & Commissioning',
    'Maintenance - Filter Replacement',
    'Maintenance - System Testing & Certification',
    'Maintenance - As-built Documentation',
  ];

  const CUSTOM_ITEM_VIII_VALUE = '__custom_item_viii__';

  useEffect(() => {
    if (id) {
      loadEstimate();
      loadAssemblies();
    }
  }, [id]);

  const loadEstimate = async () => {
    try {
      setLoading(true);
      const data = await estimateService.getEstimate(id!);
      setEstimate(data as any);

      const boqItems = ((data as any).boq_items || []).map((item: any) => ({
        id: item.id,
        item_number: item.item_number,
        section: normalizeSection(item.section),
        trade: item.trade,
        description: item.description,
        unit: item.unit,
        qty: item.qty,
        assembly_id: item.assembly_id,
        unit_price: item.unit_price,
        markup_percent: item.markup_percent || 15,
        material_cost: item.material_cost || 0,
        labor_cost: item.labor_cost || 0,
        equipment_cost: item.equipment_cost || 0,
      }));

      if (boqItems.length === 0) {
        const templateItems = boqTemplateItems.map((item, idx) => ({
          id: `template-${Date.now()}-${idx}`,
          item_number: item.item_number,
          section: normalizeSection(item.section),
          trade: item.trade || '',
          description: item.description || '',
          unit: item.unit || 'lot',
          qty: item.qty || 1,
          assembly_id: null,
          unit_price: item.unit_price || 0,
          markup_percent: item.markup_percent ?? 15,
          material_cost: item.material_cost || 0,
          labor_cost: item.labor_cost || 0,
          equipment_cost: item.equipment_cost || 0,
        }));

        setItems(templateItems);
      } else {
        setItems(boqItems);
      }
    } catch (error) {
      console.error('Error loading estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssemblies = async () => {
    try {
      const data = await assemblyService.getAssemblies();
      setAssemblies(data);
    } catch (error) {
      console.error('Error loading assemblies:', error);
    }
  };

  const addNewItem = (section: string) => {
    const newItem = {
      id: `new-${Date.now()}`,
      item_number: String(items.length + 1),
      section: section,
      trade: section === 'ITEM I. GENERAL REQUIREMENTS' ? 'General Requirements' : '',
      description: '',
      unit: 'lot',
      qty: 1,
      assembly_id: null,
      unit_price: 0,
      markup_percent: 15,
      material_cost: 0,
      labor_cost: 0,
      equipment_cost: 0,
    };

    setItems([...items, newItem]);
  };

  const updateItem = async (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If assembly selected, auto-populate price and breakdown
    if (field === 'assembly_id' && value) {
      const assembly = assemblies.find(a => a.id === value);
      if (assembly) {
        const breakdown = await assemblyService.getAssemblyBreakdown(value);
        updated[index].unit_price = breakdown.totalCost;
        updated[index].unit = assembly.unit;
        updated[index].description = assembly.name;
        updated[index].material_cost = breakdown.materialCost;
        updated[index].labor_cost = breakdown.laborCost;
        updated[index].equipment_cost = breakdown.equipmentCost;
      }
    }

    if (
      ['material_cost', 'labor_cost', 'equipment_cost'].includes(field) &&
      !updated[index].assembly_id
    ) {
      const material = Number(updated[index].material_cost) || 0;
      const labor = Number(updated[index].labor_cost) || 0;
      const equipment = Number(updated[index].equipment_cost) || 0;
      updated[index].unit_price = material + labor + equipment;
    }

    setItems(updated);
  };

  const deleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // If projectId was in the URL but estimate doesn't have it, update estimate with project_id
      if (projectId && estimate && !estimate.project_id) {
        await estimateService.updateEstimate(id!, { project_id: projectId } as any);
      }

      // Map items to correct format
      const boqItems = items.map(item => {
        const directCost = item.qty * item.unit_price;
        const markupAmount = directCost * (item.markup_percent / 100);
        
        return {
          id: item.id.startsWith('new-') ? undefined : item.id,
          estimate_id: id,
          item_number: item.item_number,
          section: item.section,
          trade: item.trade,
          description: item.description,
          unit: item.unit,
          qty: item.qty,
          assembly_id: item.assembly_id || null,
          unit_price: item.unit_price,
          markup_percent: item.markup_percent,
          internal_amount: directCost,
          contract_amount: directCost + markupAmount,
          material_cost: item.material_cost,
          labor_cost: item.labor_cost,
          equipment_cost: item.equipment_cost,
        };
      });

      await estimateService.updateBOQItems(id!, boqItems);
      await loadEstimate(); // Reload to get saved IDs
      onSaved?.();
      alert('BOQ saved successfully!');
    } catch (error) {
      console.error('Error saving BOQ:', error);
      alert('Error saving BOQ');
    } finally {
      setSaving(false);
    }
  };


  const exportToExcel = () => {
    // Generate CSV export
    const headers = [
      'ITEM NO.',
      'SECTION',
      'TRADE',
      'DESCRIPTION',
      'QTY',
      'UNIT',
      'UNIT PRICE',
      'MATERIAL',
      'LABOR',
      'EQUIPMENT',
      'DIRECT COST',
      'MARKUP %',
      'INTERNAL AMT',
      'CONTRACT AMT',
      'PROFIT',
    ];

    const rows = items.map(item => {
      const directCost = item.qty * item.unit_price;
      const internalAmt = directCost;
      const contractAmt = directCost * (1 + item.markup_percent / 100);
      const profit = contractAmt - internalAmt;

      return [
        item.item_number,
        item.section,
        item.trade,
        item.description,
        item.qty,
        item.unit,
        item.unit_price.toFixed(2),
        item.material_cost.toFixed(2),
        item.labor_cost.toFixed(2),
        item.equipment_cost.toFixed(2),
        directCost.toFixed(2),
        item.markup_percent,
        internalAmt.toFixed(2),
        contractAmt.toFixed(2),
        profit.toFixed(2),
      ];
    });

    const csvContent = [
      estimate?.project_name || 'BOQ Export',
      `Estimate Number: ${estimate?.estimate_number || ''}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `Total Items: ${items.length}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOQ_${estimate?.estimate_number || 'export'}.csv`;
    a.click();
  };

  // Calculate totals
  const calculateTotals = () => {
    const directCost = items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);
    const internalAmount = directCost;
    const contractAmount = items.reduce((sum, item) => {
      const itemDirect = item.qty * item.unit_price;
      const itemContract = itemDirect * (1 + item.markup_percent / 100);
      return sum + itemContract;
    }, 0);
    const totalProfit = contractAmount - internalAmount;

    // OCM calculations
    const overhead = contractAmount * ((estimate?.ocm_overhead || 0) / 100);
    const contingency = contractAmount * ((estimate?.ocm_contingency || 0) / 100);
    const misc = contractAmount * ((estimate?.ocm_misc || 0) / 100);
    const profit = contractAmount * ((estimate?.ocm_profit || 0) / 100);
    const subtotalWithOCM = contractAmount + overhead + contingency + misc + profit;
    const vat = subtotalWithOCM * 0.12;
    const grandTotal = subtotalWithOCM + vat;

    return {
      directCost,
      internalAmount,
      contractAmount,
      totalProfit,
      overhead,
      contingency,
      misc,
      profit,
      vat,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  // Group by section
  const itemsBySection = items.reduce((acc, item) => {
    const section = normalizeSection(item.section);
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading BOQ...</div>
      </div>
    );
  }

  const containerClassName = embedded ? 'space-y-6' : 'p-6 space-y-6';

  const actionButtons = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setShowConcreteCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Concrete
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowWallSystemCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Wall System
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowRebarCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Rebar
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowFormworkCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Formwork
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowPaintCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Paint
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowFinishesCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Finishes
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowFlooringCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Flooring
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShowStructuralCalc(true)}>
        <Calculator className="h-4 w-4 mr-2" />
        Structural Calculator
      </Button>

      <Button variant="outline" onClick={exportToExcel}>
        <FileDown className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button onClick={saveChanges} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save BOQ'}
      </Button>
    </div>
  );

  return (
    <div className={containerClassName}>
      {/* Header */}
      {embedded ? (
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Bill of Quantities</h2>
            <p className="text-sm text-gray-500">
              {estimate?.estimate_number} - {estimate?.project_name}
            </p>
          </div>
          {actionButtons}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/estimates/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Bill of Quantities</h1>
              <p className="text-sm text-gray-500">
                {estimate?.estimate_number} - {estimate?.project_name}
              </p>
            </div>
          </div>

          {actionButtons}
        </div>
      )}

      {/* BOQ Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            BOQ Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2">
                  <th className="p-2 text-left w-12">#</th>
                  <th className="p-2 text-left w-32">Item</th>
                  <th className="p-2 text-left w-32">Trade</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right w-20">Qty</th>
                  <th className="p-2 text-left w-20">Unit</th>
                  <th className="p-2 text-right w-28">Unit Price</th>
                  <th className="p-2 text-right w-24">Material</th>
                  <th className="p-2 text-right w-24">Labor</th>
                  <th className="p-2 text-right w-24">Equip</th>
                  <th className="p-2 text-right w-20">Markup%</th>
                  <th className="p-2 text-right w-28">Direct Cost</th>
                  <th className="p-2 text-right w-28">Contract Amt</th>
                  <th className="p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section) => {
                  const sectionItems = itemsBySection[section] || [];

                  return (
                    <Fragment key={`section-${section}`}>
                      <tr className="bg-blue-100 font-semibold">
                        <td colSpan={13} className="p-2">{section}</td>
                        <td className="p-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addNewItem(section)}
                            className="h-7 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </td>
                      </tr>
                      {(sectionItems as any[]).map((item: any) => {
                        const globalIdx = items.indexOf(item);
                        const directCost = item.qty * item.unit_price;
                        const contractAmt = directCost * (1 + item.markup_percent / 100);
                        const isCustomTrade = item.trade && !TRADE_OPTIONS.includes(item.trade);
                        const tradeValue = item.trade
                          ? (isCustomTrade ? CUSTOM_TRADE_VALUE : item.trade)
                          : '';
                        const isItemI = section === 'ITEM I. GENERAL REQUIREMENTS';
                        const isItemII = section === 'ITEM II. SITE WORKS';
                        const isItemIII = section === 'ITEM III. CIVIL/ STRUCTURAL WORKS';
                        const isItemIV = section === 'ITEM IV. ARCHITECTURAL WORKS';
                        const isItemV = section === 'ITEM V. SANITARY/ PLUMBING WORKS';
                        const isItemVI = section === 'ITEM VI. ELECTRICAL WORKS';
                        const isItemVII = section === 'ITEM VII. UTILITY AND ANCILLARY WORKS';
                        const isItemVIII = section === 'ITEM VIII. MECHANICAL / HVAC WORKS';
                        
                        const isCustomItemI = item.description && !ITEM_I_DESCRIPTIONS.includes(item.description) && isItemI;
                        const itemIValue = item.description
                          ? (isCustomItemI ? CUSTOM_ITEM_I_VALUE : item.description)
                          : '';
                        const isCustomItemII = item.description && !ITEM_II_DESCRIPTIONS.includes(item.description) && isItemII;
                        const itemIIValue = item.description
                          ? (isCustomItemII ? CUSTOM_ITEM_II_VALUE : item.description)
                          : '';
                        const isCustomItemIII = item.description && !ITEM_III_DESCRIPTIONS.includes(item.description) && isItemIII;
                        const itemIIIValue = item.description
                          ? (isCustomItemIII ? CUSTOM_ITEM_III_VALUE : item.description)
                          : '';
                        const isCustomItemIV = item.description && !ITEM_IV_DESCRIPTIONS.includes(item.description) && isItemIV;
                        const itemIVValue = item.description
                          ? (isCustomItemIV ? CUSTOM_ITEM_IV_VALUE : item.description)
                          : '';
                        const isCustomItemV = item.description && !ITEM_V_DESCRIPTIONS.includes(item.description) && isItemV;
                        const itemVValue = item.description
                          ? (isCustomItemV ? CUSTOM_ITEM_V_VALUE : item.description)
                          : '';
                        const isCustomItemVI = item.description && !ITEM_VI_DESCRIPTIONS.includes(item.description) && isItemVI;
                        const itemVIValue = item.description
                          ? (isCustomItemVI ? CUSTOM_ITEM_VI_VALUE : item.description)
                          : '';
                        const isCustomItemVII = item.description && !ITEM_VII_DESCRIPTIONS.includes(item.description) && isItemVII;
                        const itemVIIValue = item.description
                          ? (isCustomItemVII ? CUSTOM_ITEM_VII_VALUE : item.description)
                          : '';
                        const isCustomItemVIII = item.description && !ITEM_VIII_DESCRIPTIONS.includes(item.description) && isItemVIII;
                        const itemVIIIValue = item.description
                          ? (isCustomItemVIII ? CUSTOM_ITEM_VIII_VALUE : item.description)
                          : '';

                        return (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <Input
                                value={item.item_number}
                                onChange={(e) => updateItem(globalIdx, 'item_number', e.target.value)}
                                className="h-7 text-xs"
                              />
                            </td>

                            {isItemI ? (
                              <>
                                <td className="p-2 text-xs font-semibold text-gray-700">
                                  General Requirements
                                </td>
                                <td className="p-2">
                                  <input type="hidden" value="General Requirements" />
                                </td>
                              </>
                            ) : isItemII ? (
                              <>
                                <td className="p-2 text-xs font-semibold text-gray-700">
                                  Site Works
                                </td>
                                <td className="p-2">
                                  <input type="hidden" value="Site Works" />
                                </td>
                              </>
                            ) : isItemIII || isItemIV || isItemV || isItemVI || isItemVII || isItemVIII ? (
                              <>
                                <td className="p-2 text-xs font-semibold text-gray-700">
                                  {section.replace(/ITEM [IVX]+\. /, '')}
                                </td>
                                <td className="p-2">
                                  <input type="hidden" value={section} />
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-2">
                                  <select
                                    value={item.section}
                                    onChange={(e) => updateItem(globalIdx, 'section', e.target.value)}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    {SECTIONS.slice(1).map(sec => (
                                      <option key={sec} value={sec}>{sec.replace(/ITEM [IVX]+\. /, '')}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-2">
                                  <div className="space-y-1">
                                    <select
                                      value={tradeValue}
                                      onChange={(e) => {
                                        const nextValue = e.target.value;
                                        if (nextValue === CUSTOM_TRADE_VALUE) {
                                          updateItem(globalIdx, 'trade', isCustomTrade ? item.trade : '');
                                          return;
                                        }
                                        updateItem(globalIdx, 'trade', nextValue);
                                      }}
                                      className="w-full h-7 px-2 rounded border text-xs"
                                    >
                                      <option value="">Select trade...</option>
                                      {TRADE_OPTIONS.map(trade => (
                                        <option key={trade} value={trade}>{trade}</option>
                                      ))}
                                      <option value={CUSTOM_TRADE_VALUE}>Custom...</option>
                                    </select>
                                    {tradeValue === CUSTOM_TRADE_VALUE && (
                                      <Input
                                        value={item.trade || ''}
                                        onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                        className="h-7 text-xs"
                                        placeholder="Custom trade"
                                      />
                                    )}
                                  </div>
                                </td>
                              </>
                            )}

                            <td className="p-2">
                              {isItemI ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemIValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_I_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_I_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select description...</option>
                                    {ITEM_I_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_I_VALUE}>Custom...</option>
                                  </select>
                                  {itemIValue === CUSTOM_ITEM_I_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_I_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom description"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemII ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemIIValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_II_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_II_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select activity...</option>
                                    {ITEM_II_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_II_VALUE}>Custom...</option>
                                  </select>
                                  {itemIIValue === CUSTOM_ITEM_II_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_II_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom activity/subfield"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemIII ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemIIIValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_III_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_III_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select work type...</option>
                                    {ITEM_III_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_III_VALUE}>Custom...</option>
                                  </select>
                                  {itemIIIValue === CUSTOM_ITEM_III_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_III_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom work type/specification"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemIV ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemIVValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_IV_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_IV_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select work type...</option>
                                    {ITEM_IV_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_IV_VALUE}>Custom...</option>
                                  </select>
                                  {itemIVValue === CUSTOM_ITEM_IV_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_IV_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom work type/specification"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemV ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemVValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_V_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_V_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select work type...</option>
                                    {ITEM_V_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_V_VALUE}>Custom...</option>
                                  </select>
                                  {itemVValue === CUSTOM_ITEM_V_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_V_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom work type/specification"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemVI ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemVIValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_VI_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_VI_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select work type...</option>
                                    {ITEM_VI_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_VI_VALUE}>Custom...</option>
                                  </select>
                                  {itemVIValue === CUSTOM_ITEM_VI_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_VI_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom work type/specification"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemVII ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemVIIValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_VII_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_VII_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select work type...</option>
                                    {ITEM_VII_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_VII_VALUE}>Custom...</option>
                                  </select>
                                  {itemVIIValue === CUSTOM_ITEM_VII_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_VII_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom work type/specification"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : isItemVIII ? (
                                <div className="space-y-1">
                                  <select
                                    value={itemVIIIValue}
                                    onChange={(e) => {
                                      const nextValue = e.target.value;
                                      if (nextValue === CUSTOM_ITEM_VIII_VALUE) {
                                        updateItem(globalIdx, 'description', CUSTOM_ITEM_VIII_VALUE);
                                        return;
                                      }
                                      updateItem(globalIdx, 'description', nextValue);
                                    }}
                                    className="w-full h-7 px-2 rounded border text-xs"
                                  >
                                    <option value="">Select work type...</option>
                                    {ITEM_VIII_DESCRIPTIONS.map(desc => (
                                      <option key={desc} value={desc}>{desc}</option>
                                    ))}
                                    <option value={CUSTOM_ITEM_VIII_VALUE}>Custom...</option>
                                  </select>
                                  {itemVIIIValue === CUSTOM_ITEM_VIII_VALUE ? (
                                    <Input
                                      value={item.description === CUSTOM_ITEM_VIII_VALUE ? '' : (item.description || '')}
                                      onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Custom work type/specification"
                                      autoFocus
                                    />
                                  ) : (
                                    <Input
                                      value={item.trade || ''}
                                      onChange={(e) => updateItem(globalIdx, 'trade', e.target.value)}
                                      className="h-7 text-xs"
                                      placeholder="Additional details/specifications"
                                    />
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Input
                                    value={item.description}
                                    onChange={(e) => updateItem(globalIdx, 'description', e.target.value)}
                                    className="h-7 text-xs"
                                    placeholder="Description"
                                  />
                                </div>
                              )}
                            </td>

                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.qty}
                                onChange={(e) => updateItem(globalIdx, 'qty', parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs text-right"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={item.unit}
                                onChange={(e) => updateItem(globalIdx, 'unit', e.target.value)}
                                className="h-7 text-xs"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(globalIdx, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs text-right"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.material_cost}
                                onChange={(e) => updateItem(globalIdx, 'material_cost', parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs text-right text-blue-600"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.labor_cost}
                                onChange={(e) => updateItem(globalIdx, 'labor_cost', parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs text-right text-green-600"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.equipment_cost}
                                onChange={(e) => updateItem(globalIdx, 'equipment_cost', parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs text-right text-orange-600"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="1"
                                value={item.markup_percent}
                                onChange={(e) => updateItem(globalIdx, 'markup_percent', parseFloat(e.target.value) || 0)}
                                className="h-7 text-xs text-right"
                              />
                            </td>
                            <td className="p-2 text-right font-medium">
                              {formatCurrency(directCost)}
                            </td>
                            <td className="p-2 text-right font-bold text-green-700">
                              {formatCurrency(contractAmt)}
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteItem(globalIdx)}
                                className="h-7 w-7 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {!embedded && (
        <Card>
          <CardHeader>
            <CardTitle>Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-500">COST BREAKDOWN</h3>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Direct Cost (Internal)</span>
                  <span className="font-bold">{formatCurrency(totals.internalAmount)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Contract Amount (with Markup)</span>
                  <span className="font-bold text-green-700">{formatCurrency(totals.contractAmount)}</span>
                </div>
                <div className="flex justify-between p-2 bg-green-100 rounded">
                  <span className="font-semibold">Item Profit</span>
                  <span className="font-bold text-green-700">{formatCurrency(totals.totalProfit)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-500">OCM ADJUSTMENTS</h3>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Overhead ({estimate?.ocm_overhead || 0}%)</span>
                  <span>{formatCurrency(totals.overhead)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Contingency ({estimate?.ocm_contingency || 0}%)</span>
                  <span>{formatCurrency(totals.contingency)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Misc ({estimate?.ocm_misc || 0}%)</span>
                  <span>{formatCurrency(totals.misc)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Profit ({estimate?.ocm_profit || 0}%)</span>
                  <span>{formatCurrency(totals.profit)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-500">FINAL TOTALS</h3>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatCurrency(totals.contractAmount + totals.overhead + totals.contingency + totals.misc + totals.profit)}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>VAT (12%)</span>
                  <span>{formatCurrency(totals.vat)}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-600 text-white rounded font-bold text-lg">
                  <span>TOTAL CONTRACT PRICE</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculator Modals */}
      <ConcreteCalculatorModal open={showConcreteCalc} onClose={() => setShowConcreteCalc(false)} />
      <WallSystemCalculatorModal open={showWallSystemCalc} onClose={() => setShowWallSystemCalc(false)} />
      <RebarBBSCalculatorModal open={showRebarCalc} onClose={() => setShowRebarCalc(false)} />
      <FormworkCalculatorModal open={showFormworkCalc} onClose={() => setShowFormworkCalc(false)} />
      <PaintCalculatorModal open={showPaintCalc} onClose={() => setShowPaintCalc(false)} />
      <FinishesCalculatorModal open={showFinishesCalc} onClose={() => setShowFinishesCalc(false)} />
      <FlooringCalculatorModal open={showFlooringCalc} onClose={() => setShowFlooringCalc(false)} />
      <StructuralCalculatorModal open={showStructuralCalc} onClose={() => setShowStructuralCalc(false)} />
    </div>
  );
}
