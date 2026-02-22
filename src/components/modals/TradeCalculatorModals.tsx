import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator as CalcIcon, Plus, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import {
  calculateReadyMixConcrete,
  calculateSiteMixConcrete,
  calculateWallSystem,
  calculateCHB,
  calculateRebar,
  calculateFormwork,
  calculatePaint,
  calculateFinishes,
  calculateFlooring,
  ReadyMixConcreteInputs,
  ReadyMixConcreteOutputs,
  SiteMixConcreteInputs,
  SiteMixConcreteOutputs,
  WallSystemInputs,
  WallSystemOutputs,
  WallSystemType,
  CHBCalculatorInputs,
  CHBCalculatorOutputs,
  RebarCalculatorInputs,
  RebarCalculatorOutputs,
  RebarBarDefinition,
  RebarBarShape,
  RebarGrade,
  RebarDiameter,
  RebarElementType,
  RebarCodeParameters,
  FormworkSystemType,
  FormworkElementType,
  FinishRequirement,
  FormworkCalculatorInputs,
  FormworkCalculatorOutputs,
  PaintCalculatorInputs,
  PaintCalculatorOutputs,
  FinishesCalculatorInputs,
  FinishesCalculatorOutputs,
  FinishSystemType,
  SubstrateType,
  FlooringCalculatorInputs,
  FlooringCalculatorOutputs,
  MATERIAL_PRICES,
} from '@/services/calculatorService';

interface ConcreteCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: any) => void;
}

type ConcreteMode = 'ready-mix' | 'site-mix';

