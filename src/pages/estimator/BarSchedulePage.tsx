import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileDown,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getBarSchedules,
  createBarSchedule,
  deleteBarSchedule,
  generateCuttingList,
  formatBarScheduleForExport,
  generateRebarProcurement,
  BarSchedule,
  CuttingOptimization,
  RebarProcurement,
} from '@/services/barScheduleService';
import { formatCurrency } from '@/lib/currency';

export default function BarSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<BarSchedule[]>([]);
  const [cuttingList, setCuttingList] = useState<CuttingOptimization[]>([]);
  const [procurement, setProcurement] = useState<RebarProcurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const [newBarSchedule, setNewBarSchedule] = useState<Partial<BarSchedule>>({
    estimate_id: id,
    bar_mark: '',
    element_type: 'FOOTING',
    bar_size: '12mm',
    quantity: 1,
    length_mm: 6000,
    shape_code: '00',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesData, cuttingData, procurementData] = await Promise.all([
        getBarSchedules(id),
        generateCuttingList(id!),
        generateRebarProcurement(id!),
      ]);

      setSchedules(schedulesData);
      setCuttingList(cuttingData);
      setProcurement(procurementData);
    } catch (error) {
      console.error('Error loading bar schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBarSchedule = async () => {
    try {
      await createBarSchedule(newBarSchedule as any);
      setShowAddDialog(false);
      setNewBarSchedule({
        estimate_id: id,
        bar_mark: '',
        element_type: 'FOOTING',
        bar_size: '12mm',
        quantity: 1,
        length_mm: 6000,
        shape_code: '00',
        notes: '',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding bar schedule:', error);
      alert('Error adding bar schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('Delete this bar mark?')) {
      try {
        await deleteBarSchedule(scheduleId);
        await loadData();
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const exportToCSV = () => {
    const csv = formatBarScheduleForExport(schedules);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bar_Schedule_${id}.csv`;
    a.click();
  };

  // Calculate totals
  const totalWeight = procurement.reduce((sum, p) => sum + p.total_weight_kg, 0);
  const totalCost = procurement.reduce((sum, p) => sum + p.estimated_cost_php, 0);
  const totalTieWire = procurement.reduce((sum, p) => sum + p.tie_wire_kg, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading bar schedules...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/estimates/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bar Schedule</h1>
            <p className="text-sm text-gray-500">Rebar Cutting List & Optimization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bar Mark
          </Button>
        </div>
      </div>

      {/* Bar Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bar Marks ({schedules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2">
                  <th className="p-2 text-left">Bar Mark</th>
                  <th className="p-2 text-left">Element</th>
                  <th className="p-2 text-left">Bar Size</th>
                  <th className="p-2 text-right">Qty</th>
                  <th className="p-2 text-right">Length (mm)</th>
                  <th className="p-2 text-left">Shape</th>
                  <th className="p-2 text-left">Notes</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(schedule => (
                  <tr key={schedule.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-bold">{schedule.bar_mark}</td>
                    <td className="p-2">{schedule.element_type}</td>
                    <td className="p-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {schedule.bar_size}
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{schedule.quantity}</td>
                    <td className="p-2 text-right">{schedule.length_mm.toLocaleString()}</td>
                    <td className="p-2">{schedule.shape_code || '00'}</td>
                    <td className="p-2 text-xs text-gray-600">{schedule.notes}</td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cutting Optimization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cutting Optimization (9m Standard Bars)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2">
                  <th className="p-2 text-left">Bar Mark</th>
                  <th className="p-2 text-left">Size</th>
                  <th className="p-2 text-right">Cut Length (mm)</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Pcs from 9m</th>
                  <th className="p-2 text-right">Total 9m Bars</th>
                  <th className="p-2 text-right">Waste/Bar (mm)</th>
                  <th className="p-2 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {cuttingList.map(cut => (
                  <tr key={cut.bar_mark} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-bold">{cut.bar_mark}</td>
                    <td className="p-2">{cut.bar_size}</td>
                    <td className="p-2 text-right">{cut.cut_length_mm.toLocaleString()}</td>
                    <td className="p-2 text-right">{cut.quantity}</td>
                    <td className="p-2 text-right font-medium text-blue-700">{cut.bars_from_9m}</td>
                    <td className="p-2 text-right font-bold">{cut.total_9m_bars_needed}</td>
                    <td className="p-2 text-right text-orange-600">{cut.waste_per_bar_mm}</td>
                    <td className="p-2 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cut.utilization_percent >= 90 ? 'bg-green-100 text-green-800' :
                        cut.utilization_percent >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cut.utilization_percent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200 text-sm">
            <strong>Optimization Tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
              <li>Green: Excellent utilization (&gt;90%)</li>
              <li>Yellow: Good utilization (75-90%)</li>
              <li>Red: Poor utilization (&lt;75%) - Consider combining with other marks</li>
              <li>Standard rebar bar length: 9000mm (9 meters)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Procurement Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Material Procurement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3">REBAR REQUIREMENTS</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-2 text-left">Bar Size</th>
                    <th className="p-2 text-right">Weight (kg)</th>
                    <th className="p-2 text-right">Estimated Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {procurement.map(item => (
                    <tr key={item.bar_size} className="border-b">
                      <td className="p-2 font-medium">{item.bar_size}</td>
                      <td className="p-2 text-right">{item.total_weight_kg.toFixed(2)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.estimated_cost_php)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-gray-50">
                    <td className="p-2">TOTAL</td>
                    <td className="p-2 text-right">{totalWeight.toFixed(2)} kg</td>
                    <td className="p-2 text-right">{formatCurrency(totalCost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-500">ADDITIONAL MATERIALS</h3>
              <div className="p-4 bg-blue-50 rounded space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Tie Wire #16</span>
                  <span className="font-bold">{totalTieWire.toFixed(2)} kg</span>
                </div>
                <p className="text-xs text-gray-600">Calculated at 1.5% of rebar weight</p>
              </div>

              <div className="p-4 bg-green-50 rounded">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Material Cost</span>
                  <span className="text-xl font-bold text-green-700">{formatCurrency(totalCost)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">Rebar + Tie Wire</p>
              </div>

              <div className="text-xs text-gray-500 p-3 bg-amber-50 rounded border border-amber-200">
                <strong>Note:</strong> Prices are estimates based on NCR rates. Actual costs may vary by supplier and market conditions.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Bar Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bar Mark</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bar Mark</Label>
                <Input
                  value={newBarSchedule.bar_mark}
                  onChange={(e) => setNewBarSchedule({ ...newBarSchedule, bar_mark: e.target.value })}
                  placeholder="F1, C1, B1..."
                />
              </div>

              <div className="space-y-2">
                <Label>Element Type</Label>
                <select
                  value={newBarSchedule.element_type}
                  onChange={(e) => setNewBarSchedule({ ...newBarSchedule, element_type: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300"
                >
                  <option value="FOOTING">Footing</option>
                  <option value="COLUMN">Column</option>
                  <option value="BEAM">Beam</option>
                  <option value="SLAB">Slab</option>
                  <option value="WALL">Wall</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bar Size</Label>
                <select
                  value={newBarSchedule.bar_size}
                  onChange={(e) => setNewBarSchedule({ ...newBarSchedule, bar_size: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300"
                >
                  <option value="10mm">10mm</option>
                  <option value="12mm">12mm</option>
                  <option value="16mm">16mm</option>
                  <option value="20mm">20mm</option>
                  <option value="25mm">25mm</option>
                  <option value="28mm">28mm</option>
                  <option value="32mm">32mm</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Shape Code</Label>
                <Input
                  value={newBarSchedule.shape_code}
                  onChange={(e) => setNewBarSchedule({ ...newBarSchedule, shape_code: e.target.value })}
                  placeholder="00, 11, 21..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newBarSchedule.quantity}
                  onChange={(e) => setNewBarSchedule({ ...newBarSchedule, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Length (mm)</Label>
                <Input
                  type="number"
                  value={newBarSchedule.length_mm}
                  onChange={(e) => setNewBarSchedule({ ...newBarSchedule, length_mm: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={newBarSchedule.notes}
                onChange={(e) => setNewBarSchedule({ ...newBarSchedule, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBarSchedule}>
                Add Bar Mark
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
