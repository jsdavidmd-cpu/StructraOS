import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  assemblyService,
  AssemblyWithComponents,
} from '@/services/assemblyService';
import { formatCurrency } from '@/lib/currency';

interface Material {
  id: string;
  code: string | null;
  name: string;
  unit: string;
  ncr_price: number;
  category: string | null;
}

interface LaborType {
  id: string;
  trade: string;
  daily_rate: number;
  skill_level: string;
}

interface Equipment {
  id: string;
  code: string | null;
  name: string;
  rate_type: 'hourly' | 'daily' | 'monthly';
  rate: number;
}

export default function AssemblyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const [assembly, setAssembly] = useState<AssemblyWithComponents | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [componentType, setComponentType] = useState<'material' | 'labor' | 'equipment'>('material');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [componentQty, setComponentQty] = useState<string>('');
  const [componentRemarks, setComponentRemarks] = useState<string>('');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [laborTypes, setLaborTypes] = useState<LaborType[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<string>('');
  const [editRemarks, setEditRemarks] = useState<string>('');

  const [breakdown, setBreakdown] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadAssembly();
      loadOptions();
    }
  }, [id]);

  const loadAssembly = async () => {
    try {
      setLoading(true);
      const data = await assemblyService.getAssembly(id!);
      setAssembly(data);
      const bd = await assemblyService.getAssemblyBreakdown(id!);
      setBreakdown(bd);
    } catch (error) {
      console.error('Failed to load assembly:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [mats, labors, equips] = await Promise.all([
        assemblyService.getMaterials(),
        assemblyService.getLaborTypes(),
        assemblyService.getEquipment(),
      ]);
      setMaterials(mats);
      setLaborTypes(labors);
      setEquipment(equips);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem || !componentQty) {
      alert('Please select an item and enter quantity');
      return;
    }

    try {
      await assemblyService.addComponent(
        id!,
        componentType,
        selectedItem,
        parseFloat(componentQty),
        0, // wastage_factor
        componentRemarks || undefined
      );

      setComponentType('material');
      setSelectedItem('');
      setComponentQty('');
      setComponentRemarks('');
      setIsAddingComponent(false);

      await loadAssembly();
    } catch (error) {
      console.error('Failed to add component:', error);
      alert('Failed to add component');
    }
  };

  const handleUpdateComponent = async (componentId: string) => {
    if (!editQty) {
      alert('Please enter quantity');
      return;
    }

    try {
      await assemblyService.updateComponent(
        componentId,
        parseFloat(editQty),
        0, // wastage_factor
        editRemarks || undefined
      );

      setEditingComponent(null);
      setEditQty('');
      setEditRemarks('');

      await loadAssembly();
    } catch (error) {
      console.error('Failed to update component:', error);
      alert('Failed to update component');
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (!confirm('Delete this component?')) {
      return;
    }

    try {
      await assemblyService.deleteComponent(componentId);
      await loadAssembly();
    } catch (error) {
      console.error('Failed to delete component:', error);
      alert('Failed to delete component');
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading assembly...</p>
      </div>
    );
  }

  if (!assembly) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Assembly not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/assemblies')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {assembly.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {assembly.code && <span>{assembly.code} • </span>}
            Unit: {assembly.unit}
            {assembly.category && <span> • {assembly.category}</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Unit Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(assembly.unit_price)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              per {assembly.unit}
            </p>
          </CardContent>
        </Card>

        {breakdown && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Materials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatCurrency(breakdown.materialCost)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {breakdown.materials.length} items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Labor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatCurrency(breakdown.laborCost)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {breakdown.labor.length} items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Equipment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {formatCurrency(breakdown.equipmentCost)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {breakdown.equipment.length} items
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Components</CardTitle>
            <CardDescription>
              Materials, labor, and equipment makeup
            </CardDescription>
          </div>

          <Dialog open={isAddingComponent} onOpenChange={setIsAddingComponent}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Component
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Component</DialogTitle>
                <DialogDescription>
                  Add a material, labor, or equipment item to this assembly
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAddComponent} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={componentType}
                    onChange={(e) => {
                      setComponentType(
                        e.target.value as 'material' | 'labor' | 'equipment'
                      );
                      setSelectedItem('');
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an item...</option>
                    {componentType === 'material' &&
                      materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code && `${m.code} - `}
                          {m.name} ({m.unit}) - {formatCurrency(m.ncr_price)}
                        </option>
                      ))}
                    {componentType === 'labor' &&
                      laborTypes.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.trade} - {formatCurrency(l.daily_rate)}/day
                        </option>
                      ))}
                    {componentType === 'equipment' &&
                      equipment.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.code && `${e.code} - `}
                          {e.name} - {formatCurrency(e.rate)}/{e.rate_type}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.001"
                    value={componentQty}
                    onChange={(e) => setComponentQty(e.target.value)}
                    placeholder="e.g., 6.5, 0.5, 1.0"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <Input
                    value={componentRemarks}
                    onChange={(e) => setComponentRemarks(e.target.value)}
                    placeholder="Optional notes..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddingComponent(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Component
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {assembly.components.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No components added yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assembly.components.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>
                        <span className="text-xs font-medium uppercase bg-gray-100 px-2 py-1 rounded">
                          {comp.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {comp.item_name}
                        {comp.remarks && (
                          <p className="text-xs text-gray-500 mt-1">
                            {comp.remarks}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {comp.item_unit}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {editingComponent === comp.id ? (
                          <Input
                            type="number"
                            step="0.001"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-20 text-right"
                            autoFocus
                          />
                        ) : (
                          comp.qty.toFixed(3)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(comp.item_price || 0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(comp.component_cost || 0)}
                      </TableCell>
                      <TableCell>
                        {editingComponent === comp.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingComponent(null);
                                setEditQty('');
                                setEditRemarks('');
                              }}
                              className="h-8"
                            >
                              ✕
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateComponent(comp.id)
                              }
                              className="h-8"
                            >
                              ✓
                            </Button>
                          </div>
                        ) : (
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingComponent(comp.id);
                                  setEditQty(comp.qty.toString());
                                  setEditRemarks(comp.remarks || '');
                                }}
                              >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteComponent(comp.id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