export function ConcreteCalculatorModal({ open, onClose, onApply }: ConcreteCalculatorModalProps) {
  const [mode, setMode] = useState<ConcreteMode>('ready-mix');
  
  // Ready-Mix State
  const [readyMixInputs, setReadyMixInputs] = useState<ReadyMixConcreteInputs>({
    volume_m3: 10,
    concrete_unit_price: 7500,
    use_boom_pump: false,
    boom_pump_hours: 1,
    boom_pump_rate: 5000,
  });
  const [readyMixResults, setReadyMixResults] = useState<ReadyMixConcreteOutputs | null>(null);

  // Site-Mix State
  const [siteMixInputs, setSiteMixInputs] = useState<SiteMixConcreteInputs>({
    volume_m3: 10,
    cement_type: 'Type I',
    cement_price: 250,
    sand_price: 500,
    gravel_size: '3/4"',
    gravel_price: 600,
    wastage: 5,
  });
  const [siteMixResults, setSiteMixResults] = useState<SiteMixConcreteOutputs | null>(null);

  const calculateReadyMix = () => {
    const output = calculateReadyMixConcrete(readyMixInputs);
    setReadyMixResults(output);
  };

  const calculateSiteMix = () => {
    const output = calculateSiteMixConcrete(siteMixInputs);
    setSiteMixResults(output);
  };

  useEffect(() => {
    if (open) {
      if (mode === 'ready-mix') {
        calculateReadyMix();
      } else {
        calculateSiteMix();
      }
    }
  }, [open, mode, readyMixInputs, siteMixInputs]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Enhanced Concrete Calculator
          </DialogTitle>
        </DialogHeader>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === 'ready-mix' ? 'default' : 'outline'}
            onClick={() => setMode('ready-mix')}
            className="flex-1"
          >
            Ready-Mix Concrete
          </Button>
          <Button
            variant={mode === 'site-mix' ? 'default' : 'outline'}
            onClick={() => setMode('site-mix')}
            className="flex-1"
          >
            Site-Mix Concrete
          </Button>
        </div>

        {/* Ready-Mix Mode */}
        {mode === 'ready-mix' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-gray-500 mb-4">Inputs</h3>

              <div className="space-y-2">
                <Label htmlFor="rm-volume">Concrete Volume (cu.m)</Label>
                <Input
                  id="rm-volume"
                  type="number"
                  step="0.1"
                  value={readyMixInputs.volume_m3}
                  onChange={(e) =>
                    setReadyMixInputs({ ...readyMixInputs, volume_m3: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rm-price">Ready-Mix Concrete Unit Price (₱/cu.m)</Label>
                <Input
                  id="rm-price"
                  type="number"
                  step="100"
                  value={readyMixInputs.concrete_unit_price}
                  onChange={(e) =>
                    setReadyMixInputs({ ...readyMixInputs, concrete_unit_price: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <input
                    id="rm-boom"
                    type="checkbox"
                    checked={readyMixInputs.use_boom_pump}
                    onChange={(e) =>
                      setReadyMixInputs({ ...readyMixInputs, use_boom_pump: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="rm-boom" className="cursor-pointer">
                    Include Boom Pump Rental
                  </Label>
                </div>
              </div>

              {readyMixInputs.use_boom_pump && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rm-pump-hours">Boom Pump Hours Required</Label>
                    <Input
                      id="rm-pump-hours"
                      type="number"
                      step="0.5"
                      value={readyMixInputs.boom_pump_hours}
                      onChange={(e) =>
                        setReadyMixInputs({ ...readyMixInputs, boom_pump_hours: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-yellow-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rm-pump-rate">Boom Pump Rate (₱/hour)</Label>
                    <Input
                      id="rm-pump-rate"
                      type="number"
                      step="100"
                      value={readyMixInputs.boom_pump_rate}
                      onChange={(e) =>
                        setReadyMixInputs({ ...readyMixInputs, boom_pump_rate: parseFloat(e.target.value) || 0 })
                      }
                      className="bg-yellow-50"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Outputs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-gray-500 mb-4">Cost Summary</h3>

              {readyMixResults && (
                <Card className="p-4 space-y-3 bg-blue-50">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Concrete Volume</span>
                    <span className="text-lg font-bold">{readyMixResults.concrete_volume.toFixed(2)} cu.m</span>
                  </div>

                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Concrete Cost</span>
                    <span className="text-lg font-bold">{formatCurrency(readyMixResults.concrete_cost)}</span>
                  </div>

                  {readyMixResults.boom_pump_cost > 0 && (
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Boom Pump Rental</span>
                      <span className="text-lg font-bold">{formatCurrency(readyMixResults.boom_pump_cost)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-2 rounded font-bold">
                    <span className="text-lg">Total Cost</span>
                    <span className="text-xl text-blue-600">{formatCurrency(readyMixResults.total_cost)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="text-muted-foreground">Cost per cu.m</span>
                    <span className="font-bold">{formatCurrency(readyMixResults.cost_per_m3)}</span>
                  </div>
                </Card>
              )}

              <div className="text-xs text-gray-500 p-3 bg-amber-50 rounded border border-amber-200">
                <strong>Note:</strong> Ready-mix concrete prices vary by supplier and delivery distance. Boom pump rates typically charged per hour or per day.
              </div>
            </div>
          </div>
        )}

        {/* Site-Mix Mode */}
        {mode === 'site-mix' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-gray-500 mb-4">Material Inputs</h3>

              <div className="space-y-2">
                <Label htmlFor="sm-volume">Concrete Volume (cu.m)</Label>
                <Input
                  id="sm-volume"
                  type="number"
                  step="0.1"
                  value={siteMixInputs.volume_m3}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, volume_m3: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sm-cement-type">Cement Type</Label>
                <select
                  id="sm-cement-type"
                  value={siteMixInputs.cement_type}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, cement_type: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
                >
                  <option value="Type I">Type I (General Purpose)</option>
                  <option value="Type II">Type II (Moderate Sulfate Resistance)</option>
                  <option value="Type III">Type III (High Early Strength)</option>
                  <option value="Type IV">Type IV (Low Heat of Hydration)</option>
                  <option value="Type V">Type V (High Sulfate Resistance)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sm-cement-price">Cement Price (₱/bag)</Label>
                <Input
                  id="sm-cement-price"
                  type="number"
                  step="10"
                  value={siteMixInputs.cement_price}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, cement_price: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sm-sand-price">Sand Price (₱/cu.m)</Label>
                <Input
                  id="sm-sand-price"
                  type="number"
                  step="50"
                  value={siteMixInputs.sand_price}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, sand_price: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sm-gravel-size">Gravel Size</Label>
                <select
                  id="sm-gravel-size"
                  value={siteMixInputs.gravel_size}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, gravel_size: e.target.value })
                  }
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
                >
                  <option value='3/4"'>3/4" Gravel (Coarse)</option>
                  <option value='1/2"'>1/2" Gravel (Medium)</option>
                  <option value='3/8"'>3/8" Gravel (Fine)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sm-gravel-price">Gravel Price (₱/cu.m)</Label>
                <Input
                  id="sm-gravel-price"
                  type="number"
                  step="50"
                  value={siteMixInputs.gravel_price}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, gravel_price: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sm-wastage">Wastage Factor (%)</Label>
                <Input
                  id="sm-wastage"
                  type="number"
                  step="1"
                  value={siteMixInputs.wastage}
                  onChange={(e) =>
                    setSiteMixInputs({ ...siteMixInputs, wastage: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-yellow-50"
                />
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm uppercase text-gray-500 mb-4">Material Quantities & Cost</h3>

              {siteMixResults && (
                <Card className="p-4 space-y-2 bg-blue-50">
                  <div className="border-b pb-3 mb-3">
                    <div className="flex justify-between items-center font-bold mb-2">
                      <span>CEMENT ({siteMixInputs.cement_type})</span>
                      <span>{siteMixResults.cement_bags.toFixed(1)} bags</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>@ {formatCurrency(siteMixInputs.cement_price)}/bag</span>
                      <span className="font-semibold">{formatCurrency(siteMixResults.cement_cost)}</span>
                    </div>
                  </div>

                  <div className="border-b pb-3 mb-3">
                    <div className="flex justify-between items-center font-bold mb-2">
                      <span>SAND (Washed)</span>
                      <span>{siteMixResults.sand_m3.toFixed(2)} cu.m</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>@ {formatCurrency(siteMixInputs.sand_price)}/cu.m</span>
                      <span className="font-semibold">{formatCurrency(siteMixResults.sand_cost)}</span>
                    </div>
                  </div>

                  <div className="border-b pb-3 mb-3">
                    <div className="flex justify-between items-center font-bold mb-2">
                      <span>GRAVEL ({siteMixInputs.gravel_size})</span>
                      <span>{siteMixResults.gravel_m3.toFixed(2)} cu.m</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>@ {formatCurrency(siteMixInputs.gravel_price)}/cu.m</span>
                      <span className="font-semibold">{formatCurrency(siteMixResults.gravel_cost)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-2 rounded font-bold">
                    <span className="text-lg">Total Cost</span>
                    <span className="text-xl text-blue-600">{formatCurrency(siteMixResults.total_cost)}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="text-muted-foreground">Cost per cu.m</span>
                    <span className="font-bold">{formatCurrency(siteMixResults.cost_per_m3)}</span>
                  </div>
                </Card>
              )}

              <div className="text-xs text-gray-500 p-3 bg-amber-50 rounded border border-amber-200">
                <strong>Note:</strong> Site-mix calculations use standard 1:2:4 ratio. Material prices and availability vary by location. Factor in mixing labor and equipment costs separately.
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && (
            <Button
              onClick={() => {
                if (mode === 'ready-mix' && readyMixResults) {
                  onApply(readyMixResults);
                } else if (mode === 'site-mix' && siteMixResults) {
                  onApply(siteMixResults);
                }
                onClose();
              }}
            >
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// WALL SYSTEM CALCULATOR MODAL
// ============================================================================

interface WallSystemCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: any) => void;
}

const WALL_SYSTEMS: { value: WallSystemType; label: string; description: string }[] = [
  { value: 'chb', label: 'Concrete Hollow Block (CHB)', description: 'Durable, fire-resistant masonry' },
  { value: 'aac', label: 'AAC Blocks', description: 'Lightweight, excellent thermal properties' },
  { value: 'precast', label: 'Precast Panels', description: 'Fast installation, structural panels' },
  { value: 'drywall', label: 'Drywall/Fiber Cement', description: 'Lightweight partitions, quick setup' },
  { value: 'eps', label: 'EPS Sandwich Panels', description: 'Superior insulation, lightweight' },
];

export function WallSystemCalculatorModal({ open, onClose, onApply }: WallSystemCalculatorModalProps) {
  const [selectedSystem, setSelectedSystem] = useState<WallSystemType>('chb');
  const [compareMode, setCompareMode] = useState(false);
  
  const [inputs, setInputs] = useState<WallSystemInputs>({
    area_m2: 100,
    height_m: 3,
    wall_type: 'chb',
    opening_area_m2: 5,
    location: 'interior',
    finish_type: 'plaster',
    labor_daily_rate: 1200,
    chb_thickness: '100',
    chb_with_reinforcement: false,
    mortar_type: 'Class A',
    aac_thickness: '100',
    aac_adhesive_type: 'Standard',
    precast_thickness: '200',
    precast_joint_type: 'Sealant',
    drywall_stud_spacing: '400',
    drywall_layers: 1,
    eps_core_thickness: '100',
    eps_with_mesh: true,
  });
  
  const [results, setResults] = useState<WallSystemOutputs | null>(null);
  const [comparisonResults, setComparisonResults] = useState<Record<WallSystemType, WallSystemOutputs>>({} as any);
  
  // Custom pricing
  const [showPricingEditor, setShowPricingEditor] = useState(false);
  const [customPrices, setCustomPrices] = useState<Partial<typeof MATERIAL_PRICES>>({});
  const [customLaborRate, setCustomLaborRate] = useState<number | undefined>();

  const calculateSelected = () => {
    const calcInputs = { ...inputs, wall_type: selectedSystem };
    const output = calculateWallSystem(calcInputs, customPrices, customLaborRate);
    setResults(output);
  };

  const calculateComparison = () => {
    const allSystems: WallSystemType[] = ['chb', 'aac', 'precast', 'drywall', 'eps'];
    const comparison: Partial<Record<WallSystemType, WallSystemOutputs>> = {};
    
    allSystems.forEach((system) => {
      try {
        const calcInputs = { ...inputs, wall_type: system };
        comparison[system] = calculateWallSystem(calcInputs, customPrices, customLaborRate);
      } catch (e) {
        // Skip calculation errors
      }
    });
    
    setComparisonResults(comparison as any);
  };

  useEffect(() => {
    if (open) {
      if (compareMode) {
        calculateComparison();
      } else {
        calculateSelected();
      }
    }
  }, [open, selectedSystem, compareMode, inputs]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Wall System Calculator
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-2">Compare CHB, AAC, Precast & Lightweight Partitions</p>
        </DialogHeader>

        {/* Pricing Editor Toggle */}
        <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPricingEditor(!showPricingEditor)}
            className="w-full justify-between"
          >
            <span>⚙️ Edit Prices & Labor Rates</span>
            <span className="text-xs">{showPricingEditor ? '▼' : '▶'}</span>
          </Button>

          {showPricingEditor && (
            <div className="mt-4 max-h-80 overflow-y-auto border-t pt-4">
              {/* Labor Rate */}
              <div className="mb-4">
                <Label className="font-semibold text-sm mb-2 block">Daily Labor Rate</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={customLaborRate ?? inputs.labor_daily_rate}
                    onChange={(e) => setCustomLaborRate(parseInt(e.target.value) || undefined)}
                    placeholder="Enter custom labor rate"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCustomLaborRate(undefined);
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Default: ₱{inputs.labor_daily_rate}/day</p>
              </div>

              {/* Material Prices */}
              <div>
                <Label className="font-semibold text-sm mb-2 block">Material Prices (₱)</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(MATERIAL_PRICES).map(([key, defaultPrice]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={customPrices[key as keyof typeof MATERIAL_PRICES] ?? defaultPrice}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setCustomPrices({
                            ...customPrices,
                            [key]: value || defaultPrice,
                          });
                        }}
                        placeholder={String(defaultPrice)}
                        className="h-8 text-xs mx-0"
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">{key}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomPrices({})}
                  className="w-full mt-3"
                >
                  Reset All Prices
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={!compareMode ? 'default' : 'outline'}
            onClick={() => setCompareMode(false)}
          >
            Single System
          </Button>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            onClick={() => setCompareMode(true)}
          >
            Compare All Systems
          </Button>
        </div>

        {!compareMode ? (
          <div className="grid grid-cols-3 gap-4">
            {/* Left: Inputs */}
            <div className="col-span-1 space-y-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-sm uppercase">Project Inputs</h3>

              <div className="space-y-2">
                <Label>Wall System</Label>
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value as WallSystemType)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300"
                >
                  {WALL_SYSTEMS.map((sys) => (
                    <option key={sys.value} value={sys.value}>
                      {sys.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Wall Area (m²)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputs.area_m2}
                  onChange={(e) => setInputs({ ...inputs, area_m2: parseFloat(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Height (m)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputs.height_m}
                  onChange={(e) => setInputs({ ...inputs, height_m: parseFloat(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Door/Window Openings (m²)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={inputs.opening_area_m2}
                  onChange={(e) => setInputs({ ...inputs, opening_area_m2: parseFloat(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <select
                  value={inputs.location}
                  onChange={(e) => setInputs({ ...inputs, location: e.target.value as any })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300"
                >
                  <option value="interior">Interior</option>
                  <option value="exterior">Exterior</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Labor Daily Rate (₱)</Label>
                <Input
                  type="number"
                  step="50"
                  value={inputs.labor_daily_rate}
                  onChange={(e) => setInputs({ ...inputs, labor_daily_rate: parseFloat(e.target.value) || 0 })}
                  className="bg-white"
                />
              </div>

              {/* System-specific inputs */}
              {selectedSystem === 'chb' && (
                <>
                  <div className="space-y-2 border-t pt-3">
                    <Label>Block Size</Label>
                    <select
                      value={inputs.chb_thickness || '100'}
                      onChange={(e) => setInputs({ ...inputs, chb_thickness: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-gray-300"
                    >
                      <option value="100">100mm (4")</option>
                      <option value="150">150mm (6")</option>
                      <option value="200">200mm (8")</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inputs.chb_with_reinforcement || false}
                      onChange={(e) => setInputs({ ...inputs, chb_with_reinforcement: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label className="cursor-pointer">Include Reinforcement</Label>
                  </div>
                </>
              )}

              {selectedSystem === 'aac' && (
                <>
                  <div className="space-y-2 border-t pt-3">
                    <Label>Block Thickness</Label>
                    <select
                      value={inputs.aac_thickness || '100'}
                      onChange={(e) => setInputs({ ...inputs, aac_thickness: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-gray-300"
                    >
                      <option value="75">75mm</option>
                      <option value="100">100mm</option>
                      <option value="150">150mm</option>
                      <option value="200">200mm</option>
                    </select>
                  </div>
                </>
              )}

              {selectedSystem === 'precast' && (
                <>
                  <div className="space-y-2 border-t pt-3">
                    <Label>Panel Thickness</Label>
                    <select
                      value={inputs.precast_thickness || '200'}
                      onChange={(e) => setInputs({ ...inputs, precast_thickness: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-gray-300"
                    >
                      <option value="150">150mm</option>
                      <option value="200">200mm</option>
                      <option value="250">250mm</option>
                    </select>
                  </div>
                </>
              )}

              {selectedSystem === 'drywall' && (
                <>
                  <div className="space-y-2 border-t pt-3">
                    <Label>Drywall Layers</Label>
                    <select
                      value={inputs.drywall_layers || 1}
                      onChange={(e) => setInputs({ ...inputs, drywall_layers: parseInt(e.target.value) })}
                      className="w-full h-9 px-3 rounded-md border border-gray-300"
                    >
                      <option value={1}>Single Layer</option>
                      <option value={2}>Double Layer</option>
                    </select>
                  </div>
                </>
              )}

              {selectedSystem === 'eps' && (
                <>
                  <div className="space-y-2 border-t pt-3">
                    <Label>Core Thickness</Label>
                    <select
                      value={inputs.eps_core_thickness || '100'}
                      onChange={(e) => setInputs({ ...inputs, eps_core_thickness: e.target.value })}
                      className="w-full h-9 px-3 rounded-md border border-gray-300"
                    >
                      <option value="50">50mm</option>
                      <option value="75">75mm</option>
                      <option value="100">100mm</option>
                      <option value="150">150mm</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inputs.eps_with_mesh || false}
                      onChange={(e) => setInputs({ ...inputs, eps_with_mesh: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label className="cursor-pointer">Include Mesh Reinforcement</Label>
                  </div>
                </>
              )}
            </div>

            {/* Right: Results */}
            <div className="col-span-2 space-y-4">
              {results && (
                <>
                  {/* Cost Summary */}
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Net Area</p>
                          <p className="text-xl font-bold">{results.net_area_m2.toFixed(1)} m²</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Materials</p>
                          <p className="text-xl font-bold text-green-700">{formatCurrency(results.materials_cost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Labor</p>
                          <p className="text-xl font-bold text-orange-700">{formatCurrency(results.labor_cost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Unit Cost</p>
                          <p className="text-2xl font-bold text-blue-700">{formatCurrency(results.unit_cost)}/m²</p>
                        </div>
                      </div>

                      <div className="bg-white rounded p-4 border-2 border-blue-300">
                        <p className="text-xs text-gray-600 uppercase mb-1">Total Installed Cost</p>
                        <p className="text-3xl font-bold text-blue-600">{formatCurrency(results.total_cost)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Materials List */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Bill of Materials</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {results.materials.map((mat, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{mat.name}</p>
                              <p className="text-xs text-gray-500">{mat.quantity.toFixed(2)} {mat.unit}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{formatCurrency(mat.total_cost)}</p>
                              <p className="text-xs text-gray-500">{formatCurrency(mat.unit_price)}/{mat.unit}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Labor & Time */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Labor Breakdown & Schedule</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.labor_breakdown.map((labor, idx) => (
                          <div key={idx} className="border-b pb-3 last:border-b-0">
                            <p className="font-medium text-sm">{labor.task}</p>
                            <div className="grid grid-cols-4 text-xs text-gray-600 mt-1">
                              <span>{labor.mandays.toFixed(2)} mandays</span>
                              <span>{labor.total_hours.toFixed(1)} hours</span>
                              <span>{formatCurrency(labor.hourly_rate)}/hr</span>
                              <span className="font-bold text-gray-800">{formatCurrency(labor.total_cost)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold">Duration</span>
                            <span className="text-lg font-bold">{results.estimated_days} days</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">Crew Size</span>
                            <span className="text-lg font-bold">{results.crew_size} workers</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">Productivity</span>
                            <span className="text-lg font-bold">{results.productivity_m2_per_day.toFixed(1)} m²/day</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-sm">Performance Characteristics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-white rounded border border-green-200">
                          <p className="text-xs text-gray-600">Weight</p>
                          <p className="font-bold text-sm">{results.performance.weight_kg_m2} kg/m²</p>
                        </div>
                        <div className="p-2 bg-white rounded border border-green-200">
                          <p className="text-xs text-gray-600">Thermal Resistance (R)</p>
                          <p className="font-bold text-sm">{results.performance.thermal_resistance_r.toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-white rounded border border-green-200">
                          <p className="text-xs text-gray-600">Acoustic Index</p>
                          <p className="font-bold text-sm">{results.performance.acoustic_index_db} dB</p>
                        </div>
                        <div className="p-2 bg-white rounded border border-green-200">
                          <p className="text-xs text-gray-600">Fire Rating</p>
                          <p className="font-bold text-sm">{results.performance.fire_rating}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        ) : (
          // Comparison View
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(comparisonResults).map(([system, res]) => (
                <Card key={system} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{res.wall_type.toUpperCase()}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Unit Cost</p>
                      <p className="font-bold text-lg">{formatCurrency(res.unit_cost)}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Total Cost</p>
                      <p className="font-bold">{formatCurrency(res.total_cost)}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-bold">{res.estimated_days} days</p>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-xs text-gray-600 mb-1">Weight: {res.performance.weight_kg_m2} kg/m²</p>
                      <p className="text-xs text-gray-600 mb-1">R-value: {res.performance.thermal_resistance_r.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Sound: {res.performance.acoustic_index_db} dB</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Detailed Comparison</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Metric</th>
                      {Object.entries(comparisonResults).map(([system]) => (
                        <th key={system} className="border p-2 text-center font-bold">{system.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-bold">Unit Cost (₱/m²)</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center bg-blue-50">{formatCurrency(res.unit_cost)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold">Total Cost (₱)</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center">{formatCurrency(res.total_cost)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold">Duration (days)</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center bg-orange-50">{res.estimated_days}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold">Weight (kg/m²)</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center">{res.performance.weight_kg_m2}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold">Thermal R-value</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center bg-green-50">{res.performance.thermal_resistance_r.toFixed(2)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold">Acoustic (dB)</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center">{res.performance.acoustic_index_db}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-bold">Fire Rating</td>
                      {Object.entries(comparisonResults).map(([system, res]) => (
                        <td key={system} className="border p-2 text-center bg-red-50">{res.performance.fire_rating}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && !compareMode && (
            <Button
              onClick={() => {
                onApply(results);
                onClose();
              }}
            >
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CHBCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: CHBCalculatorOutputs & { inputs: CHBCalculatorInputs }) => void;
}

export function CHBCalculatorModal({ open, onClose, onApply }: CHBCalculatorModalProps) {
  const [inputs, setInputs] = useState<CHBCalculatorInputs>({
    area_m2: 10,
    chb_size: '4 inch',
    with_plaster: true,
  });
  const [results, setResults] = useState<CHBCalculatorOutputs | null>(null);

  const calculate = () => {
    const output = calculateCHB(inputs);
    setResults(output);
  };

  useEffect(() => {
    if (open) {
      calculate();
    }
  }, [open, inputs]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            CHB Wall Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500">Inputs</h3>

            <div className="space-y-2">
              <Label htmlFor="area">Wall Area (sq.m)</Label>
              <Input
                id="area"
                type="number"
                step="0.01"
                value={inputs.area_m2}
                onChange={(e) => setInputs({ ...inputs, area_m2: parseFloat(e.target.value) || 0 })}
                className="bg-yellow-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chb_size">CHB Size</Label>
              <select
                id="chb_size"
                value={inputs.chb_size}
                onChange={(e) => setInputs({ ...inputs, chb_size: e.target.value })}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
              >
                <option value="4 inch">4" (100mm)</option>
                <option value="6 inch">6" (150mm)</option>
                <option value="8 inch">8" (200mm)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="with_plaster"
                type="checkbox"
                checked={inputs.with_plaster}
                onChange={(e) => setInputs({ ...inputs, with_plaster: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="with_plaster" className="cursor-pointer">
                With Plaster Both Sides
              </Label>
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500">Material Quantities</h3>

            {results && (
              <Card className="p-4 space-y-3 bg-blue-50">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">CHB {inputs.chb_size}</span>
                  <span className="text-lg font-bold">{results.chb_pcs} pcs</span>
                </div>

                <div className="text-xs font-semibold text-gray-600 mt-3">MORTAR (for laying)</div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Cement</span>
                  <span className="font-bold">{results.cement_mortar_bags.toFixed(1)} bags</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">Sand</span>
                  <span className="font-bold">{results.sand_mortar_m3.toFixed(3)} cu.m</span>
                </div>

                {inputs.with_plaster && (
                  <>
                    <div className="text-xs font-semibold text-gray-600 mt-3">PLASTER (both sides)</div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Cement</span>
                      <span className="font-bold">{results.cement_plaster_bags.toFixed(1)} bags</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">Sand</span>
                      <span className="font-bold">{results.sand_plaster_m3.toFixed(3)} cu.m</span>
                    </div>
                  </>
                )}
              </Card>
            )}

            <div className="text-xs text-gray-500 mt-4 p-3 bg-amber-50 rounded border border-amber-200">
              <strong>Standard:</strong> 12.5 pcs per sq.m for 4" CHB
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs })}>
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RebarCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: RebarCalculatorOutputs & { inputs: RebarCalculatorInputs }) => void;
}

export function RebarCalculatorModal({ open, onClose, onApply }: RebarCalculatorModalProps) {
  const [inputs, setInputs] = useState<RebarCalculatorInputs>({
    bar_size: '12mm',
    total_length_m: 100,
    wastage: 8,
  });
  const [results, setResults] = useState<RebarCalculatorOutputs | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const output = await calculateRebar(inputs);
      setResults(output);
    } catch (error) {
      console.error('Rebar calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      calculate();
    }
  }, [open, inputs]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Rebar Weight Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500">Inputs</h3>

            <div className="space-y-2">
              <Label htmlFor="bar_size">Bar Size</Label>
              <select
                id="bar_size"
                value={inputs.bar_size}
                onChange={(e) => setInputs({ ...inputs, bar_size: e.target.value })}
                className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
              >
                <option value="10mm">10mm (Grade 40)</option>
                <option value="12mm">12mm (Grade 40)</option>
                <option value="16mm">16mm (Grade 40)</option>
                <option value="20mm">20mm (Grade 40)</option>
                <option value="25mm">25mm (Grade 40)</option>
                <option value="28mm">28mm (Grade 40)</option>
                <option value="32mm">32mm (Grade 40)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Total Length (meters)</Label>
              <Input
                id="length"
                type="number"
                step="0.1"
                value={inputs.total_length_m}
                onChange={(e) => setInputs({ ...inputs, total_length_m: parseFloat(e.target.value) || 0 })}
                className="bg-yellow-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wastage_rebar">Wastage Factor (%)</Label>
              <Input
                id="wastage_rebar"
                type="number"
                step="1"
                value={inputs.wastage}
                onChange={(e) => setInputs({ ...inputs, wastage: parseFloat(e.target.value) || 0 })}
                className="bg-yellow-50"
              />
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500">Weight Calculation</h3>

            {results && !loading && (
              <Card className="p-4 space-y-3 bg-blue-50">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Weight per meter</span>
                  <span className="text-sm">{results.weight_per_m?.toFixed(3) ?? '—'} kg/m</span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Total Rebar Weight</span>
                  <span className="text-lg font-bold text-blue-700">{results.weight_kg?.toFixed(2) ?? results.total_rebar_kg?.toFixed(2) ?? '—'} kg</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Tie Wire #16</span>
                  <span className="font-bold">{results.tie_wire_kg?.toFixed(2) ?? '—'} kg</span>
                </div>

                <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                  Standard bar length: 9m<br />
                  Bars needed: {inputs.total_length_m && inputs.wastage ? Math.ceil(inputs.total_length_m * (1 + inputs.wastage/100) / 9) : '—'} pcs
                </div>
              </Card>
            )}

            <div className="text-xs text-gray-500 mt-4 p-3 bg-amber-50 rounded border border-amber-200">
              <strong>ASTM A 615:1995</strong><br />
              Weights based on standard rebar specifications. Tie wire calculated at 1.5% of rebar weight.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs })}>
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FormworkCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: any) => void;
}

export function FormworkCalculatorModal({ open, onClose, onApply }: FormworkCalculatorModalProps) {
  const [inputs, setInputs] = useState<FormworkCalculatorInputs>({
    system_type: FormworkSystemType.TIMBER_CONVENTIONAL,
    element_type: FormworkElementType.COLUMN,
    finish_requirement: FinishRequirement.REGULAR,
    formwork_area_m2: 100,
    length_m: 10,
    width_m: 10,
    height_m: 4,
    perimeter_m: 40,
    number_of_pours: 1,
    reuse_cycles: 4,
    damage_allowance_percent: 3,
    carpenter_rate_php_per_day: 1200,
    helper_rate_php_per_day: 800,
    labor_productivity_m2_per_day: 18,
    plywood_unit_price_per_sheet: 2500,
    lumber_2x2_php_per_piece: 850,
    lumber_2x3_php_per_piece: 1050,
    lumber_2x4_php_per_piece: 1200,
    tie_rod_php_per_unit: 200,
    tie_cone_php_per_unit: 50,
    nails_php_per_kg: 180,
    scaffold_rate_php_per_day: 3000,
    power_tools_rate_php_per_day: 800,
    crane_rate_php_per_day: 5000,
    require_crane: false,
    stripping_day: 7,
    planned_duration_days: 14,
  });
  const [results, setResults] = useState<FormworkCalculatorOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'inputs' | 'outputs'>('inputs');

  const calculate = () => {
    const output = calculateFormwork(inputs);
    setResults(output);
  };

  useEffect(() => {
    if (open) {
      calculate();
    }
  }, [open, inputs]);

  const systemOptions = Object.values(FormworkSystemType).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }));

  const elementOptions = Object.values(FormworkElementType).map(type => ({
    value: type,
    label: type.charAt(0) + type.slice(1).toLowerCase()
  }));

  const finishOptions = Object.values(FinishRequirement).map(type => ({
    value: type,
    label: type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
  }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Formwork Material Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('inputs')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              activeTab === 'inputs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inputs
          </button>
          <button
            onClick={() => setActiveTab('outputs')}
            className={`px-4 py-2 rounded-md font-medium transition ${
              activeTab === 'outputs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Results
          </button>
        </div>

        {activeTab === 'inputs' && (
          <div className="space-y-6">
            {/* System & Element Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="system_type">Formwork System</Label>
                <select
                  id="system_type"
                  value={inputs.system_type}
                  onChange={(e) => setInputs({ ...inputs, system_type: e.target.value as FormworkSystemType })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
                >
                  {systemOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="element_type">Element Type</Label>
                <select
                  id="element_type"
                  value={inputs.element_type}
                  onChange={(e) => setInputs({ ...inputs, element_type: e.target.value as FormworkElementType })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
                >
                  {elementOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finish_requirement">Finish Requirement</Label>
                <select
                  id="finish_requirement"
                  value={inputs.finish_requirement}
                  onChange={(e) => setInputs({ ...inputs, finish_requirement: e.target.value as FinishRequirement })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 bg-yellow-50"
                >
                  {finishOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="formwork_area">Area (m²)</Label>
                <Input
                  id="formwork_area"
                  type="number"
                  step="0.1"
                  value={inputs.formwork_area_m2}
                  onChange={(e) => setInputs({ ...inputs, formwork_area_m2: parseFloat(e.target.value) || 0 })}
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={inputs.length_m}
                  onChange={(e) => setInputs({ ...inputs, length_m: parseFloat(e.target.value) || 0 })}
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  value={inputs.width_m}
                  onChange={(e) => setInputs({ ...inputs, width_m: parseFloat(e.target.value) || 0 })}
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (m)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={inputs.height_m}
                  onChange={(e) => setInputs({ ...inputs, height_m: parseFloat(e.target.value) || 0 })}
                  className="bg-yellow-50"
                />
              </div>
            </div>

            {/* Project Parameters */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pours">Number of Pours</Label>
                <Input
                  id="pours"
                  type="number"
                  step="1"
                  min="1"
                  value={inputs.number_of_pours}
                  onChange={(e) => setInputs({ ...inputs, number_of_pours: parseInt(e.target.value) || 1 })}
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reuse">Reuse Cycles</Label>
                <Input
                  id="reuse"
                  type="number"
                  step="1"
                  min="1"
                  value={inputs.reuse_cycles}
                  onChange={(e) => setInputs({ ...inputs, reuse_cycles: parseInt(e.target.value) || 4 })}
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="damage">Damage Allowance (%)</Label>
                <Input
                  id="damage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={inputs.damage_allowance_percent}
                  onChange={(e) => setInputs({ ...inputs, damage_allowance_percent: parseFloat(e.target.value) || 3 })}
                  className="bg-yellow-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Planned Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  step="1"
                  min="1"
                  value={inputs.planned_duration_days}
                  onChange={(e) => setInputs({ ...inputs, planned_duration_days: parseInt(e.target.value) || 14 })}
                  className="bg-yellow-50"
                />
              </div>
            </div>

            {/* Labor Rates */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Labor Rates (PHP)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="carpenter_rate">Carpenter/day</Label>
                  <Input
                    id="carpenter_rate"
                    type="number"
                    step="100"
                    value={inputs.carpenter_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, carpenter_rate_php_per_day: parseFloat(e.target.value) || 1200 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="helper_rate">Helper/day</Label>
                  <Input
                    id="helper_rate"
                    type="number"
                    step="100"
                    value={inputs.helper_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, helper_rate_php_per_day: parseFloat(e.target.value) || 800 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productivity">Productivity (m²/day)</Label>
                  <Input
                    id="productivity"
                    type="number"
                    step="0.1"
                    min="1"
                    value={inputs.labor_productivity_m2_per_day}
                    onChange={(e) => setInputs({ ...inputs, labor_productivity_m2_per_day: parseFloat(e.target.value) || 18 })}
                    className="bg-yellow-50"
                  />
                </div>
              </div>
            </div>

            {/* Material Prices */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Material Unit Prices (PHP)</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plywood_price">Plywood/sheet</Label>
                  <Input
                    id="plywood_price"
                    type="number"
                    step="100"
                    value={inputs.plywood_unit_price_per_sheet}
                    onChange={(e) => setInputs({ ...inputs, plywood_unit_price_per_sheet: parseFloat(e.target.value) || 2500 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lumber_2x2">2x2 Lumber/pc</Label>
                  <Input
                    id="lumber_2x2"
                    type="number"
                    step="50"
                    value={inputs.lumber_2x2_php_per_piece}
                    onChange={(e) => setInputs({ ...inputs, lumber_2x2_php_per_piece: parseFloat(e.target.value) || 850 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lumber_2x3">2x3 Lumber/pc</Label>
                  <Input
                    id="lumber_2x3"
                    type="number"
                    step="50"
                    value={inputs.lumber_2x3_php_per_piece}
                    onChange={(e) => setInputs({ ...inputs, lumber_2x3_php_per_piece: parseFloat(e.target.value) || 1050 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lumber_2x4">2x4 Lumber/pc</Label>
                  <Input
                    id="lumber_2x4"
                    type="number"
                    step="50"
                    value={inputs.lumber_2x4_php_per_piece}
                    onChange={(e) => setInputs({ ...inputs, lumber_2x4_php_per_piece: parseFloat(e.target.value) || 1200 })}
                    className="bg-yellow-50"
                  />
                </div>
              </div>
            </div>

            {/* Equipment Rates */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-3">Equipment Rental Rates (PHP/day)</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scaffold_rate">Scaffold</Label>
                  <Input
                    id="scaffold_rate"
                    type="number"
                    step="100"
                    value={inputs.scaffold_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, scaffold_rate_php_per_day: parseFloat(e.target.value) || 3000 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tools_rate">Power Tools</Label>
                  <Input
                    id="tools_rate"
                    type="number"
                    step="100"
                    value={inputs.power_tools_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, power_tools_rate_php_per_day: parseFloat(e.target.value) || 800 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crane_rate">Crane</Label>
                  <Input
                    id="crane_rate"
                    type="number"
                    step="100"
                    value={inputs.crane_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, crane_rate_php_per_day: parseFloat(e.target.value) || 5000 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id="require_crane"
                      checked={inputs.require_crane}
                      onChange={(e) => setInputs({ ...inputs, require_crane: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="require_crane" className="font-normal">Crane Required</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'outputs' && results && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-blue-50">
                <div className="text-sm text-gray-600">Total Area</div>
                <div className="text-2xl font-bold">{results.formwork_area_m2.toFixed(1)} m²</div>
              </Card>

              <Card className="p-4 bg-green-50">
                <div className="text-sm text-gray-600">Material Cost</div>
                <div className="text-2xl font-bold">₱{results.total_material_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
              </Card>

              <Card className="p-4 bg-orange-50">
                <div className="text-sm text-gray-600">Labor Cost</div>
                <div className="text-2xl font-bold">₱{results.total_labor_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
              </Card>

              <Card className="p-4 bg-purple-50">
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-2xl font-bold">₱{results.total_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
              </Card>
            </div>

            {/* Cost per m² */}
            <Card className="p-4 bg-indigo-50 border-2 border-indigo-200">
              <div className="text-sm text-gray-700">Cost per Square Meter</div>
              <div className="text-3xl font-bold text-indigo-600">₱{results.cost_per_m2.toLocaleString('en-PH', { maximumFractionDigits: 2 })}/m²</div>
            </Card>

            {/* Materials Breakdown */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Material Quantities & Costs</h4>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Material</th>
                      <th className="px-3 py-2 text-right font-semibold">Quantity</th>
                      <th className="px-3 py-2 text-right font-semibold">Unit</th>
                      <th className="px-3 py-2 text-right font-semibold">Cost (PHP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-3 py-2">Marine Plywood 1/2"</td>
                      <td className="px-3 py-2 text-right">{results.materials.plywood_sheets.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">sheets</td>
                      <td className="px-3 py-2 text-right font-medium">₱{(results.materials.plywood_sheets * inputs.plywood_unit_price_per_sheet).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Lumber 2" x 2" x 10'</td>
                      <td className="px-3 py-2 text-right">{results.materials.lumber_2x2_pcs.toFixed(0)}</td>
                      <td className="px-3 py-2 text-right">pcs</td>
                      <td className="px-3 py-2 text-right font-medium">₱{(results.materials.lumber_2x2_pcs * inputs.lumber_2x2_php_per_piece).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Lumber 2" x 3" x 10'</td>
                      <td className="px-3 py-2 text-right">{results.materials.lumber_2x3_pcs.toFixed(0)}</td>
                      <td className="px-3 py-2 text-right">pcs</td>
                      <td className="px-3 py-2 text-right font-medium">₱{(results.materials.lumber_2x3_pcs * inputs.lumber_2x3_php_per_piece).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Lumber 2" x 4" x 10'</td>
                      <td className="px-3 py-2 text-right">{results.materials.lumber_2x4_pcs.toFixed(0)}</td>
                      <td className="px-3 py-2 text-right">pcs</td>
                      <td className="px-3 py-2 text-right font-medium">₱{(results.materials.lumber_2x4_pcs * inputs.lumber_2x4_php_per_piece).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Tie Rods</td>
                      <td className="px-3 py-2 text-right">{results.materials.tie_rods_qty.toFixed(0)}</td>
                      <td className="px-3 py-2 text-right">pcs</td>
                      <td className="px-3 py-2 text-right font-medium">₱{(results.materials.tie_rods_qty * inputs.tie_rod_php_per_unit).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-3 py-2">Common Nails</td>
                      <td className="px-3 py-2 text-right">{results.materials.nails_kg.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">kg</td>
                      <td className="px-3 py-2 text-right font-medium">₱{(results.materials.nails_kg * inputs.nails_php_per_kg).toLocaleString('en-PH', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Labor Breakdown */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Labor Requirements</h4>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-orange-50">
                  <div className="text-sm text-gray-600">Carpenter Hours</div>
                  <div className="text-lg font-bold">{results.labor.carpenter_hours.toFixed(1)} hrs</div>
                  <div className="text-xs text-gray-500 mt-1">@ ₱{inputs.carpenter_rate_php_per_day.toLocaleString('en-PH')}/day</div>
                  <div className="text-sm font-semibold mt-2">₱{results.labor.carpenter_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
                </Card>

                <Card className="p-4 bg-yellow-50">
                  <div className="text-sm text-gray-600">Helper Hours</div>
                  <div className="text-lg font-bold">{results.labor.helper_hours.toFixed(1)} hrs</div>
                  <div className="text-xs text-gray-500 mt-1">@ ₱{inputs.helper_rate_php_per_day.toLocaleString('en-PH')}/day</div>
                  <div className="text-sm font-semibold mt-2">₱{results.labor.helper_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
                </Card>
              </div>
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                <div className="font-semibold">Estimated Duration: {results.labor.estimated_duration_days.toFixed(1)} days</div>
              </div>
            </div>

            {/* Equipment Breakdown */}
            {results.equipment && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Equipment Requirements</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <div className="text-sm text-gray-600">Scaffold</div>
                    <div className="text-lg font-bold">{results.equipment.scaffold_days.toFixed(1)} days</div>
                    <div className="text-xs text-gray-500 mt-1">@ ₱{inputs.scaffold_rate_php_per_day.toLocaleString('en-PH')}/day</div>
                    <div className="text-sm font-semibold mt-2">₱{results.equipment.scaffold_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
                  </Card>

                  <Card className="p-4 bg-cyan-50">
                    <div className="text-sm text-gray-600">Power Tools</div>
                    <div className="text-lg font-bold">{results.equipment.power_tools_days.toFixed(1)} days</div>
                    <div className="text-xs text-gray-500 mt-1">@ ₱{inputs.power_tools_rate_php_per_day.toLocaleString('en-PH')}/day</div>
                    <div className="text-sm font-semibold mt-2">₱{results.equipment.power_tools_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</div>
                  </Card>

                  {inputs.require_crane && results.equipment.crane_days !== undefined && (
                    <Card className="p-4 bg-red-50">
                      <div className="text-sm text-gray-600">Crane</div>
                      <div className="text-lg font-bold">{results.equipment.crane_days.toFixed(1)} days</div>
                      <div className="text-xs text-gray-500 mt-1">@ ₱{(inputs.crane_rate_php_per_day || 5000).toLocaleString('en-PH')}/day</div>
                      <div className="text-sm font-semibold mt-2">₱{results.equipment.crane_cost_php?.toLocaleString('en-PH', { maximumFractionDigits: 0 }) || '0'}</div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Cost Summary</h4>
              <div className="space-y-2 bg-gray-50 p-4 rounded">
                <div className="flex justify-between">
                  <span>Materials</span>
                  <span className="font-semibold">₱{results.cost_breakdown.materials?.toLocaleString('en-PH', { maximumFractionDigits: 0 }) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Labor</span>
                  <span className="font-semibold">₱{results.cost_breakdown.labor?.toLocaleString('en-PH', { maximumFractionDigits: 0 }) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipment</span>
                  <span className="font-semibold">₱{results.cost_breakdown.equipment?.toLocaleString('en-PH', { maximumFractionDigits: 0 }) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Replacement</span>
                  <span className="font-semibold">₱{results.cost_breakdown.replacement?.toLocaleString('en-PH', { maximumFractionDigits: 0 }) || '0'}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">₱{results.total_cost_php.toLocaleString('en-PH', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>

            {/* Validation Warnings */}
            {results.validation_warnings.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-amber-700">⚠️ Validation Warnings</h4>
                <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-2">
                  {results.validation_warnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-amber-800">• {warning}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs })}>
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface PaintCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: PaintCalculatorOutputs & { inputs: PaintCalculatorInputs }) => void;
}

export function PaintCalculatorModal({ open, onClose, onApply }: PaintCalculatorModalProps) {
  const [inputs, setInputs] = useState<PaintCalculatorInputs>({
    area_m2: 50,
    coats: 2,
    coverage_rate: 25,
  });
  const [results, setResults] = useState<PaintCalculatorOutputs | null>(null);

  const calculate = () => {
    const output = calculatePaint(inputs);
    setResults(output);
  };

  useEffect(() => {
    if (open) {
      calculate();
    }
  }, [open, inputs]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Paint Coverage Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500">Inputs</h3>

            <div className="space-y-2">
              <Label htmlFor="paint_area">Surface Area (sq.m)</Label>
              <Input
                id="paint_area"
                type="number"
                step="0.1"
                value={inputs.area_m2}
                onChange={(e) => setInputs({ ...inputs, area_m2: parseFloat(e.target.value) || 0 })}
                className="bg-yellow-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coats">Number of Coats</Label>
              <Input
                id="coats"
                type="number"
                step="1"
                min="1"
                max="5"
                value={inputs.coats}
                onChange={(e) => setInputs({ ...inputs, coats: parseInt(e.target.value) || 1 })}
                className="bg-yellow-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage">Coverage Rate (sq.m/gallon)</Label>
              <Input
                id="coverage"
                type="number"
                step="1"
                value={inputs.coverage_rate}
                onChange={(e) => setInputs({ ...inputs, coverage_rate: parseFloat(e.target.value) || 25 })}
                className="bg-yellow-50"
              />
              <p className="text-xs text-gray-500">Typical: 25-30 sq.m per gallon</p>
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500">Material Quantities</h3>

            {results && (
              <Card className="p-4 space-y-3 bg-blue-50">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Acrylic Paint</span>
                  <span className="text-lg font-bold">{results.paint_gallons.toFixed(1)} gallons</span>
                </div>

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Paint Thinner</span>
                  <span className="font-bold">{results.thinner_liters.toFixed(1)} liters</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Putty</span>
                  <span className="font-bold">{results.putty_kg.toFixed(1)} kg</span>
                </div>

                <div className="text-xs text-gray-600 mt-3 pt-3 border-t">
                  Coverage: {(inputs.area_m2 * inputs.coats).toFixed(1)} sq.m total<br />
                  Per gallon: {inputs.coverage_rate} sq.m
                </div>
              </Card>
            )}

            <div className="text-xs text-gray-500 mt-4 p-3 bg-amber-50 rounded border border-amber-200">
              <strong>Note:</strong> Coverage rates vary by surface condition and paint type. Add contingency for rough surfaces.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs })}>
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// REBAR BBS & COSTING CALCULATOR MODAL (Enhanced)
// ============================================================================

interface RebarBBSCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: RebarCalculatorOutputs & { inputs: RebarCalculatorInputs }) => void;
}

export function RebarBBSCalculatorModal({ open, onClose, onApply }: RebarBBSCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'bars' | 'code' | 'output'>('bars');
  const [bars, setBars] = useState<RebarBarDefinition[]>([
    {
      mark: 'M1',
      shape: RebarBarShape.STRAIGHT,
      diameter_mm: RebarDiameter.D16 as any,
      grade: RebarGrade.GRADE_60,
      quantity_pcs: 10,
      dimension_a: 5000,
      element_type: RebarElementType.BEAM,
    }
  ]);

  const [codeParams, setCodeParams] = useState<RebarCodeParameters>({
    concrete_cover_mm: 40,
    hook_length_rule: 9,
    lap_splice_rule: 40,
    bend_deduction_90: 10,
    bend_deduction_135: 10,
    bend_deduction_180: 6,
    wastage_percent: 5,
  });

  const [materialPricePerKg, setMaterialPricePerKg] = useState(300);
  const [laborRatePerDay, setLaborRatePerDay] = useState(1300);
  const [stockLengths, setStockLengths] = useState([6, 7.5, 9, 12]);
  const [results, setResults] = useState<RebarCalculatorOutputs | null>(null);

  // Calculate results
  const handleCalculate = () => {
    const inputs: RebarCalculatorInputs = {
      bars,
      code_params: codeParams,
      material_price_per_kg: materialPricePerKg,
      labor_rate_php_per_day: laborRatePerDay,
      procurement_stock_lengths: stockLengths,
    };
    const output = calculateRebar(inputs);
    setResults(output);
  };

  // Add new bar
  const handleAddBar = () => {
    const newBar: RebarBarDefinition = {
      mark: `M${bars.length + 1}`,
      shape: RebarBarShape.STRAIGHT,
      diameter_mm: RebarDiameter.D16 as any,
      grade: RebarGrade.GRADE_60,
      quantity_pcs: 1,
      dimension_a: 5000,
      element_type: RebarElementType.BEAM,
    };
    setBars([...bars, newBar]);
  };

  // Remove bar
  const handleRemoveBar = (index: number) => {
    setBars(bars.filter((_, i) => i !== index));
  };

  // Update bar
  const handleUpdateBar = (index: number, field: keyof RebarBarDefinition, value: any) => {
    const updated = [...bars];
    updated[index] = { ...updated[index], [field]: value };
    setBars(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="w-5 h-5" />
            Rebar Quantity, BBS & Costing Calculator
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('bars')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'bars'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bar Definitions
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'code'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Code Parameters & Pricing
          </button>
          <button
            onClick={() => setActiveTab('output')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'output'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Results
          </button>
        </div>

        {/* ===== TAB: BAR DEFINITIONS ===== */}
        {activeTab === 'bars' && (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {bars.map((bar, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="grid grid-cols-6 gap-2 items-end">
                      <div>
                        <Label className="text-xs">Mark</Label>
                        <Input
                          value={bar.mark}
                          onChange={(e) => handleUpdateBar(idx, 'mark', e.target.value)}
                          placeholder="M1"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Shape</Label>
                        <select
                          value={bar.shape}
                          onChange={(e) => handleUpdateBar(idx, 'shape', e.target.value)}
                          className="h-8 text-sm border rounded px-2 w-full"
                        >
                          {Object.values(RebarBarShape).map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Diameter</Label>
                        <select
                          value={bar.diameter_mm}
                          onChange={(e) => handleUpdateBar(idx, 'diameter_mm', parseInt(e.target.value))}
                          className="h-8 text-sm border rounded px-2 w-full"
                        >
                          {Object.values(RebarDiameter).filter(v => !isNaN(v as any)).map((v) => (
                            <option key={v} value={v}>{v}mm</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Grade</Label>
                        <select
                          value={bar.grade}
                          onChange={(e) => handleUpdateBar(idx, 'grade', e.target.value )}
                          className="h-8 text-sm border rounded px-2 w-full"
                        >
                          {Object.values(RebarGrade).map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Qty (pcs)</Label>
                        <Input
                          type="number"
                          value={bar.quantity_pcs}
                          onChange={(e) => handleUpdateBar(idx, 'quantity_pcs', parseInt(e.target.value) || 0)}
                          className="h-8 text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Element</Label>
                        <select
                          value={bar.element_type}
                          onChange={(e) => handleUpdateBar(idx, 'element_type', e.target.value)}
                          className="h-8 text-sm border rounded px-2 w-full"
                        >
                          {Object.values(RebarElementType).map((v) => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveBar(idx)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t text-xs">
                  <div>
                    <Label className="text-xs">Dimension A (mm)</Label>
                    <Input
                      type="number"
                      value={bar.dimension_a}
                      onChange={(e) => handleUpdateBar(idx, 'dimension_a', parseInt(e.target.value) || 0)}
                      placeholder="5000"
                      className="h-8 text-sm"
                    />
                  </div>
                  {bar.shape !== RebarBarShape.STRAIGHT && (
                    <>
                      <div>
                        <Label className="text-xs">Dimension B (mm)</Label>
                        <Input
                          type="number"
                          value={bar.dimension_b}
                          onChange={(e) => handleUpdateBar(idx, 'dimension_b', parseInt(e.target.value) || 0)}
                          placeholder="Optional"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Dimension C (mm)</Label>
                        <Input
                          type="number"
                          value={bar.dimension_c}
                          onChange={(e) => handleUpdateBar(idx, 'dimension_c', parseInt(e.target.value) || 0)}
                          placeholder="Optional"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Dimension D (mm)</Label>
                        <Input
                          type="number"
                          value={bar.dimension_d}
                          onChange={(e) => handleUpdateBar(idx, 'dimension_d', parseInt(e.target.value) || 0)}
                          placeholder="Optional"
                          className="h-8 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))}

            <Button
              onClick={handleAddBar}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Bar Definition
            </Button>
          </div>
        )}

        {/* ===== TAB: CODE PARAMETERS & PRICING ===== */}
        {activeTab === 'code' && (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Code Parameters */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span>🏗️ Code Parameters (NSCP/ACI Standards)</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Concrete Cover (mm)</Label>
                  <Input
                    type="number"
                    value={codeParams.concrete_cover_mm}
                    onChange={(e) => setCodeParams({...codeParams, concrete_cover_mm: parseInt(e.target.value) || 40})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Hook Length Rule (d)</Label>
                  <Input
                    type="number"
                    value={codeParams.hook_length_rule}
                    onChange={(e) => setCodeParams({...codeParams, hook_length_rule: parseInt(e.target.value) || 9})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Lap Splice Rule (d)</Label>
                  <Input
                    type="number"
                    value={codeParams.lap_splice_rule}
                    onChange={(e) => setCodeParams({...codeParams, lap_splice_rule: parseInt(e.target.value) || 40})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">90° Bend Deduction (d)</Label>
                  <Input
                    type="number"
                    value={codeParams.bend_deduction_90}
                    onChange={(e) => setCodeParams({...codeParams, bend_deduction_90: parseInt(e.target.value) || 10})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">135° Bend Deduction (d)</Label>
                  <Input
                    type="number"
                    value={codeParams.bend_deduction_135}
                    onChange={(e) => setCodeParams({...codeParams, bend_deduction_135: parseInt(e.target.value) || 10})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">180° Bend Deduction (d)</Label>
                  <Input
                    type="number"
                    value={codeParams.bend_deduction_180}
                    onChange={(e) => setCodeParams({...codeParams, bend_deduction_180: parseInt(e.target.value) || 6})}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Wastage (%)</Label>
                  <Input
                    type="number"
                    value={codeParams.wastage_percent}
                    onChange={(e) => setCodeParams({...codeParams, wastage_percent: parseInt(e.target.value) || 5})}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </Card>

            {/* Costing & Procurement */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <span>💰 Costing & Procurement</span>
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Material Price per kg (₱)</Label>
                  <Input
                    type="number"
                    value={materialPricePerKg}
                    onChange={(e) => setMaterialPricePerKg(parseInt(e.target.value) || 280)}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current: Grade 60, 16mm: ₱305/kg</p>
                </div>
                <div>
                  <Label className="text-xs">Labor Rate (₱/day)</Label>
                  <Input
                    type="number"
                    value={laborRatePerDay}
                    onChange={(e) => setLaborRatePerDay(parseInt(e.target.value) || 1300)}
                    className="h-8 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Steel worker: 0.008 mandays/kg</p>
                </div>
                <div>
                  <Label className="text-xs">Stock Lengths (m) - Comma Separated</Label>
                  <Input
                    value={stockLengths.join(', ')}
                    onChange={(e) => setStockLengths(e.target.value.split(',').map(v => parseFloat(v.trim()) || 0).filter(v => v > 0))}
                    placeholder="6, 7.5, 9, 12"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ===== TAB: RESULTS ===== */}
        {activeTab === 'output' && (
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {!results ? (
              <div className="text-center py-8 text-gray-500">
                Click "Calculate" to generate BBS, costing, and cutting plans
              </div>
            ) : (
              <>
                {/* Validation Warnings */}
                {results.validation_warnings.length > 0 && (
                  <Card className="p-3 border-amber-200 bg-amber-50">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-amber-900">Validation Warnings:</h4>
                        <ul className="text-xs text-amber-800 mt-1 space-y-1">
                          {results.validation_warnings.map((w, i) => <li key={i}>• {w}</li>)}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-3">
                  <Card className="p-3">
                    <p className="text-xs text-gray-600">Total Rebar</p>
                    <p className="text-xl font-bold text-blue-600">{results.total_rebar_kg.toFixed(1)} kg</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-600">Total Bars</p>
                    <p className="text-xl font-bold">{results.total_bars_count} pcs</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-600">Total Cost</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(results.costing.total_cost_php)}</p>
                  </Card>
                  <Card className="p-3">
                    <p className="text-xs text-gray-600">Cost per kg</p>
                    <p className="text-xl font-bold">{formatCurrency(results.costing.cost_per_kg)}</p>
                  </Card>
                </div>

                {/* Costing Breakdown */}
                <Card className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Cost Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Material Cost (Rebar)</span>
                      <span className="font-medium">{formatCurrency(results.costing.material_cost_php)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tie Wire ({results.costing.tie_wire_kg.toFixed(2)} kg)</span>
                      <span className="font-medium">{formatCurrency(results.costing.tie_wire_cost_php)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor ({results.costing.labor_hours.toFixed(1)} hours)</span>
                      <span className="font-medium">{formatCurrency(results.costing.labor_cost_php)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>TOTAL COST</span>
                      <span className="text-green-600">{formatCurrency(results.costing.total_cost_php)}</span>
                    </div>
                  </div>
                </Card>

                {/* Summary by Diameter */}
                {Object.keys(results.summary_by_diameter).length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-sm mb-3">Summary by Diameter</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2">Ø (mm)</th>
                            <th className="text-right p-2">Total kg</th>
                            <th className="text-right p-2">Bars (pcs)</th>
                            <th className="text-right p-2">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(results.summary_by_diameter).map((row: any) => (
                            <tr key={row.diameter_mm} className="border-b hover:bg-gray-50">
                              <td className="p-2">{row.diameter_mm}</td>
                              <td className="text-right p-2">{row.total_kg.toFixed(1)}</td>
                              <td className="text-right p-2">{row.total_bars}</td>
                              <td className="text-right p-2 font-medium">{formatCurrency(row.cost_php)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* BBS Schedule */}
                {results.bbs.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-sm mb-3">Bill of Bars (BBS) Schedule</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2">Mark</th>
                            <th className="text-left p-2">Shape</th>
                            <th className="text-right p-2">Ø</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Net (m)</th>
                            <th className="text-right p-2">Gross (m)</th>
                            <th className="text-right p-2">Weight/bar</th>
                            <th className="text-right p-2">Total kg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.bbs.map((entry, i) => (
                            <tr key={i} className="border-b hover:bg-gray-50">
                              <td className="p-2 font-medium">{entry.mark}</td>
                              <td className="p-2">{entry.shape}</td>
                              <td className="text-right p-2">{entry.diameter_mm}</td>
                              <td className="text-right p-2">{entry.quantity_pcs}</td>
                              <td className="text-right p-2">{entry.net_length_m.toFixed(2)}</td>
                              <td className="text-right p-2 font-medium">{entry.gross_length_m.toFixed(2)}</td>
                              <td className="text-right p-2">{entry.weight_per_bar_kg.toFixed(3)}</td>
                              <td className="text-right p-2 font-bold text-blue-600">{entry.total_weight_kg.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* Cutting Plans */}
                {results.cutting_plans.length > 0 && (
                  <Card className="p-4">
                    <h3 className="font-semibold text-sm mb-3">Cutting Plan Optimization</h3>
                    <div className="space-y-3">
                      {results.cutting_plans.map((plan, idx) => (
                        <div key={idx} className="border rounded p-3 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold">{plan.stock_length_m}m Stock Length</span>
                            <div className="text-xs text-right">
                              <p>Efficiency: <span className="text-green-600 font-bold">{plan.efficiency_percent.toFixed(1)}%</span></p>
                              <p>Bundles: <span className="font-bold">{plan.bundle_count}</span></p>
                            </div>
                          </div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-white">
                                <th className="text-left p-2">Mark</th>
                                <th className="text-right p-2">Length (m)</th>
                                <th className="text-right p-2">Qty</th>
                                <th className="text-right p-2">Total (m)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {plan.segments.map((seg, si) => (
                                <tr key={si} className="border-t">
                                  <td className="p-2">{seg.mark}</td>
                                  <td className="text-right p-2">{seg.gross_length_m.toFixed(2)}</td>
                                  <td className="text-right p-2">{seg.quantity}</td>
                                  <td className="text-right p-2 font-medium">{(seg.gross_length_m * seg.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr className="bg-white border-t font-bold">
                                <td colSpan={3} className="p-2">Used / Total</td>
                                <td className="text-right p-2">{plan.used_length_m.toFixed(2)} / {plan.stock_length_m}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleCalculate} className="bg-blue-600 hover:bg-blue-700">
            <CalcIcon className="w-4 h-4 mr-2" />
            Calculate
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs: { bars, code_params: codeParams, material_price_per_kg: materialPricePerKg, labor_rate_php_per_day: laborRatePerDay, procurement_stock_lengths: stockLengths } } as any)}>
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// FINISHES & COATINGS CALCULATOR MODAL (COMPREHENSIVE)
// ============================================================================

interface FinishesCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: FinishesCalculatorOutputs & { inputs: FinishesCalculatorInputs }) => void;
}

export function FinishesCalculatorModal({ open, onClose, onApply }: FinishesCalculatorModalProps) {
  const [inputs, setInputs] = useState<FinishesCalculatorInputs>({
    // Geometry
    wall_area_m2: 100,
    ceiling_area_m2: 50,
    height_m: 3.5,
    openings_deduction_m2: 15,
    number_of_rooms: 5,
    
    // Surface condition
    finish_system: FinishSystemType.INTERIOR_LATEX,
    substrate_type: SubstrateType.CHB_PLASTERED,
    is_new_surface: true,
    roughness_level: 'MEDIUM',
    moisture_exposure: 'NONE',
    is_exterior: false,
    
    // Paint system parameters
    coats_required: 2,
    product_coverage_m2_per_liter: 12,
    wastage_percent: 10,
    primer_type: 'LATEX_PRIMER',
    
    // Costing (PHP)
    skim_coat_price_per_kg: 120,
    primer_price_per_liter: 450,
    topcoat_price_per_liter: 650,
    labor_rate_php_per_day: 1500,
    painter_productivity_m2_per_day: 30,
  });
  const [results, setResults] = useState<FinishesCalculatorOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const calculate = () => {
    const output = calculateFinishes(inputs);
    setResults(output);
    setActiveTab('output');
  };

  useEffect(() => {
    if (open) {
      calculate();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Finishes & Coatings Calculator
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'input' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('input')}
          >
            Input Details
          </Button>
          <Button
            variant={activeTab === 'output' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('output')}
          >
            Results
          </Button>
        </div>

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Geometry Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Geometry</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wall_area">Wall Area (m²)</Label>
                  <Input
                    id="wall_area"
                    type="number"
                    step="0.1"
                    value={inputs.wall_area_m2}
                    onChange={(e) => setInputs({ ...inputs, wall_area_m2: parseFloat(e.target.value) || 0 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ceiling_area">Ceiling Area (m²)</Label>
                  <Input
                    id="ceiling_area"
                    type="number"
                    step="0.1"
                    value={inputs.ceiling_area_m2}
                    onChange={(e) => setInputs({ ...inputs, ceiling_area_m2: parseFloat(e.target.value) || 0 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    value={inputs.height_m}
                    onChange={(e) => setInputs({ ...inputs, height_m: parseFloat(e.target.value) || 0 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openings">Openings Deduction (m²)</Label>
                  <Input
                    id="openings"
                    type="number"
                    step="0.1"
                    value={inputs.openings_deduction_m2}
                    onChange={(e) => setInputs({ ...inputs, openings_deduction_m2: parseFloat(e.target.value) || 0 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Number of Rooms</Label>
                  <Input
                    id="rooms"
                    type="number"
                    step="1"
                    min="1"
                    value={inputs.number_of_rooms}
                    onChange={(e) => setInputs({ ...inputs, number_of_rooms: parseInt(e.target.value) || 1 })}
                    className="bg-blue-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Finish System Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Finish System</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="finish_system">Finish System Type</Label>
                  <select
                    id="finish_system"
                    value={inputs.finish_system}
                    onChange={(e) => setInputs({ ...inputs, finish_system: e.target.value as FinishSystemType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    {Object.values(FinishSystemType).map((system) => (
                      <option key={system} value={system}>{system}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="substrate">Substrate Type</Label>
                  <select
                    id="substrate"
                    value={inputs.substrate_type}
                    onChange={(e) => setInputs({ ...inputs, substrate_type: e.target.value as SubstrateType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    {Object.values(SubstrateType).map((substrate) => (
                      <option key={substrate} value={substrate}>{substrate}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roughness">Roughness Level</Label>
                  <select
                    id="roughness"
                    value={inputs.roughness_level}
                    onChange={(e) => setInputs({ ...inputs, roughness_level: e.target.value as 'SMOOTH' | 'MEDIUM' | 'ROUGH' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="SMOOTH">Smooth</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="ROUGH">Rough</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture Exposure</Label>
                  <select
                    id="moisture"
                    value={inputs.moisture_exposure}
                    onChange={(e) => setInputs({ ...inputs, moisture_exposure: e.target.value as 'NONE' | 'MODERATE' | 'HIGH' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="NONE">None (Interior)</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High (Wet areas)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_surface">
                    <input
                      id="new_surface"
                      type="checkbox"
                      checked={inputs.is_new_surface}
                      onChange={(e) => setInputs({ ...inputs, is_new_surface: e.target.checked })}
                      className="mr-2"
                    />
                    New Surface
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exterior">
                    <input
                      id="exterior"
                      type="checkbox"
                      checked={inputs.is_exterior}
                      onChange={(e) => setInputs({ ...inputs, is_exterior: e.target.checked })}
                      className="mr-2"
                    />
                    Exterior
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Paint Parameters Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Paint System Parameters</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coats">Coats Required</Label>
                  <Input
                    id="coats"
                    type="number"
                    step="1"
                    min="1"
                    max="5"
                    value={inputs.coats_required}
                    onChange={(e) => setInputs({ ...inputs, coats_required: parseInt(e.target.value) || 1 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage (m²/liter)</Label>
                  <Input
                    id="coverage"
                    type="number"
                    step="0.5"
                    value={inputs.product_coverage_m2_per_liter}
                    onChange={(e) => setInputs({ ...inputs, product_coverage_m2_per_liter: parseFloat(e.target.value) || 12 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wastage">Wastage (%)</Label>
                  <Input
                    id="wastage"
                    type="number"
                    step="1"
                    value={inputs.wastage_percent}
                    onChange={(e) => setInputs({ ...inputs, wastage_percent: parseFloat(e.target.value) || 10 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primer">Primer Type</Label>
                  <select
                    id="primer"
                    value={inputs.primer_type}
                    onChange={(e) => setInputs({ ...inputs, primer_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="NONE">None</option>
                    <option value="LATEX_PRIMER">Latex Primer</option>
                    <option value="OIL_PRIMER">Oil Primer</option>
                    <option value="EPOXY_PRIMER">Epoxy Primer</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Costing Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Costing (PHP)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skim_price">Skim Coat (₱/kg)</Label>
                  <Input
                    id="skim_price"
                    type="number"
                    step="10"
                    value={inputs.skim_coat_price_per_kg}
                    onChange={(e) => setInputs({ ...inputs, skim_coat_price_per_kg: parseFloat(e.target.value) || 120 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primer_price">Primer (₱/liter)</Label>
                  <Input
                    id="primer_price"
                    type="number"
                    step="10"
                    value={inputs.primer_price_per_liter}
                    onChange={(e) => setInputs({ ...inputs, primer_price_per_liter: parseFloat(e.target.value) || 450 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topcoat_price">Topcoat (₱/liter)</Label>
                  <Input
                    id="topcoat_price"
                    type="number"
                    step="10"
                    value={inputs.topcoat_price_per_liter}
                    onChange={(e) => setInputs({ ...inputs, topcoat_price_per_liter: parseFloat(e.target.value) || 650 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor_rate">Labor Rate (₱/day)</Label>
                  <Input
                    id="labor_rate"
                    type="number"
                    step="50"
                    value={inputs.labor_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, labor_rate_php_per_day: parseFloat(e.target.value) || 1500 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productivity">Painter Productivity (m²/day)</Label>
                  <Input
                    id="productivity"
                    type="number"
                    step="1"
                    value={inputs.painter_productivity_m2_per_day}
                    onChange={(e) => setInputs({ ...inputs, painter_productivity_m2_per_day: parseFloat(e.target.value) || 30 })}
                    className="bg-yellow-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex justify-end">
              <Button onClick={calculate} className="bg-blue-600 hover:bg-blue-700">
                <CalcIcon className="w-4 h-4 mr-2" />
                Calculate Results
              </Button>
            </div>
          </div>
        )}

        {/* OUTPUT TAB */}
        {activeTab === 'output' && results && (
          <div className="space-y-6">
            {/* Material Quantities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Material Quantities</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {results.skim_coat_kg && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="font-medium">Skim Coat</span>
                    <span className="font-bold">{results.skim_coat_kg.toFixed(1)} kg</span>
                  </div>
                )}
                {results.primer_liters && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="font-medium">Primer</span>
                    <span className="font-bold">{results.primer_liters.toFixed(1)} liters</span>
                  </div>
                )}
                {results.topcoat_liters && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="font-medium">Topcoat</span>
                    <span className="font-bold">{results.topcoat_liters.toFixed(1)} liters</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">Total Area</span>
                  <span className="font-bold">{results.total_finish_area_m2.toFixed(1)} m²</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">Paint Rollers</span>
                  <span className="font-bold">{results.paint_rollers_qty} pcs</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">Masking Tape</span>
                  <span className="font-bold">{results.masking_tape_rolls} rolls</span>
                </div>
              </CardContent>
            </Card>

            {/* Labor Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Labor Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">Surface Preparation</span>
                  <span className="font-bold">{results.surface_prep_labor_mh} MH</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">Application</span>
                  <span className="font-bold">{results.application_labor_mh} MH</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-700 rounded text-white font-bold">
                  <span>Total Labor</span>
                  <span>{results.total_labor_mh} MH</span>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Estimated Duration: <strong>{results.estimated_duration_days} days</strong>
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Breakdown (PHP ₱)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border-b">
                  <span className="font-medium">Materials Cost</span>
                  <span className="font-bold">{formatCurrency(results.materials_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border-b">
                  <span className="font-medium">Labor Cost</span>
                  <span className="font-bold">{formatCurrency(results.labor_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border-b">
                  <span className="font-medium">Equipment Cost</span>
                  <span className="font-bold">{formatCurrency(results.equipment_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded border-b">
                  <span className="font-medium">Contingency (5%)</span>
                  <span className="font-bold">{formatCurrency(results.contingency_5_percent_php)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded font-bold text-lg">
                  <span>TOTAL COST</span>
                  <span>{formatCurrency(results.total_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span>Cost per m²</span>
                  <span className="font-bold">{formatCurrency(results.cost_per_m2_php)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Validation Warnings */}
            {results.validation_warnings && results.validation_warnings.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Warnings & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.validation_warnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-amber-800">
                      • {warning}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Suitability Checks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">System Suitability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">System Suitable</span>
                  <span className={`font-bold ${results.system_suitability ? 'text-green-600' : 'text-red-600'}`}>
                    {results.system_suitability ? 'YES' : 'NOT RECOMMENDED'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">Moisture Suitable</span>
                  <span className={`font-bold ${results.moisture_suitable ? 'text-green-600' : 'text-red-600'}`}>
                    {results.moisture_suitable ? 'YES' : 'CHECK COATING'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">Exterior Durable</span>
                  <span className={`font-bold ${results.exterior_durable ? 'text-green-600' : 'text-red-600'}`}>
                    {results.exterior_durable ? 'YES' : 'NOT FOR EXTERIOR'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs })} className="bg-green-600 hover:bg-green-700">
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// FLOORING CALCULATOR MODAL (COMPREHENSIVE)
// ============================================================================

interface FlooringCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: FlooringCalculatorOutputs & { inputs: FlooringCalculatorInputs }) => void;
}

const FLOORING_SYSTEMS = [
  { value: 'CERAMIC_TILE', label: 'Ceramic Tile' },
  { value: 'PORCELAIN_TILE', label: 'Porcelain Tile' },
  { value: 'NATURAL_STONE', label: 'Natural Stone (Granite / Marble)' },
  { value: 'VINYL_SPC', label: 'Vinyl SPC (Click-lock)' },
  { value: 'VINYL_LVT', label: 'Vinyl LVT (Luxury Plank)' },
  { value: 'RUBBER_FLOORING', label: 'Rubber Flooring (Sports/Industrial)' },
  { value: 'POLISHED_CONCRETE', label: 'Polished Concrete' },
  { value: 'EPOXY_COATING', label: 'Epoxy Coating (Resin)' },
  { value: 'WOOD_SOLID', label: 'Solid Hardwood' },
  { value: 'WOOD_ENGINEERED', label: 'Engineered Wood' },
  { value: 'LAMINATE', label: 'Laminate' },
  { value: 'BAMBOO', label: 'Bamboo' },
  { value: 'PAVERS', label: 'Concrete Pavers (External)' },
  { value: 'DECKING_WPC', label: 'WPC / Composite Decking' },
  { value: 'EPOXY_MORTAR', label: 'Epoxy Mortar (Industrial)' },
  { value: 'ANTI_STATIC', label: 'Anti-Static / ESD Flooring' },
  { value: 'CARPET_BROADLOOM', label: 'Carpet Broadloom' },
  { value: 'CARPET_TILES', label: 'Carpet Tiles' },
];

const SUBSTRATE_OPTIONS = [
  { value: 'CONCRETE_SLAB', label: 'Concrete Slab' },
  { value: 'STEEL_DECK_TOPPING', label: 'Steel Deck + Topping' },
  { value: 'EXISTING_TILE', label: 'Existing Tile (over)' },
  { value: 'WOOD_SUBFLOOR', label: 'Wood Subfloor' },
];

const MOISTURE_OPTIONS = [
  { value: 'DRY', label: 'Dry (Interior, no water exposure)' },
  { value: 'MODERATE', label: 'Moderate (Bathrooms, kitchens)' },
  { value: 'WET', label: 'Wet (Wet areas, showers)' },
  { value: 'EXTERIOR', label: 'Exterior (Exposed to elements)' },
];

export function FlooringCalculatorModal({ open, onClose, onApply }: FlooringCalculatorModalProps) {
  const [inputs, setInputs] = useState<FlooringCalculatorInputs>({
    // Area definition
    floor_area_m2: 100,
    number_of_rooms: 1,
    skirting_height_m: 0.15,
    openings_deductions_m2: 5,
    
    // Substrate
    substrate_type: 'CONCRETE_SLAB',
    moisture_condition: 'DRY',
    
    // Floor finish system
    finish_system: 'CERAMIC_TILE',
    
    // Dimensions
    tile_size_mm: 600,
    joint_width_mm: 3,
    screed_thickness_mm: 50,
    pattern_type: 'RUNNING_BOND',
    
    // Material parameters
    adhesive_type: 'CEMENT_BASED',
    grout_type: 'CEMENT',
    sealant_required: false,
    waterproofing_required: false,
    
    // Pricing (PHP)
    finish_material_price_per_m2: 800,
    adhesive_price_per_kg: 120,
    grout_price_per_kg: 150,
    screed_price_per_m3: 2500,
    skirting_price_per_linear_m: 400,
    sealant_price_per_liter: 500,
    labor_rate_php_per_day: 1800,
    tiler_productivity_m2_per_day: 20,
  });
  const [results, setResults] = useState<FlooringCalculatorOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const calculate = () => {
    const output = calculateFlooring(inputs);
    setResults(output);
    setActiveTab('output');
  };

  useEffect(() => {
    if (open) {
      calculate();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalcIcon className="h-5 w-5" />
            Flooring & Floor Finish Calculator
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'input' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('input')}
          >
            Input Details
          </Button>
          <Button
            variant={activeTab === 'output' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('output')}
          >
            Results & Costing
          </Button>
        </div>

        {/* INPUT TAB */}
        {activeTab === 'input' && (
          <div className="space-y-6">
            {/* Area Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Floor Area Definition</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor_area">Total Floor Area (m²)</Label>
                  <Input
                    id="floor_area"
                    type="number"
                    step="0.1"
                    value={inputs.floor_area_m2}
                    onChange={(e) => setInputs({ ...inputs, floor_area_m2: parseFloat(e.target.value) || 0 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">Number of Rooms/Zones</Label>
                  <Input
                    id="rooms"
                    type="number"
                    step="1"
                    min="1"
                    value={inputs.number_of_rooms}
                    onChange={(e) => setInputs({ ...inputs, number_of_rooms: parseInt(e.target.value) || 1 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skirting">Skirting Height (m)</Label>
                  <Input
                    id="skirting"
                    type="number"
                    step="0.01"
                    value={inputs.skirting_height_m}
                    onChange={(e) => setInputs({ ...inputs, skirting_height_m: parseFloat(e.target.value) || 0.15 })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openings">Openings Deduction (m²)</Label>
                  <Input
                    id="openings"
                    type="number"
                    step="0.1"
                    value={inputs.openings_deductions_m2}
                    onChange={(e) => setInputs({ ...inputs, openings_deductions_m2: parseFloat(e.target.value) || 0 })}
                    className="bg-blue-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Substrate & Conditions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Substrate & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="substrate">Substrate Type</Label>
                  <select
                    id="substrate"
                    value={inputs.substrate_type}
                    onChange={(e) => setInputs({ ...inputs, substrate_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    {SUBSTRATE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moisture">Moisture Condition</Label>
                  <select
                    id="moisture"
                    value={inputs.moisture_condition}
                    onChange={(e) => setInputs({ ...inputs, moisture_condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    {MOISTURE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Finish System Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Floor Finish System (18 Options)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="finish_system">Select Flooring Type</Label>
                  <select
                    id="finish_system"
                    value={inputs.finish_system}
                    onChange={(e) => setInputs({ ...inputs, finish_system: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    {FLOORING_SYSTEMS.map((sys) => (
                      <option key={sys.value} value={sys.value}>{sys.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Includes: Ceramic, Porcelain, Stone, Vinyl (SPC/LVT), Rubber, Concrete, Epoxy, Wood, Laminate, Bamboo, Pavers, Decking, Industrial, Anti-Static, Carpet
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Parameters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">System Parameters</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tile_size">Tile Size (mm)</Label>
                  <select
                    id="tile_size"
                    value={inputs.tile_size_mm?.toString() || '600'}
                    onChange={(e) => setInputs({ ...inputs, tile_size_mm: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="300">300x300 mm</option>
                    <option value="600">600x600 mm</option>
                    <option value="1200">1200x600 mm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joint_width">Joint Width (mm)</Label>
                  <Input
                    id="joint_width"
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={inputs.joint_width_mm || 3}
                    onChange={(e) => setInputs({ ...inputs, joint_width_mm: parseFloat(e.target.value) })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screed_thickness">Screed Thickness (mm)</Label>
                  <Input
                    id="screed_thickness"
                    type="number"
                    step="5"
                    min="40"
                    max="100"
                    value={inputs.screed_thickness_mm}
                    onChange={(e) => setInputs({ ...inputs, screed_thickness_mm: parseInt(e.target.value) })}
                    className="bg-blue-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pattern">Pattern Type</Label>
                  <select
                    id="pattern"
                    value={inputs.pattern_type || 'RUNNING_BOND'}
                    onChange={(e) => setInputs({ ...inputs, pattern_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="RUNNING_BOND">Running Bond</option>
                    <option value="HERRINGBONE">Herringbone</option>
                    <option value="DIAGONAL">Diagonal</option>
                    <option value="RANDOM">Random</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Material Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Material Specifications</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adhesive_type">Adhesive Type</Label>
                  <select
                    id="adhesive_type"
                    value={inputs.adhesive_type || 'CEMENT_BASED'}
                    onChange={(e) => setInputs({ ...inputs, adhesive_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="CEMENT_BASED">Cement-Based</option>
                    <option value="EPOXY">Epoxy</option>
                    <option value="POLYURETHANE">Polyurethane</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grout_type">Grout Type</Label>
                  <select
                    id="grout_type"
                    value={inputs.grout_type || 'CEMENT'}
                    onChange={(e) => setInputs({ ...inputs, grout_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-blue-50"
                  >
                    <option value="CEMENT">Cement Grout</option>
                    <option value="EPOXY">Epoxy Grout</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sealant">
                    <input
                      id="sealant"
                      type="checkbox"
                      checked={inputs.sealant_required || false}
                      onChange={(e) => setInputs({ ...inputs, sealant_required: e.target.checked })}
                      className="mr-2"
                    />
                    Sealant Required
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waterproofing">
                    <input
                      id="waterproofing"
                      type="checkbox"
                      checked={inputs.waterproofing_required || false}
                      onChange={(e) => setInputs({ ...inputs, waterproofing_required: e.target.checked })}
                      className="mr-2"
                    />
                    Waterproofing Required
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pricing (PHP ₱)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="finish_price">Finish Material (₱/m²)</Label>
                  <Input
                    id="finish_price"
                    type="number"
                    step="50"
                    value={inputs.finish_material_price_per_m2}
                    onChange={(e) => setInputs({ ...inputs, finish_material_price_per_m2: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adhesive_price">Adhesive (₱/kg)</Label>
                  <Input
                    id="adhesive_price"
                    type="number"
                    step="10"
                    value={inputs.adhesive_price_per_kg}
                    onChange={(e) => setInputs({ ...inputs, adhesive_price_per_kg: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grout_price">Grout (₱/kg)</Label>
                  <Input
                    id="grout_price"
                    type="number"
                    step="10"
                    value={inputs.grout_price_per_kg}
                    onChange={(e) => setInputs({ ...inputs, grout_price_per_kg: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screed_price">Screed (₱/m³)</Label>
                  <Input
                    id="screed_price"
                    type="number"
                    step="100"
                    value={inputs.screed_price_per_m3}
                    onChange={(e) => setInputs({ ...inputs, screed_price_per_m3: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skirting_price">Skirting (₱/lin.m)</Label>
                  <Input
                    id="skirting_price"
                    type="number"
                    step="50"
                    value={inputs.skirting_price_per_linear_m}
                    onChange={(e) => setInputs({ ...inputs, skirting_price_per_linear_m: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sealant_price">Sealant (₱/liter)</Label>
                  <Input
                    id="sealant_price"
                    type="number"
                    step="50"
                    value={inputs.sealant_price_per_liter}
                    onChange={(e) => setInputs({ ...inputs, sealant_price_per_liter: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="labor_rate">Labor Rate (₱/day)</Label>
                  <Input
                    id="labor_rate"
                    type="number"
                    step="100"
                    value={inputs.labor_rate_php_per_day}
                    onChange={(e) => setInputs({ ...inputs, labor_rate_php_per_day: parseFloat(e.target.value) || 0 })}
                    className="bg-yellow-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productivity">Tiler Productivity (m²/day)</Label>
                  <Input
                    id="productivity"
                    type="number"
                    step="1"
                    value={inputs.tiler_productivity_m2_per_day}
                    onChange={(e) => setInputs({ ...inputs, tiler_productivity_m2_per_day: parseFloat(e.target.value) || 20 })}
                    className="bg-yellow-50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Calculate Button */}
            <div className="flex justify-end">
              <Button onClick={calculate} className="bg-blue-600 hover:bg-blue-700">
                <CalcIcon className="w-4 h-4 mr-2" />
                Calculate Results
              </Button>
            </div>
          </div>
        )}

        {/* OUTPUT TAB */}
        {activeTab === 'output' && results && (
          <div className="space-y-6">
            {/* Material Quantities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Material Quantities by Layer</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium text-sm">Total Floor Area</span>
                  <span className="font-bold">{results.total_floor_area_m2.toFixed(1)} m²</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium text-sm">Skirting</span>
                  <span className="font-bold">{results.skirting_linear_m.toFixed(1)} lin.m</span>
                </div>
                {results.waterproofing_liters && (
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="font-medium text-sm">Waterproofing</span>
                    <span className="font-bold">{results.waterproofing_liters.toFixed(1)} L</span>
                  </div>
                )}
                {results.screed_volume_m3 && (
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="font-medium text-sm">Screed</span>
                    <span className="font-bold">{results.screed_volume_m3.toFixed(2)} m³</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium text-sm">Adhesive</span>
                  <span className="font-bold">{results.adhesive_kg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium text-sm">Grout</span>
                  <span className="font-bold">{results.grout_kg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium text-sm">Finish Material Qty</span>
                  <span className="font-bold">{results.finish_material_qty.toFixed(1)} (pcs/m²)</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium text-sm">Sealant</span>
                  <span className="font-bold">{results.sealant_liters.toFixed(1)} L</span>
                </div>
              </CardContent>
            </Card>

            {/* Labor Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Labor Hours by Phase</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-b">
                  <span className="font-medium text-sm">Substrate Prep</span>
                  <span className="font-bold">{results.substrate_prep_labor_mh} MH</span>
                </div>
                {results.waterproofing_labor_mh > 0 && (
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-b">
                    <span className="font-medium text-sm">Waterproofing</span>
                    <span className="font-bold">{results.waterproofing_labor_mh} MH</span>
                  </div>
                )}
                {results.screed_labor_mh > 0 && (
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-b">
                    <span className="font-medium text-sm">Screed / Leveling</span>
                    <span className="font-bold">{results.screed_labor_mh} MH</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-b">
                  <span className="font-medium text-sm">Installation</span>
                  <span className="font-bold">{results.installation_labor_mh} MH</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded border-b">
                  <span className="font-medium text-sm">Finishing</span>
                  <span className="font-bold">{results.finishing_labor_mh} MH</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-700 text-white rounded font-bold">
                  <span>Total Labor Hours</span>
                  <span>{results.total_labor_mh} MH</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                  Estimated Duration: <strong>{results.estimated_duration_days} days</strong> (at 8 MH/day)
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Cost Breakdown (PHP ₱)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Finish Materials</span>
                  <span className="font-bold">{formatCurrency(results.finish_material_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Base Layers (Screed, Waterproofing)</span>
                  <span className="font-bold">{formatCurrency(results.base_layer_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Adhesive & Grout</span>
                  <span className="font-bold">{formatCurrency(results.adhesive_grout_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Skirting</span>
                  <span className="font-bold">{formatCurrency(results.skirting_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Labor Cost</span>
                  <span className="font-bold">{formatCurrency(results.labor_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Equipment Rental</span>
                  <span className="font-bold">{formatCurrency(results.equipment_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded border-b text-sm">
                  <span className="font-medium">Contingency (5%)</span>
                  <span className="font-bold">{formatCurrency(results.contingency_5_percent_php)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded font-bold text-lg">
                  <span>TOTAL INSTALLED COST</span>
                  <span>{formatCurrency(results.total_cost_php)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm font-medium">
                  <span>Cost per m²</span>
                  <span className="font-bold">{formatCurrency(results.cost_per_m2_php)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Compliance & Validation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Compliance & Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Moisture Suitable</span>
                  <span className={`font-bold ${results.moisture_suitable ? 'text-green-600' : 'text-red-600'}`}>
                    {results.moisture_suitable ? '✓ OK' : '⚠ CHECK'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Movement Joints Required</span>
                  <span className={`font-bold ${results.movement_joints_required ? 'text-amber-600' : 'text-green-600'}`}>
                    {results.movement_joints_required ? '⚠ YES' : '✓ NO'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Min Thickness Check</span>
                  <span className={`font-bold ${results.min_thickness_check ? 'text-green-600' : 'text-red-600'}`}>
                    {results.min_thickness_check ? '✓ OK' : '⚠ THIN'}
                  </span>
                </div>
                {results.exterior_slip_rating && (
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium">Exterior Slip Rating</span>
                    <span className="font-bold">{results.exterior_slip_rating}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation Warnings */}
            {results.validation_warnings && results.validation_warnings.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    Important Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {results.validation_warnings.map((warning, idx) => (
                    <div key={idx} className="text-sm text-amber-800">
                      • {warning}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onApply && results && (
            <Button onClick={() => onApply({ ...results, inputs })} className="bg-green-600 hover:bg-green-700">
              Apply to BOQ
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
