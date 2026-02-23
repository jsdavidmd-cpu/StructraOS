import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { inventoryService } from '@/services/inventoryService';

interface StockMovementsProps {
  organizationId: string;
}

export default function StockMovements({ organizationId }: StockMovementsProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
    const interval = setInterval(loadMovements, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [organizationId]);

  const loadMovements = async () => {
    try {
      const data = await inventoryService.getStockMovements(organizationId, undefined, 50);
      setMovements(data);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMovementBadgeColor = (type: string) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800';
      case 'out':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'count':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Stock Movements Audit Trail</h3>
        <button
          onClick={loadMovements}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading movements...</p>
      ) : movements.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            No stock movements recorded yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Date/Time</th>
                    <th className="text-left py-2 px-4 font-medium">Item</th>
                    <th className="text-left py-2 px-4 font-medium">Warehouse</th>
                    <th className="text-center py-2 px-4 font-medium">Type</th>
                    <th className="text-right py-2 px-4 font-medium">Quantity</th>
                    <th className="text-left py-2 px-4 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((movement) => {
                    const createdAt = new Date(movement.created_at);
                    return (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4 text-xs text-muted-foreground">
                          <div>{createdAt.toLocaleDateString()}</div>
                          <div>{createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="py-2 px-4">{movement.inventory_items?.name}</td>
                        <td className="py-2 px-4 text-muted-foreground">{movement.warehouses?.name}</td>
                        <td className="py-2 px-4 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getMovementBadgeColor(movement.movement_type)}`}>
                            {movement.movement_type}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right font-mono">
                          <span className={movement.movement_type === 'out' ? 'text-red-600' : 'text-green-600'}>
                            {movement.movement_type === 'out' ? '-' : '+'}
                            {movement.quantity} {movement.inventory_items?.unit}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-xs text-muted-foreground">{movement.reference}</td>
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
