import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { inventoryService } from '@/services/inventoryService';

interface StockLevelsProps {
  organizationId: string;
  onUpdated: () => void;
}

export default function StockLevels({ organizationId, onUpdated }: StockLevelsProps) {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    loadWarehouses();
  }, [organizationId]);

  useEffect(() => {
    if (selectedWarehouse) {
      loadStockLevels();
    }
  }, [selectedWarehouse]);

  const loadWarehouses = async () => {
    try {
      const data: any[] = await inventoryService.getWarehouses(organizationId);
      setWarehouses(data);
      if (data.length > 0) {
        setSelectedWarehouse(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  const loadStockLevels = async () => {
    if (!selectedWarehouse) return;
    try {
      setLoading(true);
      const data = await inventoryService.getStockLevels(selectedWarehouse);
      setStockLevels(data);
    } catch (err) {
      console.error('Failed to load stock levels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (stockLevelId: string, newQty: number) => {
    try {
      setUpdatingId(stockLevelId);
      await inventoryService.updateStockLevel(stockLevelId, newQty);
      await loadStockLevels();
      onUpdated();
    } catch (err) {
      console.error('Failed to update stock level:', err);
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Stock Levels</h3>
        {warehouses.length > 0 && (
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {warehouses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No warehouses found. Create a warehouse first.
          </CardContent>
        </Card>
      ) : loading ? (
        <p className="text-sm text-muted-foreground">Loading stock levels...</p>
      ) : stockLevels.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No stock levels recorded. Create inventory items first.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Item</th>
                    <th className="text-left py-2 px-4 font-medium">Unit</th>
                    <th className="text-right py-2 px-4 font-medium">On Hand</th>
                    <th className="text-right py-2 px-4 font-medium">Reserved</th>
                    <th className="text-right py-2 px-4 font-medium">Available</th>
                    <th className="text-center py-2 px-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stockLevels.map((level) => {
                    const item = level.inventory_items;
                    const isLowStock = level.quantity_on_hand < (item?.reorder_point || 10);
                    return (
                      <tr key={level.id} className={`border-b hover:bg-muted/50 ${isLowStock ? 'bg-red-50' : ''}`}>
                        <td className="py-2 px-4">{item?.name}</td>
                        <td className="py-2 px-4">{item?.unit}</td>
                        <td className="py-2 px-4 text-right font-mono">{level.quantity_on_hand}</td>
                        <td className="py-2 px-4 text-right font-mono">{level.quantity_reserved || 0}</td>
                        <td className="py-2 px-4 text-right font-mono text-green-600">
                          {(level.quantity_on_hand - (level.quantity_reserved || 0))}
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            value={level.quantity_on_hand}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) {
                                handleUpdateQuantity(level.id, val);
                              }
                            }}
                            disabled={updatingId === level.id}
                            className="w-16 px-2 py-1 border rounded text-right text-sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
