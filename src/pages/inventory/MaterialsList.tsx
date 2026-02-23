import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';

interface MaterialsListProps {
  organizationId: string;
  onUpdated: () => void;
}

export default function MaterialsList({ organizationId, onUpdated }: MaterialsListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    name: '',
    code: '',
    category: '',
    unit: 'pcs',
    ncr_price: 0,
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadItems();
  }, [organizationId]);

  const loadItems = async () => {
    try {
      const data = await inventoryService.getMaterials(organizationId);
      setItems(data);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.code) return;

    try {
      await inventoryService.createMaterial({
        organization_id: organizationId,
        ...newItem,
      });
      
      setNewItem({
        name: '',
        code: '',
        category: '',
        unit: 'pcs',
        ncr_price: 0,
      });
      setIsAdding(false);
      await loadItems();
      onUpdated();
    } catch (err) {
      console.error('Failed to create material:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this material? This cannot be undone.')) return;

    try {
      await inventoryService.deleteMaterial(id);
      await loadItems();
      onUpdated();
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Materials</h3>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Material
        </Button>
      </div>

      {isAdding && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Material Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, ...newItem, name: e.target.value })}
              />
              <Input
                placeholder="Code"
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
              <Input
                placeholder="Unit (pcs, kg, m, etc)"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              />
              <Input
                type="number"
                placeholder="NCR Price"
                value={newItem.ncr_price}
                onChange={(e) => setNewItem({ ...newItem, ncr_price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddItem}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading materials...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No materials yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materials ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Code</th>
                    <th className="text-left py-2 px-4 font-medium">Name</th>
                    <th className="text-left py-2 px-4 font-medium">Category</th>
                    <th className="text-left py-2 px-4 font-medium">Unit</th>
                    <th className="text-right py-2 px-4 font-medium">NCR Price</th>
                    <th className="text-center py-2 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{item.code}</td>
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4 text-muted-foreground">{item.category}</td>
                      <td className="py-2 px-4">{item.unit}</td>
                      <td className="py-2 px-4 text-right">₱{item.ncr_price?.toFixed(2) || '0.00'}</td>
                      <td className="py-2 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
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
      )}
    </div>
  );
}
