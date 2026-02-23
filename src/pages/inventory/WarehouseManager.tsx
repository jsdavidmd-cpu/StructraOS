import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';

interface WarehouseManagerProps {
  organizationId: string;
  onUpdated: () => void;
}

export default function WarehouseManager({ organizationId, onUpdated }: WarehouseManagerProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWarehouse, setNewWarehouse] = useState({ name: '', location: '', capacity_tons: 0 });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, [organizationId]);

  const loadWarehouses = async () => {
    try {
      const data = await inventoryService.getWarehouses(organizationId);
      setWarehouses(data);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWarehouse = async () => {
    if (!newWarehouse.name || !newWarehouse.location) return;

    try {
      await inventoryService.createWarehouse({
        organization_id: organizationId,
        name: newWarehouse.name,
        location: newWarehouse.location,
        capacity_tons: newWarehouse.capacity_tons || null,
        status: 'active',
      });
      
      setNewWarehouse({ name: '', location: '', capacity_tons: 0 });
      setIsAdding(false);
      await loadWarehouses();
      onUpdated();
    } catch (err) {
      console.error('Failed to create warehouse:', err);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Delete this warehouse? This cannot be undone.')) return;

    try {
      await inventoryService.deleteWarehouse(id);
      await loadWarehouses();
      onUpdated();
    } catch (err) {
      console.error('Failed to delete warehouse:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Warehouses</h3>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Warehouse
        </Button>
      </div>

      {isAdding && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Warehouse Name"
                value={newWarehouse.name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={newWarehouse.location}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Capacity (tons)"
                value={newWarehouse.capacity_tons}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity_tons: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleAddWarehouse}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading warehouses...</p>
      ) : warehouses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No warehouses yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((wh) => (
            <Card key={wh.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <CardTitle className="text-base">{wh.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWarehouse(wh.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{wh.location}</p>
                {wh.capacity_tons && (
                  <p className="text-xs text-muted-foreground">Capacity: {wh.capacity_tons} tons</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
