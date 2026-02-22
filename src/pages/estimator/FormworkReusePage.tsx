import { useState, useEffect } from 'react';
import {
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
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
  getFormworkCycles,
  createFormworkCycle,
  recordFormworkUsage,
  markFormworkDamaged,
  retireFormwork,
  getFormworkAnalytics,
  FormworkCycle,
  FormworkAnalytics,
} from '@/services/formworkService';
import { formatCurrency } from '@/lib/currency';

export default function FormworkReusePage() {

  const [cycles, setCycles] = useState<FormworkCycle[]>([]);
  const [analytics, setAnalytics] = useState<FormworkAnalytics | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState<string | null>(null);

  const [newCycle, setNewCycle] = useState({
    item_description: '',
    unit: 'sheet',
    purchase_price: 0,
    max_uses: 4,
    current_use_count: 0,
    status: 'active' as 'active' | 'retired' | 'damaged',
  });

  const [usageForm, setUsageForm] = useState({
    projectName: '',
    areaUsed: 0,
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      const [cyclesData, analyticsData] = await Promise.all([
        getFormworkCycles(filterStatus || undefined),
        getFormworkAnalytics(),
      ]);

      setCycles(cyclesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading formwork data:', error);
    }
  };

  const handleAddCycle = async () => {
    try {
      await createFormworkCycle(newCycle);
      setShowAddDialog(false);
      setNewCycle({
        item_description: '',
        unit: 'sheet',
        purchase_price: 0,
        max_uses: 4,
        current_use_count: 0,
        status: 'active',
      });
      await loadData();
    } catch (error) {
      console.error('Error adding formwork cycle:', error);
      alert('Error adding formwork cycle');
    }
  };

  const handleRecordUsage = async () => {
    if (!showUsageDialog) return;

    try {
      await recordFormworkUsage(showUsageDialog, usageForm.projectName, usageForm.areaUsed);
      setShowUsageDialog(null);
      setUsageForm({ projectName: '', areaUsed: 0 });
      await loadData();
    } catch (error: any) {
      console.error('Error recording usage:', error);
      alert(error.message || 'Error recording usage');
    }
  };

  const handleMarkDamaged = async (cycleId: string) => {
    const notes = prompt('Enter damage description:');
    if (notes) {
      try {
        await markFormworkDamaged(cycleId, notes);
        await loadData();
      } catch (error) {
        console.error('Error marking damaged:', error);
      }
    }
  };

  const handleRetire = async (cycleId: string) => {
    if (confirm('Retire this formwork item?')) {
      try {
        await retireFormwork(cycleId);
        await loadData();
      } catch (error) {
        console.error('Error retiring formwork:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'retired':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'damaged':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getUtilizationColor = (cycle: FormworkCycle) => {
    const percent = (cycle.current_use_count / cycle.max_uses) * 100;
    if (percent >= 100) return 'text-gray-500';
    if (percent >= 75) return 'text-orange-600';
    if (percent >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Formwork Reuse Tracking</h1>
          <p className="text-sm text-gray-500">Manage formwork lifecycle and depreciation</p>
        </div>

        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Formwork Item
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{analytics.total_items}</div>
              <p className="text-xs text-gray-500">Total Items</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{analytics.active_items}</div>
              <p className="text-xs text-gray-500">Active Items</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(analytics.total_investment)}</div>
              <p className="text-xs text-gray-500">Total Investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(analytics.current_value)}</div>
              <p className="text-xs text-gray-500">Current Value</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('')}
        >
          All
        </Button>
        <Button
          variant={filterStatus === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('active')}
        >
          Active
        </Button>
        <Button
          variant={filterStatus === 'retired' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('retired')}
        >
          Retired
        </Button>
        <Button
          variant={filterStatus === 'damaged' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterStatus('damaged')}
        >
          Damaged
        </Button>
      </div>

      {/* Formwork Table */}
      <Card>
        <CardHeader>
          <CardTitle>Formwork Inventory ({cycles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2">
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Unit</th>
                  <th className="p-2 text-right">Purchase Price</th>
                  <th className="p-2 text-right">Max Uses</th>
                  <th className="p-2 text-right">Current Uses</th>
                  <th className="p-2 text-right">Utilization</th>
                  <th className="p-2 text-right">Current Value</th>
                  <th className="p-2 text-left">Last Used</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {cycles.map(cycle => (
                  <tr key={cycle.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{getStatusIcon(cycle.status)}</td>
                    <td className="p-2 font-medium">{cycle.item_description}</td>
                    <td className="p-2">{cycle.unit}</td>
                    <td className="p-2 text-right">{formatCurrency(cycle.purchase_price)}</td>
                    <td className="p-2 text-right">{cycle.max_uses}</td>
                    <td className="p-2 text-right font-bold">{cycle.current_use_count}</td>
                    <td className="p-2 text-right">
                      <span className={`font-semibold ${getUtilizationColor(cycle)}`}>
                        {((cycle.current_use_count / cycle.max_uses) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{formatCurrency(cycle.current_value)}</td>
                    <td className="p-2 text-xs">{cycle.last_used_date || '-'}</td>
                    <td className="p-2">
                      {cycle.status === 'active' && cycle.current_use_count < cycle.max_uses && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUsageDialog(cycle.id)}
                            className="h-7 text-xs"
                          >
                            Use
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkDamaged(cycle.id)}
                            className="h-7 w-7 p-0"
                          >
                            <AlertCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {cycle.status === 'active' && cycle.current_use_count >= cycle.max_uses && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetire(cycle.id)}
                          className="h-7 text-xs"
                        >
                          Retire
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cycles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No formwork items found. Click "Add Formwork Item" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Formwork Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Formwork Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Description</Label>
              <Input
                value={newCycle.item_description}
                onChange={(e) => setNewCycle({ ...newCycle, item_description: e.target.value })}
                placeholder="Marine Plywood 1/2'' x 4' x 8'"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <select
                  value={newCycle.unit}
                  onChange={(e) => setNewCycle({ ...newCycle, unit: e.target.value })}
                  className="w-full h-9 px-3 rounded-md border border-gray-300"
                >
                  <option value="sheet">sheet</option>
                  <option value="pc">pc</option>
                  <option value="set">set</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newCycle.purchase_price}
                  onChange={(e) => setNewCycle({ ...newCycle, purchase_price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Maximum Uses</Label>
                <Input
                  type="number"
                  value={newCycle.max_uses}
                  onChange={(e) => setNewCycle({ ...newCycle, max_uses: parseInt(e.target.value) || 4 })}
                />
                <p className="text-xs text-gray-500">Industry standard: 4 uses</p>
              </div>

              <div className="space-y-2">
                <Label>Current Use Count</Label>
                <Input
                  type="number"
                  value={newCycle.current_use_count}
                  onChange={(e) => setNewCycle({ ...newCycle, current_use_count: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-gray-500">0 for new item</p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCycle}>
                Add Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Usage Dialog */}
      <Dialog open={!!showUsageDialog} onOpenChange={() => setShowUsageDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Formwork Usage</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={usageForm.projectName}
                onChange={(e) => setUsageForm({ ...usageForm, projectName: e.target.value })}
                placeholder="Project or location"
              />
            </div>

            <div className="space-y-2">
              <Label>Area Used (sq.m)</Label>
              <Input
                type="number"
                step="0.1"
                value={usageForm.areaUsed}
                onChange={(e) => setUsageForm({ ...usageForm, areaUsed: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUsageDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleRecordUsage}>
                Record Usage
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
