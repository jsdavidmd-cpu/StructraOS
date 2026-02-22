import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { estimateService } from '@/services/estimateService';
import { assemblyService } from '@/services/assemblyService';
import { formatCurrency } from '@/lib/currency';
import UnitPriceAnalysisModal from '@/components/modals/UnitPriceAnalysisModal';

interface BOQItemRow {
  id: string;
  item_number: string;
  trade: string;
  description: string;
  unit: string;
  qty: number;
  assembly_id: string | null;
  unit_price: number;
  amount: number;
}

interface Estimate {
  id: string;
  estimate_number: string;
  project_name: string;
  ocm_overhead: number;
  ocm_contingency: number;
  ocm_misc: number;
  ocm_profit: number;
}

export default function BOQEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [items, setItems] = useState<BOQItemRow[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showUPA, setShowUPA] = useState<string | null>(null);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    item_number: '',
    trade: '',
    description: '',
    unit: '',
    qty: 0,
    assembly_id: '',
    unit_price: 0,
  });



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

      // Convert to item rows
      const rows: BOQItemRow[] = ((data as any).boq_items || []).map((item: any) => ({
        id: item.id,
        item_number: item.item_number || '',
        trade: item.trade || '',
        description: item.description || '',
        unit: item.unit || '',
        qty: item.qty || 0,
        assembly_id: item.assembly_id || null,
        unit_price: item.unit_price || 0,
        amount: item.amount || 0,
      }));

      setItems(rows);
    } catch (error) {
      console.error('Failed to load estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssemblies = async () => {
    try {
      const data = await assemblyService.getAssemblies();

      // Load unit prices for each
      const withPrices = await Promise.all(
        data.map(async (asm: any) => {
          try {
            const full = await assemblyService.getAssembly(asm.id);
            return {
              ...asm,
              unit_price: full.unit_price,
            };
          } catch {
            return { ...asm as any, unit_price: 0 };
          }
        })
      );

      setAssemblies(withPrices);
    } catch (error) {
      console.error('Failed to load assemblies:', error);
    }
  };

  const handleQtyChange = (itemId: string, newQty: number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const amount = newQty * item.unit_price;
          return { ...item, qty: newQty, amount };
        }
        return item;
      })
    );
  };



  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newItemForm.description.trim() ||
      !newItemForm.unit.trim() ||
      newItemForm.qty <= 0
    ) {
      alert('Please fill in description, unit, and quantity');
      return;
    }

    try {
      const amount = newItemForm.qty * newItemForm.unit_price;
      const newItem = await estimateService.addBOQItem({
        estimate_id: id!,
        item_number: newItemForm.item_number || null,
        trade: newItemForm.trade || null,
        description: newItemForm.description,
        unit: newItemForm.unit,
        qty: newItemForm.qty,
        assembly_id: newItemForm.assembly_id || null,
        unit_price: newItemForm.unit_price,
        is_manual: true,
      } as any);

      setItems([
        ...items,
        {
          id: (newItem as any).id,
          item_number: (newItem as any).item_number || '',
          trade: (newItem as any).trade || '',
          description: (newItem as any).description,
          unit: (newItem as any).unit,
          qty: (newItem as any).qty,
          assembly_id: (newItem as any).assembly_id,
          unit_price: (newItem as any).unit_price,
          amount,
        },
      ]);

      setNewItemForm({
        item_number: '',
        trade: '',
        description: '',
        unit: '',
        qty: 0,
        assembly_id: '',
        unit_price: 0,
      });
      setIsAddingItem(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this BOQ item?')) {
      return;
    }

    try {
      await estimateService.deleteBOQItem(itemId);
      setItems(items.filter((i) => i.id !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item');
    }
  };

  const handleSaveQtyChanges = async () => {
    try {
      setSaving(true);

      // Save all items
      for (const item of items) {
        await estimateService.updateBOQItem(item.id, {
          qty: item.qty,
          unit_price: item.unit_price,
        } as any);
      }

      alert('BOQ updated successfully');
    } catch (error) {
      console.error('Failed to save BOQ:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const totals = estimateService.calculateTotals(
    items.map((i) => ({ amount: i.amount } as any)),
    {
      overhead: estimate?.ocm_overhead || 0,
      contingency: estimate?.ocm_contingency || 0,
      misc: estimate?.ocm_misc || 0,
      profit: estimate?.ocm_profit || 0,
    }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading BOQ...</p>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Estimate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/estimates/${id}`)}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bill of Quantities
          </h1>
          <p className="text-gray-600 mt-1">
            {estimate.estimate_number} • {estimate.project_name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>BOQ Items</CardTitle>
            <CardDescription>
              Edit quantities and assembly selections. Changes save automatically.
            </CardDescription>
          </div>

          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add BOQ Item</DialogTitle>
                <DialogDescription>
                  Add a new line item to the Bill of Quantities
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Item #
                    </label>
                    <Input
                      value={newItemForm.item_number}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          item_number: e.target.value,
                        })
                      }
                      placeholder="1, 2, 3..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Trade
                    </label>
                    <Input
                      value={newItemForm.trade}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          trade: e.target.value,
                        })
                      }
                      placeholder="e.g., Concrete Works"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newItemForm.description}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g., Concrete 21 MPa Foundation"
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newItemForm.unit}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          unit: e.target.value,
                        })
                      }
                      placeholder="cu.m, sq.m, pc, kg"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Qty <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newItemForm.qty}
                      onChange={(e) =>
                        setNewItemForm({
                          ...newItemForm,
                          qty: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Assembly (Optional)
                  </label>
                  <select
                    value={newItemForm.assembly_id}
                    onChange={(e) => {
                      const asmId = e.target.value;
                      const asm = assemblies.find((a) => a.id === asmId);
                      setNewItemForm({
                        ...newItemForm,
                        assembly_id: asmId,
                        unit_price: asm?.unit_price || 0,
                      });
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Manual entry...</option>
                    {assemblies.map((asm) => (
                      <option key={asm.id} value={asm.id}>
                        {asm.code && `${asm.code} - `}
                        {asm.name} ({asm.unit}) - {formatCurrency(asm.unit_price)}/unit
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Unit Price
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItemForm.unit_price}
                    onChange={(e) =>
                      setNewItemForm({
                        ...newItemForm,
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingItem(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items yet. Add one to get started.
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto mb-4 border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        #
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Trade
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Description
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Unit
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">
                        Unit Price
                      </th>
                      <th className="px-4 py-2 text-right font-medium text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-center font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {item.item_number || idx + 1}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.trade || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.qty}
                            onChange={(e) =>
                              handleQtyChange(
                                item.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 text-right"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-mono text-sm">
                              {formatCurrency(item.unit_price)}
                            </span>
                            {item.assembly_id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowUPA(item.assembly_id)}
                                title="View assembly breakdown"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {item.assembly_id && (
                                <DropdownMenuItem
                                  onClick={() => setShowUPA(item.assembly_id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  UPA Details
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Button
                onClick={handleSaveQtyChanges}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary & OCM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">Direct Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totals.directCost)}
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">
                Overhead ({estimate.ocm_overhead}%)
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(totals.overhead)}
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm text-gray-600">
                Contingency ({estimate.ocm_contingency}%)
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(totals.contingency)}
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600">
                Misc ({estimate.ocm_misc}%)
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(totals.misc)}
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <p className="text-sm text-gray-600">
                Profit ({estimate.ocm_profit}%)
              </p>
              <p className="text-lg font-bold">
                {formatCurrency(totals.profit)}
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-sm text-gray-600">VAT (12%)</p>
              <p className="text-lg font-bold">
                {formatCurrency(totals.vat)}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-700">
                Total Contract Price
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totals.total)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showUPA && (
        <UnitPriceAnalysisModal
          assemblyId={showUPA}
          onClose={() => setShowUPA(null)}
        />
      )}
    </div>
  );
}
