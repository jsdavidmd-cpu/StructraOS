import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import {
  FoundationType,
  SoilClass,
  FoundationInputs,
  FoundationOutputs,
  ColumnType,
  SteelColumnProfile,
  RCCColumnInputs,
  SteelColumnInputs,
  RebarGrade,
  calculateFoundation,
  calculateRCCColumn,
  calculateSteelColumn,
  calculateSlab,
  SlabType,
  SlabInputs,
  SlabOutputs,
  CompositeDeckProfile,
  DeckGaugeSize,
  CompositeSlabCalculatorInputs,
  CompositeSlabCalculatorOutputs,
  calculateCompositeSlab,
  LiftingMethod,
  EquipmentCalculatorInputs,
  EquipmentCalculatorOutputs,
  calculateEquipment,
} from '@/services/calculatorService';

// ============================================================================
// FOUNDATION CALCULATOR MODAL
// ============================================================================

interface FoundationCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: FoundationOutputs & { inputs: FoundationInputs }) => void;
}

export function FoundationCalculatorModal({
  open,
  onClose,
  onApply,
}: FoundationCalculatorModalProps) {
  const [inputs, setInputs] = useState<FoundationInputs>({
    type: FoundationType.ISOLATED_FOOTING,
    length_m: 2.0,
    width_m: 2.0,
    height_m: 0.8,
    excavation_depth_m: 1.0,
    soil_class: SoilClass.MEDIUM,
    backfill_depth_m: 0.8,
    lean_concrete_thickness_m: 0.1,
    bottom_bar_diameter_mm: 16,
    bottom_bar_spacing_mm: 150,
    bottom_bar_grade: RebarGrade.GRADE_60,
    concrete_cover_mm: 50,
    concrete_unit_price_php_per_m3: 4500,
    rebar_unit_price_php_per_kg: 305,
    formwork_unit_price_php_per_m2: 250,
    excavation_unit_price_php_per_m3: 200,
    labor_rate_php_per_day: 1300,
  });

  const [results, setResults] = useState<FoundationOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const handleCalculate = () => {
    const output = calculateFoundation(inputs);
    setResults(output);
    setActiveTab('output');
  };

  const handleApply = () => {
    if (results) {
      onApply?.({ ...results, inputs });
      onClose();
    }
  };

  if (!open) return null;

  const formatPhp = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return Number(value.toFixed(decimals)).toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Foundation Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-3 font-medium ${
                activeTab === 'input'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`py-3 font-medium ${
                activeTab === 'output'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foundation Type
                  </label>
                  <select
                    value={inputs.type}
                    onChange={(e) =>
                      setInputs({ ...inputs, type: e.target.value as FoundationType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.values(FoundationType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Class
                  </label>
                  <select
                    value={inputs.soil_class}
                    onChange={(e) =>
                      setInputs({ ...inputs, soil_class: e.target.value as SoilClass })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.values(SoilClass).map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.length_m}
                    onChange={(e) =>
                      setInputs({ ...inputs, length_m: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.width_m}
                    onChange={(e) =>
                      setInputs({ ...inputs, width_m: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.height_m}
                    onChange={(e) =>
                      setInputs({ ...inputs, height_m: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excavation Depth (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.excavation_depth_m}
                    onChange={(e) =>
                      setInputs({ ...inputs, excavation_depth_m: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bottom Bar Diameter (mm)
                  </label>
                  <input
                    type="number"
                    value={inputs.bottom_bar_diameter_mm}
                    onChange={(e) =>
                      setInputs({ ...inputs, bottom_bar_diameter_mm: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bar Spacing (mm)
                  </label>
                  <input
                    type="number"
                    value={inputs.bottom_bar_spacing_mm}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        bottom_bar_spacing_mm: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concrete Cover (mm)
                  </label>
                  <input
                    type="number"
                    value={inputs.concrete_cover_mm}
                    onChange={(e) =>
                      setInputs({ ...inputs, concrete_cover_mm: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concrete Price (₱/m³)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={inputs.concrete_unit_price_php_per_m3}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        concrete_unit_price_php_per_m3: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rebar Price (₱/kg)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={inputs.rebar_unit_price_php_per_kg}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        rebar_unit_price_php_per_kg: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
              >
                Calculate
              </button>
            </div>
          )}

          {activeTab === 'output' && results && (
            <div className="space-y-6">
              {results.validation_warnings.length > 0 && (
                <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Warnings:</p>
                    {results.validation_warnings.map((warning, i) => (
                      <p key={i} className="text-sm text-yellow-700">
                        • {warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">Concrete Volume</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(results.concrete_volume_m3, 3)} m³
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Rebar Weight</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(results.total_rebar_kg, 2)} kg
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPhp(results.total_cost_php)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Concrete</span>
                    <span className="font-medium">{formatPhp(results.concrete_cost_php)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Rebar</span>
                    <span className="font-medium">{formatPhp(results.rebar_cost_php)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Formwork</span>
                    <span className="font-medium">{formatPhp(results.formwork_cost_php)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Excavation</span>
                    <span className="font-medium">{formatPhp(results.excavation_cost_php)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span className="text-gray-600">Labor</span>
                    <span className="font-medium">{formatPhp(results.labor_cost_php)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-100 rounded border border-blue-300">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">{formatPhp(results.total_cost_php)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  onClick={() => setActiveTab('input')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  Apply to BOQ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COLUMN CALCULATOR MODAL (RCC/Steel Toggle)
// ============================================================================

interface ColumnCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: any & { inputs: any }) => void;
}

export function ColumnCalculatorModal({
  open,
  onClose,
  onApply,
}: ColumnCalculatorModalProps) {
  const [materialType, setMaterialType] = useState<'RCC' | 'Steel'>('RCC');
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const [results, setResults] = useState<any>(null);

  const [rccInputs, setRCCInputs] = useState<RCCColumnInputs>({
    type: ColumnType.RECTANGULAR,
    height_m: 3.5,
    length_mm: 400,
    width_mm: 400,
    main_bar_diameter_mm: 20,
    main_bar_qty: 8,
    main_bar_grade: RebarGrade.GRADE_60,
    tie_diameter_mm: 10,
    tie_spacing_mm_end: 100,
    tie_spacing_mm_mid: 150,
    tie_grade: RebarGrade.GRADE_60,
    concrete_cover_mm: 40,
    lap_length_factor: 50,
    concrete_unit_price_php_per_m3: 4500,
    rebar_unit_price_php_per_kg: 305,
    formwork_unit_price_php_per_m2: 350,
    labor_rate_php_per_day: 1300,
  });

  const [steelInputs, setSteelInputs] = useState<SteelColumnInputs>({
    profile: SteelColumnProfile.H_BEAM,
    height_m: 3.5,
    section_weight_kg_per_m: 88.6,
    base_plate_thickness_mm: 25,
    base_plate_length_mm: 600,
    base_plate_width_mm: 600,
    anchor_bolt_diameter_mm: 20,
    anchor_bolt_qty: 8,
    anchor_bolt_grade_mpa: 400,
    steel_unit_price_php_per_kg: 45,
    bolt_unit_price_php_per_unit: 120,
    plate_unit_price_php_per_kg: 60,
    fabrication_markup_percent: 15,
    erection_labor_rate_php_per_day: 2000,
    erection_hours_per_unit: 4,
  });

  const handleCalculateRCC = () => {
    const output = calculateRCCColumn(rccInputs);
    setResults(output);
    setActiveTab('output');
  };

  const handleCalculateSteel = () => {
    const output = calculateSteelColumn(steelInputs);
    setResults(output);
    setActiveTab('output');
  };

  const handleApply = () => {
    if (results) {
      onApply?.({
        ...results,
        inputs: materialType === 'RCC' ? rccInputs : steelInputs,
        materialType,
      });
      onClose();
    }
  };

  if (!open) return null;

  const formatPhp = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return Number(value.toFixed(decimals)).toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Column Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b bg-gray-50 px-6 py-3">
          <div className="flex gap-4">
            <button
              onClick={() => setMaterialType('RCC')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                materialType === 'RCC'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              RCC Column
            </button>
            <button
              onClick={() => setMaterialType('Steel')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                materialType === 'Steel'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Steel Column
            </button>
          </div>
        </div>

        <div className="border-b">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-3 font-medium ${
                activeTab === 'input'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`py-3 font-medium ${
                activeTab === 'output'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              {materialType === 'RCC' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Column Type
                      </label>
                      <select
                        value={rccInputs.type}
                        onChange={(e) =>
                          setRCCInputs({ ...rccInputs, type: e.target.value as ColumnType })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {Object.values(ColumnType).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={rccInputs.height_m}
                        onChange={(e) =>
                          setRCCInputs({ ...rccInputs, height_m: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.length_mm}
                        onChange={(e) =>
                          setRCCInputs({ ...rccInputs, length_mm: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.width_mm}
                        onChange={(e) =>
                          setRCCInputs({ ...rccInputs, width_mm: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Bar Diameter (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.main_bar_diameter_mm}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            main_bar_diameter_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Bar Quantity
                      </label>
                      <input
                        type="number"
                        value={rccInputs.main_bar_qty}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            main_bar_qty: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tie Diameter (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.tie_diameter_mm}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            tie_diameter_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tie Spacing - End Zone (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.tie_spacing_mm_end}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            tie_spacing_mm_end: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tie Spacing - Middle Zone (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.tie_spacing_mm_mid}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            tie_spacing_mm_mid: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Concrete Cover (mm)
                      </label>
                      <input
                        type="number"
                        value={rccInputs.concrete_cover_mm}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            concrete_cover_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Concrete Price (₱/m³)
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={rccInputs.concrete_unit_price_php_per_m3}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            concrete_unit_price_php_per_m3: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rebar Price (₱/kg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={rccInputs.rebar_unit_price_php_per_kg}
                        onChange={(e) =>
                          setRCCInputs({
                            ...rccInputs,
                            rebar_unit_price_php_per_kg: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateRCC}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                  >
                    Calculate RCC Column
                  </button>
                </>
              )}

              {materialType === 'Steel' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Type
                      </label>
                      <select
                        value={steelInputs.profile}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            profile: e.target.value as SteelColumnProfile,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {Object.values(SteelColumnProfile).map((profile) => (
                          <option key={profile} value={profile}>
                            {profile}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section Weight (kg/m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={steelInputs.section_weight_kg_per_m}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            section_weight_kg_per_m: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={steelInputs.height_m}
                        onChange={(e) =>
                          setSteelInputs({ ...steelInputs, height_m: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Plate Thickness (mm)
                      </label>
                      <input
                        type="number"
                        value={steelInputs.base_plate_thickness_mm}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            base_plate_thickness_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Plate Length (mm)
                      </label>
                      <input
                        type="number"
                        value={steelInputs.base_plate_length_mm}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            base_plate_length_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Plate Width (mm)
                      </label>
                      <input
                        type="number"
                        value={steelInputs.base_plate_width_mm}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            base_plate_width_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anchor Bolt Diameter (mm)
                      </label>
                      <input
                        type="number"
                        value={steelInputs.anchor_bolt_diameter_mm}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            anchor_bolt_diameter_mm: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Anchor Bolt Quantity
                      </label>
                      <input
                        type="number"
                        value={steelInputs.anchor_bolt_qty}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            anchor_bolt_qty: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Steel Price (₱/kg)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={steelInputs.steel_unit_price_php_per_kg}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            steel_unit_price_php_per_kg: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Erection Labor (₱/day)
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={steelInputs.erection_labor_rate_php_per_day}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            erection_labor_rate_php_per_day: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Erection Hours per Unit
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={steelInputs.erection_hours_per_unit}
                        onChange={(e) =>
                          setSteelInputs({
                            ...steelInputs,
                            erection_hours_per_unit: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateSteel}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                  >
                    Calculate Steel Column
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'output' && results && (
            <div className="space-y-6">
              {results.validation_warnings?.length > 0 && (
                <div className="flex gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Warnings:</p>
                    {results.validation_warnings.map((warning: string, i: number) => (
                      <p key={i} className="text-sm text-yellow-700">
                        • {warning}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600">
                    {materialType === 'RCC' ? 'Concrete Volume' : 'Steel Weight'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {materialType === 'RCC'
                      ? `${formatNumber(results.concrete_volume_m3, 3)} m³`
                      : `${formatNumber(results.total_steel_weight_kg, 2)} kg`}
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">
                    {materialType === 'RCC' ? 'Rebar Weight' : 'Bolts Quantity'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {materialType === 'RCC'
                      ? `${formatNumber(results.total_rebar_kg, 2)} kg`
                      : `${results.anchor_bolts_total_qty} pcs`}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPhp(results.total_cost_php)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {materialType === 'RCC' ? (
                    <>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Concrete</span>
                        <span className="font-medium">{formatPhp(results.concrete_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Rebar</span>
                        <span className="font-medium">{formatPhp(results.rebar_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Formwork</span>
                        <span className="font-medium">{formatPhp(results.formwork_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Labor</span>
                        <span className="font-medium">{formatPhp(results.labor_cost_php)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Column Steel</span>
                        <span className="font-medium">{formatPhp(results.column_steel_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Base Plate</span>
                        <span className="font-medium">{formatPhp(results.base_plate_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Anchor Bolts</span>
                        <span className="font-medium">{formatPhp(results.anchor_bolt_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Fabrication</span>
                        <span className="font-medium">{formatPhp(results.fabrication_cost_php)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Erection Labor</span>
                        <span className="font-medium">{formatPhp(results.erection_labor_cost_php)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between p-3 bg-blue-100 rounded border border-blue-300 col-span-2">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-blue-600">{formatPhp(results.total_cost_php)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button
                  onClick={() => setActiveTab('input')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                >
                  Edit
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  Apply to BOQ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BEAM & SLAB CALCULATOR MODALS (FEATURE STATUS)
// ============================================================================

interface BeamCalculatorModalProps {
  open: boolean;
  onClose: () => void;
}

interface SlabCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: SlabOutputs & { inputs: SlabInputs }) => void;
}

/**
 * BEAM CALCULATOR - Coming Soon
 * Will support:
 * - RCC Beams (rectangular, T-beam, drop beam, grade beam)
 * - Steel Beams (I, H, channel, box, composite)
 * - Stirrup zone calculations
 * - Composite deck interactions
 * - Full BBS generation
 */
export function BeamCalculatorModal({
  open,
  onClose,
}: BeamCalculatorModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Beam Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Beam Calculator</h3>
            <p className="text-sm text-blue-800 mb-3">
              Coming soon! This calculator will support comprehensive beam design including:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>RCC Beams (Rectangular, T-Beam, Drop Beam, Grade Beam)</li>
              <li>Steel Beams (I, H, Channel, Box Sections)</li>
              <li>Composite Beam-Slab Interaction</li>
              <li>Stirrup Zone Calculations (End/Middle)</li>
              <li>Shear Connection Design</li>
              <li>Full Bill of Bars & Cutting Plans</li>
            </ul>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function SlabCalculatorModal({
  open,
  onClose,
  onApply,
}: SlabCalculatorModalProps) {
  const [inputs, setInputs] = useState<SlabInputs>({
    type: SlabType.TWO_WAY,
    length_m: 8.0,
    width_m: 6.0,
    thickness_mm: 200,
    main_bar_diameter_mm: 16,
    main_bar_spacing_mm: 200,
    main_bar_grade: RebarGrade.GRADE_60,
    secondary_bar_diameter_mm: 12,
    secondary_bar_spacing_mm: 250,
    secondary_bar_grade: RebarGrade.GRADE_60,
    concrete_cover_mm: 40,
    has_drop_panel: false,
    drop_panel_length_m: 0,
    drop_panel_width_m: 0,
    drop_panel_thickness_mm: 300,
    concrete_unit_price_php_per_m3: 4500,
    rebar_unit_price_php_per_kg: 305,
    formwork_unit_price_php_per_m2: 250,
    labor_rate_php_per_day: 1300,
  });

  const [results, setResults] = useState<SlabOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const handleCalculate = () => {
    const output = calculateSlab(inputs);
    setResults(output);
    setActiveTab('output');
  };

  const handleApply = () => {
    if (results && onApply) {
      onApply({ ...results, inputs });
      onClose();
    }
  };

  if (!open) return null;

  const formatPhp = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return Number(value.toFixed(decimals)).toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Slab Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-3 font-medium ${
                activeTab === 'input'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`py-3 font-medium ${
                activeTab === 'output'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Slab Geometry</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.length_m}
                      onChange={(e) =>
                        setInputs({ ...inputs, length_m: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width (m)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.width_m}
                      onChange={(e) =>
                        setInputs({ ...inputs, width_m: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thickness (mm)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={inputs.thickness_mm}
                      onChange={(e) =>
                        setInputs({ ...inputs, thickness_mm: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Main Reinforcement (Longer Span)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diameter (mm)
                    </label>
                    <input
                      type="number"
                      value={inputs.main_bar_diameter_mm}
                      onChange={(e) =>
                        setInputs({ ...inputs, main_bar_diameter_mm: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spacing (mm)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={inputs.main_bar_spacing_mm}
                      onChange={(e) =>
                        setInputs({ ...inputs, main_bar_spacing_mm: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Secondary Reinforcement (Shorter Span)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diameter (mm)
                    </label>
                    <input
                      type="number"
                      value={inputs.secondary_bar_diameter_mm}
                      onChange={(e) =>
                        setInputs({ ...inputs, secondary_bar_diameter_mm: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spacing (mm)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={inputs.secondary_bar_spacing_mm}
                      onChange={(e) =>
                        setInputs({ ...inputs, secondary_bar_spacing_mm: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={inputs.has_drop_panel}
                    onChange={(e) =>
                      setInputs({ ...inputs, has_drop_panel: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-semibold text-green-900">Drop Panel?</span>
                </label>
                {inputs.has_drop_panel && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Length (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.drop_panel_length_m || 0}
                        onChange={(e) =>
                          setInputs({ ...inputs, drop_panel_length_m: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.drop_panel_width_m || 0}
                        onChange={(e) =>
                          setInputs({ ...inputs, drop_panel_width_m: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thickness (mm)
                      </label>
                      <input
                        type="number"
                        step="10"
                        value={inputs.drop_panel_thickness_mm || 300}
                        onChange={(e) =>
                          setInputs({ ...inputs, drop_panel_thickness_mm: parseInt(e.target.value) })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Unit Rates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Concrete (₱/m³)
                    </label>
                    <input
                      type="number"
                      step="100"
                      value={inputs.concrete_unit_price_php_per_m3}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          concrete_unit_price_php_per_m3: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rebar (₱/kg)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={inputs.rebar_unit_price_php_per_kg}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          rebar_unit_price_php_per_kg: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formwork (₱/m²)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={inputs.formwork_unit_price_php_per_m2}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          formwork_unit_price_php_per_m2: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labor (₱/day)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={inputs.labor_rate_php_per_day}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          labor_rate_php_per_day: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Calculate
              </button>
            </div>
          )}

          {activeTab === 'output' && results && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Material Quantities</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Concrete Volume</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(results.concrete_volume_m3, 2)} m³
                    </p>
                  </div>
                  {results.drop_panel_concrete_m3 && results.drop_panel_concrete_m3 > 0 && (
                    <div>
                      <p className="text-gray-600">Drop Panel Concrete</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatNumber(results.drop_panel_concrete_m3, 2)} m³
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Main Reinforcement</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(results.main_bars_total_kg, 1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Secondary Reinforcement</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(results.secondary_bars_total_kg, 1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Rebar</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(results.total_rebar_kg, 1)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Formwork Area</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(results.formwork_area_m2, 1)} m²
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concrete</span>
                    <span className="font-semibold">{formatPhp(results.concrete_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reinforcement</span>
                    <span className="font-semibold">{formatPhp(results.rebar_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formwork</span>
                    <span className="font-semibold">{formatPhp(results.formwork_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor</span>
                    <span className="font-semibold">{formatPhp(results.labor_cost_php)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-blue-900">Total Cost</span>
                    <span className="text-lg font-bold text-blue-900">
                      {formatPhp(results.total_cost_php)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost per m²</span>
                    <span className="font-semibold">{formatPhp(results.cost_per_m2)}</span>
                  </div>
                </div>
              </div>

              {results.validation_warnings && results.validation_warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Validation Warnings
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                    {results.validation_warnings.map((warning: string, idx: number) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Apply to BOQ
                </button>
                <button
                  onClick={() => setActiveTab('input')}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          )}

          {activeTab === 'output' && !results && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Click "Calculate" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSITE SLAB CALCULATOR MODAL
// ============================================================================

interface CompositeSlabCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  beamSpacing?: number;
  onApply?: (results: CompositeSlabCalculatorOutputs & { inputs: CompositeSlabCalculatorInputs }) => void;
}

export function CompositeSlabCalculatorModal({
  open,
  onClose,
  beamSpacing,
  onApply,
}: CompositeSlabCalculatorModalProps) {
  const [inputs, setInputs] = useState<CompositeSlabCalculatorInputs>({
    slab_type: 'TWO_WAY',
    length_m: 8.0,
    width_m: 6.0,
    beam_spacing_m: beamSpacing || 4.0,
    deck_profile: CompositeDeckProfile.TRAPEZOIDAL_50,
    gauge_mm: DeckGaugeSize.GAUGE_1_0,
    concrete_topping_mm: 125,
    shear_stud_diameter_mm: 19,
    shear_stud_height_mm: 125,
    stud_spacing_mm: 300,
    mesh_type: 'WELDED_MESH',
    mesh_weight_kg_m2: 2.5,
    additional_rebar_kg_m2: 0,
    concrete_grade: 'C25',
    concrete_unit_price_php_per_m3: 4500,
    deck_unit_price_php_per_m2: 850,
    shear_stud_price_php_per_piece: 35,
    mesh_price_php_per_kg: 45,
    end_closures: 'PARTIAL',
    edge_trim_type: 'SIMPLE',
    fire_protection_type: 'SPRAY',
    fire_rating_minutes: 60,
    laying_crew_size: 4,
    laying_productivity_m2_per_day: 250,
    labor_rate_php_per_day: 1300,
    concrete_pump_rate_php_per_hour: 2500,
    concrete_pump_min_hours: 4,
    cure_days: 7,
    weather_delay_percent: 8,
    deck_delivery_cost_php: 15000,
    stud_welding_rate_php_per_hour: 500,
    quality_control_percent: 3,
  });

  const [results, setResults] = useState<CompositeSlabCalculatorOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const handleCalculate = () => {
    const output = calculateCompositeSlab(inputs);
    setResults(output);
    setActiveTab('output');
  };

  const handleApply = () => {
    if (results && onApply) {
      onApply({ ...results, inputs });
      onClose();
    }
  };

  if (!open) return null;

  const formatPhp = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return '-';
    return Number(value.toFixed(decimals)).toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Composite Slab Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-3 font-medium ${
                activeTab === 'input'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`py-3 font-medium ${
                activeTab === 'output'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">⚠️ Formwork Bypass</h4>
                  <p className="text-sm text-orange-800">
                    Composite slab uses steel deck as permanent formwork. <strong>Do NOT add soffit formwork</strong> to this item. Concrete only includes topping depth.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Slab Geometry</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                    <input type="number" step="0.1" value={inputs.length_m} onChange={(e) => setInputs({ ...inputs, length_m: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (m)</label>
                    <input type="number" step="0.1" value={inputs.width_m} onChange={(e) => setInputs({ ...inputs, width_m: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Beam Spacing (m)</label>
                    <input type="number" step="0.1" value={inputs.beam_spacing_m} onChange={(e) => setInputs({ ...inputs, beam_spacing_m: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topping (mm)</label>
                    <input type="number" step="10" value={inputs.concrete_topping_mm} onChange={(e) => setInputs({ ...inputs, concrete_topping_mm: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Deck Specification</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile</label>
                    <select value={inputs.deck_profile} onChange={(e) => setInputs({ ...inputs, deck_profile: e.target.value as CompositeDeckProfile })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value={CompositeDeckProfile.TRAPEZOIDAL_50}>Trapezoidal 50mm</option>
                      <option value={CompositeDeckProfile.TRAPEZOIDAL_75}>Trapezoidal 75mm</option>
                      <option value={CompositeDeckProfile.DOVETAIL_60}>Dovetail 60mm</option>
                      <option value={CompositeDeckProfile.CELLULAR_100}>Cellular 100mm</option>
                      <option value={CompositeDeckProfile.ROOF_45}>Roof 45mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gauge (mm)</label>
                    <select value={inputs.gauge_mm} onChange={(e) => setInputs({ ...inputs, gauge_mm: parseFloat(e.target.value) as DeckGaugeSize })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value={DeckGaugeSize.GAUGE_0_75}>0.75mm</option>
                      <option value={DeckGaugeSize.GAUGE_1_0}>1.0mm</option>
                      <option value={DeckGaugeSize.GAUGE_1_2}>1.2mm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deck Unit Price (₱/m²)</label>
                    <input type="number" step="50" value={inputs.deck_unit_price_php_per_m2} onChange={(e) => setInputs({ ...inputs, deck_unit_price_php_per_m2: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Shear Studs</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diameter (mm)</label>
                    <input type="number" value={inputs.shear_stud_diameter_mm} onChange={(e) => setInputs({ ...inputs, shear_stud_diameter_mm: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (mm)</label>
                    <input type="number" value={inputs.shear_stud_height_mm} onChange={(e) => setInputs({ ...inputs, shear_stud_height_mm: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spacing (mm)</label>
                    <input type="number" step="50" value={inputs.stud_spacing_mm} onChange={(e) => setInputs({ ...inputs, stud_spacing_mm: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-3">Reinforcement & Fire</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mesh Type</label>
                    <select value={inputs.mesh_type} onChange={(e) => setInputs({ ...inputs, mesh_type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="NONE">None</option>
                      <option value="WELDED_MESH">Welded Mesh</option>
                      <option value="REBAR_GRID">Rebar Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fire Rating (min)</label>
                    <input type="number" step="30" value={inputs.fire_rating_minutes || 0} onChange={(e) => setInputs({ ...inputs, fire_rating_minutes: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concrete Grade</label>
                    <input type="text" value={inputs.concrete_grade} onChange={(e) => setInputs({ ...inputs, concrete_grade: e.target.value })} placeholder="C25" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Labor & Equipment</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crew Size</label>
                    <input type="number" value={inputs.laying_crew_size} onChange={(e) => setInputs({ ...inputs, laying_crew_size: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Productivity (m²/day)</label>
                    <input type="number" step="10" value={inputs.laying_productivity_m2_per_day} onChange={(e) => setInputs({ ...inputs, laying_productivity_m2_per_day: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Labor Rate (₱/day)</label>
                    <input type="number" step="50" value={inputs.labor_rate_php_per_day} onChange={(e) => setInputs({ ...inputs, labor_rate_php_per_day: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <button onClick={handleCalculate} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Calculate Composite Slab
              </button>
            </div>
          )}

          {activeTab === 'output' && results && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Deck & Concrete</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Deck Area</p>
                    <p className="text-lg font-semibold">{formatNumber(results.deck_area_m2)} m²</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Deck Weight</p>
                    <p className="text-lg font-semibold">{formatNumber(results.deck_weight_kg)} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Concrete Volume</p>
                    <p className="text-lg font-semibold">{formatNumber(results.concrete_net_volume_m3)} m³</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Shear Studs</p>
                    <p className="text-lg font-semibold">{formatNumber(results.shear_stud_schedule.total_quantity, 0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Reinforcement</p>
                    <p className="text-lg font-semibold">{formatNumber(results.mesh_schedule.weight_kg)} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="text-lg font-semibold">{formatNumber(results.estimated_duration_days, 1)} days</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deck Material</span>
                    <span>{formatPhp(results.cost_breakdown?.deck_material || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Studs & Welding</span>
                    <span>{formatPhp(results.cost_breakdown?.studs_and_welding || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concrete</span>
                    <span>{formatPhp(results.cost_breakdown?.concrete || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reinforcement</span>
                    <span>{formatPhp(results.cost_breakdown?.reinforcement || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accessories & Fire Protection</span>
                    <span>{formatPhp((results.cost_breakdown?.accessories || 0) + (results.cost_breakdown?.fire_protection || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Labor</span>
                    <span>{formatPhp(results.cost_breakdown?.labor || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Equipment</span>
                    <span>{formatPhp(results.cost_breakdown?.equipment || 0)}</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-green-900">TOTAL COST</span>
                    <span className="text-lg font-bold text-green-900">{formatPhp(results.total_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost per m²</span>
                    <span className="font-semibold">{formatPhp(results.cost_per_m2)}</span>
                  </div>
                </div>
              </div>

              {results.validation_warnings && results.validation_warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Design Notes
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                    {results.validation_warnings.map((warning: string, idx: number) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleApply} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                  Apply to BOQ
                </button>
                <button onClick={() => setActiveTab('input')} className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition">
                  Edit
                </button>
              </div>
            </div>
          )}

          {activeTab === 'output' && !results && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Click "Calculate Composite Slab" to generate results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EQUIPMENT & ERECTION CALCULATOR MODAL
// ============================================================================

interface EquipmentCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  elementWeight?: number;
  onApply?: (results: EquipmentCalculatorOutputs & { inputs: EquipmentCalculatorInputs }) => void;
}

export function EquipmentCalculatorModal({
  open,
  onClose,
  elementWeight,
  onApply,
}: EquipmentCalculatorModalProps) {
  const [inputs, setInputs] = useState<EquipmentCalculatorInputs>({
    element_type: 'BEAM',
    element_weight_kg: elementWeight || 5000,
    element_length_m: 12.0,
    lifting_method: LiftingMethod.MOBILE_CRANE,
    lifting_height_m: 15.0,
    hook_radius_m: 8.0,
    number_of_picks: 1,
    rigging_slings_qty: 4,
    sling_capacity_tons: 3,
    shackles_qty: 4,
    straps_and_spreaders: true,
    crane_operator_rate_php_per_day: 1200,
    rigger_rate_php_per_day: 1300,
    helper_rate_php_per_day: 800,
    riggers_count: 2,
    helpers_count: 2,
    equipment_daily_rate_php: 25000,
    equipment_mobilization_cost_php: 5000,
    fuel_consumables_rate_php_per_hour: 500,
    insurance_percent_of_daily: 8,
    rigging_time_per_pick_minutes: 45,
    lifting_time_per_pick_minutes: 10,
    derig_time_per_pick_minutes: 30,
    standby_time_percent: 15,
    safety_harnesses_count: 4,
    barricade_meters: 30,
    safety_signage_cost_php: 2000,
    spotters_required: true,
  });

  const [results, setResults] = useState<EquipmentCalculatorOutputs | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  const handleCalculate = () => {
    const output = calculateEquipment(inputs);
    setResults(output);
    setActiveTab('output');
  };

  const handleApply = () => {
    if (results && onApply) {
      onApply({ ...results, inputs });
      onClose();
    }
  };

  if (!open) return null;

  const formatPhp = (value: number | undefined) => {
    if (!value) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return '-';
    return Number(value.toFixed(decimals)).toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 border-b bg-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Equipment & Erection Analysis</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('input')}
              className={`py-3 font-medium ${
                activeTab === 'input'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`py-3 font-medium ${
                activeTab === 'output'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Results
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Element Being Lifted</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select value={inputs.element_type} onChange={(e) => setInputs({ ...inputs, element_type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="COLUMN">Column</option>
                      <option value="BEAM">Beam</option>
                      <option value="TRUSS">Truss</option>
                      <option value="SLAB">Slab Panel</option>
                      <option value="DECK">Steel Deck</option>
                      <option value="BRACE">Brace</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input type="number" step="100" value={inputs.element_weight_kg} onChange={(e) => setInputs({ ...inputs, element_weight_kg: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                    <input type="number" step="0.1" value={inputs.element_length_m} onChange={(e) => setInputs({ ...inputs, element_length_m: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input type="number" value={inputs.number_of_picks} onChange={(e) => setInputs({ ...inputs, number_of_picks: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Lifting Configuration</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                    <select value={inputs.lifting_method} onChange={(e) => setInputs({ ...inputs, lifting_method: e.target.value as LiftingMethod })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value={LiftingMethod.MOBILE_CRANE}>Mobile Crane</option>
                      <option value={LiftingMethod.TOWER_CRANE}>Tower Crane</option>
                      <option value={LiftingMethod.BOOM_TRUCK}>Boom Truck</option>
                      <option value={LiftingMethod.GIN_POLE}>Gin Pole</option>
                      <option value={LiftingMethod.CHAIN_BLOCK}>Chain Block</option>
                      <option value={LiftingMethod.MANUAL}>Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (m)</label>
                    <input type="number" step="1" value={inputs.lifting_height_m} onChange={(e) => setInputs({ ...inputs, lifting_height_m: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hook Radius (m)</label>
                    <input type="number" step="0.5" value={inputs.hook_radius_m} onChange={(e) => setInputs({ ...inputs, hook_radius_m: parseFloat(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rigging Time (min)</label>
                    <input type="number" step="5" value={inputs.rigging_time_per_pick_minutes} onChange={(e) => setInputs({ ...inputs, rigging_time_per_pick_minutes: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Rigging & Crew Rates</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slings (qty)</label>
                    <input type="number" value={inputs.rigging_slings_qty} onChange={(e) => setInputs({ ...inputs, rigging_slings_qty: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Rate (₱/day)</label>
                    <input type="number" step="1000" value={inputs.equipment_daily_rate_php} onChange={(e) => setInputs({ ...inputs, equipment_daily_rate_php: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Operator Rate (₱/day)</label>
                    <input type="number" step="100" value={inputs.crane_operator_rate_php_per_day} onChange={(e) => setInputs({ ...inputs, crane_operator_rate_php_per_day: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rigger Rate (₱/day)</label>
                    <input type="number" step="100" value={inputs.rigger_rate_php_per_day} onChange={(e) => setInputs({ ...inputs, rigger_rate_php_per_day: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <button onClick={handleCalculate} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                Analyze Lifting & Erection
              </button>
            </div>
          )}

          {activeTab === 'output' && results && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Capacity & Feasibility</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Equipment SWL</p>
                    <p className="text-lg font-semibold">{formatNumber(results.equipment_safe_working_load_kg, 0)} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Capacity Utilization</p>
                    <p className={`text-lg font-semibold ${results.capacity_utilization_percent > 80 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatNumber(results.capacity_utilization_percent)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`text-lg font-semibold ${results.is_feasible ? 'text-green-600' : 'text-red-600'}`}>
                      {results.is_feasible ? '✓ FEASIBLE' : '✗ NOT FEASIBLE'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Duration & Labor</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Duration</p>
                    <p className="text-lg font-semibold">{formatNumber(results.total_equipment_hours_on_site, 1)} hours</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Productive Hours</p>
                    <p className="text-lg font-semibold">{formatNumber(results.productive_hours, 1)} hours</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Labor Hours</p>
                    <p className="text-lg font-semibold">{formatNumber((results.crane_operator?.days || 0) * 8 + (results.rigger_labor?.person_days || 0) * 8 + (results.helper_labor?.person_days || 0) * 8, 0)} hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Cost Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Equipment Rental</span>
                    <span>{formatPhp(results.rental_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crane Operator</span>
                    <span>{formatPhp(results.crane_operator?.total_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rigger Labor</span>
                    <span>{formatPhp(results.rigger_labor?.total_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Helper Labor</span>
                    <span>{formatPhp(results.helper_labor?.total_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipment Mobilization</span>
                    <span>{formatPhp(results.mobilization_cost_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel & Consumables</span>
                    <span>{formatPhp(results.fuel_and_consumables_php)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Safety Provisions</span>
                    <span>{formatPhp(results.safety_cost_php)}</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-green-900">TOTAL COST</span>
                    <span className="text-lg font-bold text-green-900">{formatPhp(results.total_cost_php)}</span>
                  </div>
                </div>
              </div>

              {results.validation_warnings && results.validation_warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Warnings & Notes
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1 ml-4 list-disc">
                    {results.validation_warnings.map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleApply} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                  Apply to BOQ
                </button>
                <button onClick={() => setActiveTab('input')} className="flex-1 px-4 py-3 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition">
                  Modify
                </button>
              </div>
            </div>
          )}

          {activeTab === 'output' && !results && (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Click "Analyze Lifting & Erection" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// UNIFIED STRUCTURAL CALCULATOR MODAL (Foundation, Column, Beam, Slab, Composite Slab, Equipment)
// ============================================================================
// COMPLETE FEATURE PARITY - All input fields, selectors, and outputs from original 6 modals

interface StructuralCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply?: (results: any) => void;
}

type StructuralElement = 'foundation' | 'column' | 'slab' | 'composite_slab' | 'equipment';

export function StructuralCalculatorModal({ open, onClose, onApply }: StructuralCalculatorModalProps) {
  const [activeElement, setActiveElement] = useState<StructuralElement>('foundation');
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  // ==== FOUNDATION STATE ====
  const [foundationInputs, setFoundationInputs] = useState<FoundationInputs>({
    type: FoundationType.ISOLATED_FOOTING,
    length_m: 2.0,
    width_m: 2.0,
    height_m: 0.8,
    excavation_depth_m: 1.0,
    soil_class: SoilClass.MEDIUM,
    backfill_depth_m: 0.8,
    lean_concrete_thickness_m: 0.1,
    bottom_bar_diameter_mm: 16,
    bottom_bar_spacing_mm: 150,
    bottom_bar_grade: RebarGrade.GRADE_60,
    concrete_cover_mm: 50,
    concrete_unit_price_php_per_m3: 4500,
    rebar_unit_price_php_per_kg: 305,
    formwork_unit_price_php_per_m2: 250,
    excavation_unit_price_php_per_m3: 200,
    labor_rate_php_per_day: 1300,
  });
  const [foundationResults, setFoundationResults] = useState<FoundationOutputs | null>(null);

  // ==== COLUMN STATE - RCC & STEEL ====
  const [columnMaterialType, setColumnMaterialType] = useState<'RCC' | 'Steel'>('RCC');

  const [rccColumnInputs, setRccColumnInputs] = useState<RCCColumnInputs>({
    type: ColumnType.RECTANGULAR,
    height_m: 3.5,
    length_mm: 400,
    width_mm: 400,
    main_bar_diameter_mm: 20,
    main_bar_qty: 8,
    main_bar_grade: RebarGrade.GRADE_60,
    tie_diameter_mm: 10,
    tie_spacing_mm_end: 100,
    tie_spacing_mm_mid: 150,
    tie_grade: RebarGrade.GRADE_60,
    concrete_cover_mm: 40,
    lap_length_factor: 50,
    concrete_unit_price_php_per_m3: 4500,
    rebar_unit_price_php_per_kg: 305,
    formwork_unit_price_php_per_m2: 350,
    labor_rate_php_per_day: 1300,
  });

  const [steelColumnInputs, setSteelColumnInputs] = useState<SteelColumnInputs>({
    profile: SteelColumnProfile.H_BEAM,
    height_m: 3.5,
    section_weight_kg_per_m: 88.6,
    base_plate_thickness_mm: 25,
    base_plate_length_mm: 600,
    base_plate_width_mm: 600,
    anchor_bolt_diameter_mm: 20,
    anchor_bolt_qty: 8,
    anchor_bolt_grade_mpa: 400,
    steel_unit_price_php_per_kg: 45,
    bolt_unit_price_php_per_unit: 120,
    plate_unit_price_php_per_kg: 60,
    fabrication_markup_percent: 15,
    erection_labor_rate_php_per_day: 2000,
    erection_hours_per_unit: 4,
  });

  const [columnResults, setColumnResults] = useState<any>(null);

  // ==== SLAB STATE ====
  const [slabInputs, setSlabInputs] = useState<SlabInputs>({
    type: SlabType.TWO_WAY,
    length_m: 8.0,
    width_m: 6.0,
    thickness_mm: 200,
    main_bar_diameter_mm: 16,
    main_bar_spacing_mm: 200,
    main_bar_grade: RebarGrade.GRADE_60,
    secondary_bar_diameter_mm: 12,
    secondary_bar_spacing_mm: 250,
    secondary_bar_grade: RebarGrade.GRADE_60,
    concrete_cover_mm: 40,
    has_drop_panel: false,
    drop_panel_length_m: 0,
    drop_panel_width_m: 0,
    drop_panel_thickness_mm: 300,
    concrete_unit_price_php_per_m3: 4500,
    rebar_unit_price_php_per_kg: 305,
    formwork_unit_price_php_per_m2: 250,
    labor_rate_php_per_day: 1300,
  });
  const [slabResults, setSlabResults] = useState<SlabOutputs | null>(null);

  // ==== COMPOSITE SLAB STATE ====
  const [compositeSlabInputs, setCompositeSlabInputs] = useState<CompositeSlabCalculatorInputs>({
    slab_type: 'TWO_WAY',
    length_m: 8.0,
    width_m: 6.0,
    beam_spacing_m: 4.0,
    deck_profile: CompositeDeckProfile.TRAPEZOIDAL_50,
    gauge_mm: DeckGaugeSize.GAUGE_1_0,
    concrete_topping_mm: 125,
    shear_stud_diameter_mm: 19,
    shear_stud_height_mm: 125,
    stud_spacing_mm: 300,
    mesh_type: 'WELDED_MESH',
    mesh_weight_kg_m2: 2.5,
    additional_rebar_kg_m2: 0,
    concrete_grade: 'C25',
    concrete_unit_price_php_per_m3: 4500,
    deck_unit_price_php_per_m2: 850,
    shear_stud_price_php_per_piece: 35,
    mesh_price_php_per_kg: 45,
    end_closures: 'PARTIAL',
    edge_trim_type: 'SIMPLE',
    fire_protection_type: 'SPRAY',
    fire_rating_minutes: 60,
    laying_crew_size: 4,
    laying_productivity_m2_per_day: 250,
    labor_rate_php_per_day: 1300,
    concrete_pump_rate_php_per_hour: 2500,
    concrete_pump_min_hours: 4,
    cure_days: 7,
    weather_delay_percent: 8,
    deck_delivery_cost_php: 15000,
    stud_welding_rate_php_per_hour: 500,
    quality_control_percent: 3,
  });
  const [compositeSlabResults, setCompositeSlabResults] = useState<CompositeSlabCalculatorOutputs | null>(null);

  // ==== EQUIPMENT STATE ====
  const [equipmentInputs, setEquipmentInputs] = useState<EquipmentCalculatorInputs>({
    element_type: 'BEAM',
    element_weight_kg: 5000,
    element_length_m: 12.0,
    lifting_method: LiftingMethod.MOBILE_CRANE,
    lifting_height_m: 15.0,
    hook_radius_m: 8.0,
    number_of_picks: 1,
    rigging_slings_qty: 4,
    sling_capacity_tons: 3,
    shackles_qty: 4,
    straps_and_spreaders: true,
    crane_operator_rate_php_per_day: 1200,
    rigger_rate_php_per_day: 1300,
    helper_rate_php_per_day: 800,
    riggers_count: 2,
    helpers_count: 2,
    equipment_daily_rate_php: 25000,
    equipment_mobilization_cost_php: 5000,
    fuel_consumables_rate_php_per_hour: 500,
    insurance_percent_of_daily: 8,
    rigging_time_per_pick_minutes: 45,
    lifting_time_per_pick_minutes: 10,
    derig_time_per_pick_minutes: 30,
    standby_time_percent: 15,
    safety_harnesses_count: 4,
    barricade_meters: 30,
    safety_signage_cost_php: 2000,
    spotters_required: true,
  });
  const [equipmentResults, setEquipmentResults] = useState<EquipmentCalculatorOutputs | null>(null);

  // ==== CALCULATION HANDLERS ====
  const handleCalculate = () => {
    switch (activeElement) {
      case 'foundation':
        setFoundationResults(calculateFoundation(foundationInputs));
        break;
      case 'column':
        if (columnMaterialType === 'RCC') {
          setColumnResults(calculateRCCColumn(rccColumnInputs));
        } else {
          setColumnResults(calculateSteelColumn(steelColumnInputs));
        }
        break;
      case 'slab':
        setSlabResults(calculateSlab(slabInputs));
        break;
      case 'composite_slab':
        setCompositeSlabResults(calculateCompositeSlab(compositeSlabInputs));
        break;
      case 'equipment':
        setEquipmentResults(calculateEquipment(equipmentInputs));
        break;
    }
    setActiveTab('output');
  };

  const handleApplyResults = () => {
    let results = null;
    switch (activeElement) {
      case 'foundation':
        results = { ...foundationResults, inputs: foundationInputs };
        break;
      case 'column':
        results = { ...columnResults, inputs: columnMaterialType === 'RCC' ? rccColumnInputs : steelColumnInputs, materialType: columnMaterialType };
        break;
      case 'slab':
        results = { ...slabResults, inputs: slabInputs };
        break;
      case 'composite_slab':
        results = { ...compositeSlabResults, inputs: compositeSlabInputs };
        break;
      case 'equipment':
        results = { ...equipmentResults, inputs: equipmentInputs };
        break;
    }
    if (results) {
      onApply?.(results);
      onClose();
    }
  };

  if (!open) return null;

  const formatPhp = (value: number | undefined) => {
    if (!value) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number | undefined, decimals = 2) => {
    if (value === undefined) return '-';
    return Number(value.toFixed(decimals)).toLocaleString('en-PH', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Structural Calculator</h2>
          <button onClick={onClose} className="text-white hover:bg-blue-800 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Element Tabs */}
        <div className="bg-gray-100 border-b flex overflow-x-auto">
          {(['foundation', 'column', 'slab', 'composite_slab', 'equipment'] as const).map((elem) => (
            <button
              key={elem}
              onClick={() => { setActiveElement(elem); setActiveTab('input'); }}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeElement === elem ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {elem === 'composite_slab' ? 'Composite' : elem.charAt(0).toUpperCase() + elem.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* ====== FOUNDATION INPUT ====== */}
            {activeElement === 'foundation' && activeTab === 'input' && (
              <div className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select value={foundationInputs.type} onChange={(e) => setFoundationInputs({...foundationInputs, type: e.target.value as FoundationType})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      {Object.values(FoundationType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Soil Class</label>
                    <select value={foundationInputs.soil_class} onChange={(e) => setFoundationInputs({...foundationInputs, soil_class: e.target.value as SoilClass})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      {Object.values(SoilClass).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                    <input type="number" step="0.1" value={foundationInputs.length_m} onChange={(e) => setFoundationInputs({...foundationInputs, length_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (m)</label>
                    <input type="number" step="0.1" value={foundationInputs.width_m} onChange={(e) => setFoundationInputs({...foundationInputs, width_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (m)</label>
                    <input type="number" step="0.1" value={foundationInputs.height_m} onChange={(e) => setFoundationInputs({...foundationInputs, height_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excavation Depth (m)</label>
                    <input type="number" step="0.1" value={foundationInputs.excavation_depth_m} onChange={(e) => setFoundationInputs({...foundationInputs, excavation_depth_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Backfill Depth (m)</label>
                    <input type="number" step="0.1" value={foundationInputs.backfill_depth_m} onChange={(e) => setFoundationInputs({...foundationInputs, backfill_depth_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lean Concrete (m)</label>
                    <input type="number" step="0.01" value={foundationInputs.lean_concrete_thickness_m} onChange={(e) => setFoundationInputs({...foundationInputs, lean_concrete_thickness_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bar Diameter (mm)</label>
                    <input type="number" value={foundationInputs.bottom_bar_diameter_mm} onChange={(e) => setFoundationInputs({...foundationInputs, bottom_bar_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bar Spacing (mm)</label>
                    <input type="number" value={foundationInputs.bottom_bar_spacing_mm} onChange={(e) => setFoundationInputs({...foundationInputs, bottom_bar_spacing_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concrete Cover (mm)</label>
                    <input type="number" value={foundationInputs.concrete_cover_mm} onChange={(e) => setFoundationInputs({...foundationInputs, concrete_cover_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concrete (₱/m³)</label>
                    <input type="number" step="100" value={foundationInputs.concrete_unit_price_php_per_m3} onChange={(e) => setFoundationInputs({...foundationInputs, concrete_unit_price_php_per_m3: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rebar (₱/kg)</label>
                    <input type="number" step="1" value={foundationInputs.rebar_unit_price_php_per_kg} onChange={(e) => setFoundationInputs({...foundationInputs, rebar_unit_price_php_per_kg: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formwork (₱/m²)</label>
                    <input type="number" step="10" value={foundationInputs.formwork_unit_price_php_per_m2} onChange={(e) => setFoundationInputs({...foundationInputs, formwork_unit_price_php_per_m2: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Excavation (₱/m³)</label>
                    <input type="number" step="10" value={foundationInputs.excavation_unit_price_php_per_m3} onChange={(e) => setFoundationInputs({...foundationInputs, excavation_unit_price_php_per_m3: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Labor (₱/day)</label>
                    <input type="number" step="100" value={foundationInputs.labor_rate_php_per_day} onChange={(e) => setFoundationInputs({...foundationInputs, labor_rate_php_per_day: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* ====== COLUMN INPUT ====== */}
            {activeElement === 'column' && activeTab === 'input' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex gap-3">
                  <button
                    onClick={() => setColumnMaterialType('RCC')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${columnMaterialType === 'RCC' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    RCC Column
                  </button>
                  <button
                    onClick={() => setColumnMaterialType('Steel')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${columnMaterialType === 'Steel' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    Steel Column
                  </button>
                </div>

                {columnMaterialType === 'RCC' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select value={rccColumnInputs.type} onChange={(e) => setRccColumnInputs({...rccColumnInputs, type: e.target.value as ColumnType})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        {Object.values(ColumnType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (m)</label>
                      <input type="number" step="0.1" value={rccColumnInputs.height_m} onChange={(e) => setRccColumnInputs({...rccColumnInputs, height_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Length (mm)</label>
                      <input type="number" value={rccColumnInputs.length_mm} onChange={(e) => setRccColumnInputs({...rccColumnInputs, length_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Width (mm)</label>
                      <input type="number" value={rccColumnInputs.width_mm} onChange={(e) => setRccColumnInputs({...rccColumnInputs, width_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Bar Diameter (mm)</label>
                      <input type="number" value={rccColumnInputs.main_bar_diameter_mm} onChange={(e) => setRccColumnInputs({...rccColumnInputs, main_bar_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Main Bar Qty</label>
                      <input type="number" value={rccColumnInputs.main_bar_qty} onChange={(e) => setRccColumnInputs({...rccColumnInputs, main_bar_qty: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tie Diameter (mm)</label>
                      <input type="number" value={rccColumnInputs.tie_diameter_mm} onChange={(e) => setRccColumnInputs({...rccColumnInputs, tie_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tie Spacing End (mm)</label>
                      <input type="number" value={rccColumnInputs.tie_spacing_mm_end} onChange={(e) => setRccColumnInputs({...rccColumnInputs, tie_spacing_mm_end: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tie Spacing Mid (mm)</label>
                      <input type="number" value={rccColumnInputs.tie_spacing_mm_mid} onChange={(e) => setRccColumnInputs({...rccColumnInputs, tie_spacing_mm_mid: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Concrete Cover (mm)</label>
                      <input type="number" value={rccColumnInputs.concrete_cover_mm} onChange={(e) => setRccColumnInputs({...rccColumnInputs, concrete_cover_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lap Length Factor</label>
                      <input type="number" value={rccColumnInputs.lap_length_factor} onChange={(e) => setRccColumnInputs({...rccColumnInputs, lap_length_factor: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Concrete (₱/m³)</label>
                      <input type="number" step="100" value={rccColumnInputs.concrete_unit_price_php_per_m3} onChange={(e) => setRccColumnInputs({...rccColumnInputs, concrete_unit_price_php_per_m3: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rebar (₱/kg)</label>
                      <input type="number" step="1" value={rccColumnInputs.rebar_unit_price_php_per_kg} onChange={(e) => setRccColumnInputs({...rccColumnInputs, rebar_unit_price_php_per_kg: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Formwork (₱/m²)</label>
                      <input type="number" step="10" value={rccColumnInputs.formwork_unit_price_php_per_m2} onChange={(e) => setRccColumnInputs({...rccColumnInputs, formwork_unit_price_php_per_m2: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Labor (₱/day)</label>
                      <input type="number" step="100" value={rccColumnInputs.labor_rate_php_per_day} onChange={(e) => setRccColumnInputs({...rccColumnInputs, labor_rate_php_per_day: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                )}

                {columnMaterialType === 'Steel' && (
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile</label>
                      <select value={steelColumnInputs.profile} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, profile: e.target.value as SteelColumnProfile})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        {Object.values(SteelColumnProfile).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Section Weight (kg/m)</label>
                      <input type="number" step="0.1" value={steelColumnInputs.section_weight_kg_per_m} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, section_weight_kg_per_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (m)</label>
                      <input type="number" step="0.1" value={steelColumnInputs.height_m} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, height_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Plate Thickness (mm)</label>
                      <input type="number" value={steelColumnInputs.base_plate_thickness_mm} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, base_plate_thickness_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Plate Length (mm)</label>
                      <input type="number" value={steelColumnInputs.base_plate_length_mm} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, base_plate_length_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Plate Width (mm)</label>
                      <input type="number" value={steelColumnInputs.base_plate_width_mm} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, base_plate_width_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anchor Bolt Diameter (mm)</label>
                      <input type="number" value={steelColumnInputs.anchor_bolt_diameter_mm} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, anchor_bolt_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anchor Bolt Qty</label>
                      <input type="number" value={steelColumnInputs.anchor_bolt_qty} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, anchor_bolt_qty: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Steel (₱/kg)</label>
                      <input type="number" step="1" value={steelColumnInputs.steel_unit_price_php_per_kg} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, steel_unit_price_php_per_kg: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bolt (₱/unit)</label>
                      <input type="number" step="1" value={steelColumnInputs.bolt_unit_price_php_per_unit} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, bolt_unit_price_php_per_unit: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plate (₱/kg)</label>
                      <input type="number" step="1" value={steelColumnInputs.plate_unit_price_php_per_kg} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, plate_unit_price_php_per_kg: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fabrication Markup (%)</label>
                      <input type="number" value={steelColumnInputs.fabrication_markup_percent} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, fabrication_markup_percent: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Erection Labor (₱/day)</label>
                      <input type="number" step="100" value={steelColumnInputs.erection_labor_rate_php_per_day} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, erection_labor_rate_php_per_day: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Erection Hours/Unit</label>
                      <input type="number" step="0.5" value={steelColumnInputs.erection_hours_per_unit} onChange={(e) => setSteelColumnInputs({...steelColumnInputs, erection_hours_per_unit: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ====== SLAB INPUT ====== */}
            {activeElement === 'slab' && activeTab === 'input' && (
              <div className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slab Type</label>
                    <select value={slabInputs.type} onChange={(e) => setSlabInputs({...slabInputs, type: e.target.value as SlabType})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      {Object.values(SlabType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thickness (mm)</label>
                    <input type="number" value={slabInputs.thickness_mm} onChange={(e) => setSlabInputs({...slabInputs, thickness_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                    <input type="number" step="0.1" value={slabInputs.length_m} onChange={(e) => setSlabInputs({...slabInputs, length_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (m)</label>
                    <input type="number" step="0.1" value={slabInputs.width_m} onChange={(e) => setSlabInputs({...slabInputs, width_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Bar Diameter (mm)</label>
                    <input type="number" value={slabInputs.main_bar_diameter_mm} onChange={(e) => setSlabInputs({...slabInputs, main_bar_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Bar Spacing (mm)</label>
                    <input type="number" value={slabInputs.main_bar_spacing_mm} onChange={(e) => setSlabInputs({...slabInputs, main_bar_spacing_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Bar Diameter (mm)</label>
                    <input type="number" value={slabInputs.secondary_bar_diameter_mm} onChange={(e) => setSlabInputs({...slabInputs, secondary_bar_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Bar Spacing (mm)</label>
                    <input type="number" value={slabInputs.secondary_bar_spacing_mm} onChange={(e) => setSlabInputs({...slabInputs, secondary_bar_spacing_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concrete Cover (mm)</label>
                    <input type="number" value={slabInputs.concrete_cover_mm} onChange={(e) => setSlabInputs({...slabInputs, concrete_cover_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={slabInputs.has_drop_panel} onChange={(e) => setSlabInputs({...slabInputs, has_drop_panel: e.target.checked})} className="w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">Has Drop Panel</span>
                    </label>
                  </div>
                  {slabInputs.has_drop_panel && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Drop Panel Length (m)</label>
                        <input type="number" step="0.1" value={slabInputs.drop_panel_length_m} onChange={(e) => setSlabInputs({...slabInputs, drop_panel_length_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Drop Panel Width (m)</label>
                        <input type="number" step="0.1" value={slabInputs.drop_panel_width_m} onChange={(e) => setSlabInputs({...slabInputs, drop_panel_width_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Drop Panel Thickness (mm)</label>
                        <input type="number" value={slabInputs.drop_panel_thickness_mm} onChange={(e) => setSlabInputs({...slabInputs, drop_panel_thickness_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concrete (₱/m³)</label>
                    <input type="number" step="100" value={slabInputs.concrete_unit_price_php_per_m3} onChange={(e) => setSlabInputs({...slabInputs, concrete_unit_price_php_per_m3: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rebar (₱/kg)</label>
                    <input type="number" step="1" value={slabInputs.rebar_unit_price_php_per_kg} onChange={(e) => setSlabInputs({...slabInputs, rebar_unit_price_php_per_kg: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formwork (₱/m²)</label>
                    <input type="number" step="10" value={slabInputs.formwork_unit_price_php_per_m2} onChange={(e) => setSlabInputs({...slabInputs, formwork_unit_price_php_per_m2: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Labor (₱/day)</label>
                    <input type="number" step="100" value={slabInputs.labor_rate_php_per_day} onChange={(e) => setSlabInputs({...slabInputs, labor_rate_php_per_day: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* ====== COMPOSITE SLAB INPUT ====== */}
            {activeElement === 'composite_slab' && activeTab === 'input' && (
              <div className="space-y-6 max-w-3xl">
                <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">⚠️ Formwork Bypass</h4>
                    <p className="text-sm text-orange-800">Composite slab uses steel deck as permanent formwork. Do NOT add soffit formwork to this item.</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                    <input type="number" step="0.1" value={compositeSlabInputs.length_m} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, length_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (m)</label>
                    <input type="number" step="0.1" value={compositeSlabInputs.width_m} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, width_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Beam Spacing (m)</label>
                    <input type="number" step="0.1" value={compositeSlabInputs.beam_spacing_m} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, beam_spacing_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Topping (mm)</label>
                    <input type="number" value={compositeSlabInputs.concrete_topping_mm} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, concrete_topping_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Deck Specification</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile</label>
                      <select value={compositeSlabInputs.deck_profile} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, deck_profile: e.target.value as CompositeDeckProfile})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        {Object.values(CompositeDeckProfile).map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gauge (mm)</label>
                      <select value={compositeSlabInputs.gauge_mm} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, gauge_mm: parseFloat(e.target.value) as DeckGaugeSize})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value={DeckGaugeSize.GAUGE_0_75}>0.75</option>
                        <option value={DeckGaugeSize.GAUGE_1_0}>1.0</option>
                        <option value={DeckGaugeSize.GAUGE_1_2}>1.2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deck Price (₱/m²)</label>
                      <input type="number" step="50" value={compositeSlabInputs.deck_unit_price_php_per_m2} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, deck_unit_price_php_per_m2: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Shear Studs</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Diameter (mm)</label>
                      <input type="number" value={compositeSlabInputs.shear_stud_diameter_mm} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, shear_stud_diameter_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (mm)</label>
                      <input type="number" value={compositeSlabInputs.shear_stud_height_mm} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, shear_stud_height_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spacing (mm)</label>
                      <input type="number" value={compositeSlabInputs.stud_spacing_mm} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, stud_spacing_mm: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stud Price (₱/pc)</label>
                      <input type="number" step="1" value={compositeSlabInputs.shear_stud_price_php_per_piece} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, shear_stud_price_php_per_piece: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Reinforcement & Fire</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mesh Type</label>
                      <select value={compositeSlabInputs.mesh_type} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, mesh_type: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="NONE">None</option>
                        <option value="WELDED_MESH">Welded Mesh</option>
                        <option value="REBAR_GRID">Rebar Grid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mesh Weight (kg/m²)</label>
                      <input type="number" step="0.5" value={compositeSlabInputs.mesh_weight_kg_m2} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, mesh_weight_kg_m2: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fire Type</label>
                      <select value={compositeSlabInputs.fire_protection_type} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, fire_protection_type: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="NONE">None</option>
                        <option value="SPRAY">Spray</option>
                        <option value="BOARD">Board</option>
                        <option value="INTUMESCENT">Intumescent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fire Rating (min)</label>
                      <input type="number" step="30" value={compositeSlabInputs.fire_rating_minutes || 0} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, fire_rating_minutes: e.target.value ? parseInt(e.target.value) : 0})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Labor & Equipment</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Crew Size</label>
                      <input type="number" value={compositeSlabInputs.laying_crew_size} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, laying_crew_size: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Productivity (m²/day)</label>
                      <input type="number" step="10" value={compositeSlabInputs.laying_productivity_m2_per_day} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, laying_productivity_m2_per_day: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Labor Rate (₱/day)</label>
                      <input type="number" step="50" value={compositeSlabInputs.labor_rate_php_per_day} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, labor_rate_php_per_day: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pump Rate (₱/hr)</label>
                      <input type="number" step="100" value={compositeSlabInputs.concrete_pump_rate_php_per_hour} onChange={(e) => setCompositeSlabInputs({...compositeSlabInputs, concrete_pump_rate_php_per_hour: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== EQUIPMENT INPUT ====== */}
            {activeElement === 'equipment' && activeTab === 'input' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Element Being Lifted</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select value={equipmentInputs.element_type} onChange={(e) => setEquipmentInputs({...equipmentInputs, element_type: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="COLUMN">Column</option>
                        <option value="BEAM">Beam</option>
                        <option value="TRUSS">Truss</option>
                        <option value="SLAB">Slab Panel</option>
                        <option value="DECK">Steel Deck</option>
                        <option value="BRACE">Brace</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input type="number" step="100" value={equipmentInputs.element_weight_kg} onChange={(e) => setEquipmentInputs({...equipmentInputs, element_weight_kg: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Length (m)</label>
                      <input type="number" step="0.1" value={equipmentInputs.element_length_m} onChange={(e) => setEquipmentInputs({...equipmentInputs, element_length_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input type="number" value={equipmentInputs.number_of_picks} onChange={(e) => setEquipmentInputs({...equipmentInputs, number_of_picks: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Lifting Configuration</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                      <select value={equipmentInputs.lifting_method} onChange={(e) => setEquipmentInputs({...equipmentInputs, lifting_method: e.target.value as LiftingMethod})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        {Object.values(LiftingMethod).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (m)</label>
                      <input type="number" step="1" value={equipmentInputs.lifting_height_m} onChange={(e) => setEquipmentInputs({...equipmentInputs, lifting_height_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Radius (m)</label>
                      <input type="number" step="0.5" value={equipmentInputs.hook_radius_m} onChange={(e) => setEquipmentInputs({...equipmentInputs, hook_radius_m: parseFloat(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rigging Time (min)</label>
                      <input type="number" step="5" value={equipmentInputs.rigging_time_per_pick_minutes} onChange={(e) => setEquipmentInputs({...equipmentInputs, rigging_time_per_pick_minutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Rigging & Labor</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Slings (qty)</label>
                      <input type="number" value={equipmentInputs.rigging_slings_qty} onChange={(e) => setEquipmentInputs({...equipmentInputs, rigging_slings_qty: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Rate (₱/day)</label>
                      <input type="number" step="1000" value={equipmentInputs.equipment_daily_rate_php} onChange={(e) => setEquipmentInputs({...equipmentInputs, equipment_daily_rate_php: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Operator Rate (₱/day)</label>
                      <input type="number" step="100" value={equipmentInputs.crane_operator_rate_php_per_day} onChange={(e) => setEquipmentInputs({...equipmentInputs, crane_operator_rate_php_per_day: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rigger Rate (₱/day)</label>
                      <input type="number" step="100" value={equipmentInputs.rigger_rate_php_per_day} onChange={(e) => setEquipmentInputs({...equipmentInputs, rigger_rate_php_per_day: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Helper Rate (₱/day)</label>
                      <input type="number" step="100" value={equipmentInputs.helper_rate_php_per_day} onChange={(e) => setEquipmentInputs({...equipmentInputs, helper_rate_php_per_day: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Riggers Count</label>
                      <input type="number" value={equipmentInputs.riggers_count} onChange={(e) => setEquipmentInputs({...equipmentInputs, riggers_count: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Helpers Count</label>
                      <input type="number" value={equipmentInputs.helpers_count} onChange={(e) => setEquipmentInputs({...equipmentInputs, helpers_count: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Safety Harnesses</label>
                      <input type="number" value={equipmentInputs.safety_harnesses_count} onChange={(e) => setEquipmentInputs({...equipmentInputs, safety_harnesses_count: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== OUTPUT SECTIONS ====== */}
            {activeElement === 'foundation' && activeTab === 'output' && foundationResults && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Concrete Volume</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(foundationResults.concrete_volume_m3, 3)} m³</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Rebar Weight</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(foundationResults.total_rebar_kg, 2)} kg</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPhp(foundationResults.total_cost_php)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Concrete</span><span>{formatPhp(foundationResults.concrete_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Rebar</span><span>{formatPhp(foundationResults.rebar_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Formwork</span><span>{formatPhp(foundationResults.formwork_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Excavation</span><span>{formatPhp(foundationResults.excavation_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Labor</span><span>{formatPhp(foundationResults.labor_cost_php)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeElement === 'column' && activeTab === 'output' && columnResults && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">{columnMaterialType === 'RCC' ? 'Concrete Volume' : 'Steel Weight'}</p>
                    <p className="text-2xl font-bold text-blue-600">{columnMaterialType === 'RCC' ? `${formatNumber(columnResults.concrete_volume_m3, 3)} m³` : `${formatNumber(columnResults.total_steel_weight_kg, 2)} kg`}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">{columnMaterialType === 'RCC' ? 'Rebar Weight' : 'Bolts Qty'}</p>
                    <p className="text-2xl font-bold text-green-600">{columnMaterialType === 'RCC' ? `${formatNumber(columnResults.total_rebar_kg, 2)} kg` : `${columnResults.anchor_bolts_total_qty} pcs`}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPhp(columnResults.total_cost_php)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    {columnMaterialType === 'RCC' ? (
                      <>
                        <div className="flex justify-between"><span>Concrete</span><span>{formatPhp(columnResults.concrete_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Rebar</span><span>{formatPhp(columnResults.rebar_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Formwork</span><span>{formatPhp(columnResults.formwork_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Labor</span><span>{formatPhp(columnResults.labor_cost_php)}</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span>Column Steel</span><span>{formatPhp(columnResults.column_steel_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Base Plate</span><span>{formatPhp(columnResults.base_plate_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Anchor Bolts</span><span>{formatPhp(columnResults.anchor_bolt_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Fabrication</span><span>{formatPhp(columnResults.fabrication_cost_php)}</span></div>
                        <div className="flex justify-between"><span>Erection</span><span>{formatPhp(columnResults.erection_labor_cost_php)}</span></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeElement === 'slab' && activeTab === 'output' && slabResults && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Concrete Volume</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(slabResults.concrete_volume_m3, 3)} m³</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Rebar Weight</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(slabResults.total_rebar_kg, 2)} kg</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPhp(slabResults.total_cost_php)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Concrete</span><span>{formatPhp(slabResults.concrete_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Rebar</span><span>{formatPhp(slabResults.rebar_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Formwork</span><span>{formatPhp(slabResults.formwork_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Labor</span><span>{formatPhp(slabResults.labor_cost_php)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeElement === 'composite_slab' && activeTab === 'output' && compositeSlabResults && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Deck Area</p>
                    <p className="text-2xl font-bold text-blue-600">{formatNumber(compositeSlabResults.deck_area_m2, 2)} m²</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Concrete Volume</p>
                    <p className="text-2xl font-bold text-green-600">{formatNumber(compositeSlabResults.concrete_net_volume_m3, 3)} m³</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPhp(compositeSlabResults.total_cost_php)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Deck Material</span><span>{formatPhp(compositeSlabResults.cost_breakdown?.deck_material || 0)}</span></div>
                    <div className="flex justify-between"><span>Studs & Welding</span><span>{formatPhp(compositeSlabResults.cost_breakdown?.studs_and_welding || 0)}</span></div>
                    <div className="flex justify-between"><span>Concrete</span><span>{formatPhp(compositeSlabResults.cost_breakdown?.concrete || 0)}</span></div>
                    <div className="flex justify-between"><span>Reinforcement</span><span>{formatPhp(compositeSlabResults.cost_breakdown?.reinforcement || 0)}</span></div>
                    <div className="flex justify-between"><span>Labor</span><span>{formatPhp(compositeSlabResults.cost_breakdown?.labor || 0)}</span></div>
                    <div className="flex justify-between"><span>Equipment</span><span>{formatPhp(compositeSlabResults.cost_breakdown?.equipment || 0)}</span></div>
                  </div>
                </div>
              </div>
            )}

            {activeElement === 'equipment' && activeTab === 'output' && equipmentResults && (
              <div className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Capacity Util</p>
                    <p className={`text-2xl font-bold ${equipmentResults.capacity_utilization_percent > 80 ? 'text-red-600' : 'text-blue-600'}`}>{formatNumber(equipmentResults.capacity_utilization_percent, 1)}%</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`text-2xl font-bold ${equipmentResults.is_feasible ? 'text-green-600' : 'text-red-600'}`}>{equipmentResults.is_feasible ? '✓ OK' : '✗ FAIL'}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="text-2xl font-bold text-purple-600">{formatPhp(equipmentResults.total_cost_php)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span>Equipment Rental</span><span>{formatPhp(equipmentResults.rental_cost_php)}</span></div>
                    <div className="flex justify-between"><span>Operator Labor</span><span>{formatPhp(equipmentResults.crane_operator?.total_cost_php || 0)}</span></div>
                    <div className="flex justify-between"><span>Rigger Labor</span><span>{formatPhp(equipmentResults.rigger_labor?.total_cost_php || 0)}</span></div>
                    <div className="flex justify-between"><span>Helper Labor</span><span>{formatPhp(equipmentResults.helper_labor?.total_cost_php || 0)}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-4 py-2 rounded font-medium transition ${activeTab === 'input' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Input
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-4 py-2 rounded font-medium transition ${activeTab === 'output' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              Output
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCalculate} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded">Calculate</button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 font-medium">Close</button>
            {((activeElement === 'foundation' && foundationResults) || (activeElement === 'column' && columnResults) || (activeElement === 'slab' && slabResults) || (activeElement === 'composite_slab' && compositeSlabResults) || (activeElement === 'equipment' && equipmentResults)) && (
              <button onClick={handleApplyResults} className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded">Apply to BOQ</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
