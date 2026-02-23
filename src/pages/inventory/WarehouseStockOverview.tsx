import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Package, TrendingUp, Warehouse as WarehouseIcon, RefreshCw } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';

interface WarehouseStockOverviewProps {
  organizationId: string;
  onUpdated: () => void;
}

interface WarehouseWithStock {
  id: string;
  name: string;
  location: string;
  capacity_tons?: number;
  totalItems: number;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  utilization: number;
  lowStockItems: number;
  stockLevels: any[];
}

export default function WarehouseStockOverview({ organizationId }: WarehouseStockOverviewProps) {
  const [warehouses, setWarehouses] = useState<WarehouseWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'table' | 'detailed'>('grid');

  useEffect(() => {
    loadWarehouseData();
  }, [organizationId]);

  const loadWarehouseData = async () => {
    try {
      setLoading(true);
      const warehouseData = await inventoryService.getWarehouses(organizationId);
      
      // For each warehouse, get stock levels and calculate metrics
      const warehousesWithStock = await Promise.all(
        warehouseData.map(async (warehouse: any) => {
          const stockLevels: any[] = await inventoryService.getStockLevels(warehouse.id);
          
          const totalQuantity = stockLevels.reduce((sum: number, level: any) => sum + (level.quantity_on_hand || 0), 0);
          const totalReserved = stockLevels.reduce((sum: number, level: any) => sum + (level.quantity_reserved || 0), 0);
          const totalAvailable = totalQuantity - totalReserved;
          
          // Default reorder point if not available from database
          const defaultReorderPoint = 10;
          const lowStockItems = stockLevels.filter((level: any) => {
            const reorderPoint = level.inventory_items?.reorder_point || defaultReorderPoint;
            return level.quantity_on_hand < reorderPoint;
          }).length;
          
          const capacity = warehouse.capacity_tons || 100;
          const utilization = capacity > 0 ? Math.round((totalQuantity / capacity) * 100) : 0;
          
          return {
            ...warehouse,
            totalItems: stockLevels.length,
            totalQuantity,
            totalReserved,
            totalAvailable,
            utilization: Math.min(utilization, 100),
            lowStockItems,
            stockLevels,
          } as WarehouseWithStock;
        })
      );
      
      setWarehouses(warehousesWithStock);
      if (warehousesWithStock.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(warehousesWithStock[0].id);
      }
    } catch (err) {
      console.error('Failed to load warehouse data:', err);
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-900';
    if (quantity < reorderPoint) return 'bg-orange-100 text-orange-900';
    return 'bg-green-100 text-green-900';
  };

  const getCapacityColor = (utilization: number) => {
    if (utilization > 90) return 'bg-red-100';
    if (utilization > 70) return 'bg-orange-100';
    return 'bg-green-100';
  };

  const filteredWarehouses = warehouses.filter((wh) =>
    wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentWarehouse = warehouses.find((wh) => wh.id === selectedWarehouse);
  const totalAllQuantity = warehouses.reduce((sum, wh) => sum + wh.totalQuantity, 0);
  const totalAllItems = warehouses.reduce((sum, wh) => sum + wh.totalItems, 0);
  const totalLowStock = warehouses.reduce((sum, wh) => sum + wh.lowStockItems, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500">Loading warehouse inventory...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <WarehouseIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warehouses.length}</div>
            <p className="text-xs text-muted-foreground">Active warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllItems}</div>
            <p className="text-xs text-muted-foreground">Across all warehouses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllQuantity}</div>
            <p className="text-xs text-muted-foreground">Units on hand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLowStock}</div>
            <p className="text-xs text-muted-foreground">Items need reordering</p>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <div className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('grid')}
          >
            Grid View
          </Button>
          <Button
            variant={view === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('table')}
          >
            Table View
          </Button>
          <Button
            variant={view === 'detailed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('detailed')}
          >
            Detailed View
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadWarehouseData()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      {warehouses.length > 0 && (
        <Input
          placeholder="Search warehouses by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWarehouses.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                No warehouses found matching your search.
              </CardContent>
            </Card>
          ) : (
            filteredWarehouses.map((warehouse) => (
              <Card
                key={warehouse.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedWarehouse === warehouse.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWarehouse(warehouse.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                      <CardDescription>{warehouse.location || 'No location'}</CardDescription>
                    </div>
                    {warehouse.lowStockItems > 0 && (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Capacity Bar */}
                  {warehouse.capacity_tons && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Capacity</span>
                        <span className="text-muted-foreground">{warehouse.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getCapacityColor(
                            warehouse.utilization
                          )}`}
                          style={{ width: `${warehouse.utilization}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stock Summary */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="text-lg font-semibold">{warehouse.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="text-lg font-semibold">{warehouse.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reserved</p>
                      <p className="text-lg font-semibold">{warehouse.totalReserved}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available</p>
                      <p className="text-lg font-semibold text-green-600">{warehouse.totalAvailable}</p>
                    </div>
                  </div>

                  {/* Status */}
                  {warehouse.lowStockItems > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-800">
                        <strong>{warehouse.lowStockItems}</strong> item{warehouse.lowStockItems > 1 ? 's' : ''} below minimum stock
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle>All Warehouses Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Warehouse</th>
                    <th className="text-left py-3 px-4 font-semibold">Location</th>
                    <th className="text-right py-3 px-4 font-semibold">Items</th>
                    <th className="text-right py-3 px-4 font-semibold">On Hand</th>
                    <th className="text-right py-3 px-4 font-semibold">Reserved</th>
                    <th className="text-right py-3 px-4 font-semibold">Available</th>
                    <th className="text-center py-3 px-4 font-semibold">Capacity</th>
                    <th className="text-center py-3 px-4 font-semibold">Low Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarehouses.map((warehouse) => (
                    <tr
                      key={warehouse.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedWarehouse(warehouse.id)}
                    >
                      <td className="py-3 px-4 font-medium">{warehouse.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{warehouse.location || '-'}</td>
                      <td className="py-3 px-4 text-right">{warehouse.totalItems}</td>
                      <td className="py-3 px-4 text-right font-mono">{warehouse.totalQuantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-orange-600">{warehouse.totalReserved}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-green-600">
                        {warehouse.totalAvailable}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {warehouse.capacity_tons ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getCapacityColor(warehouse.utilization)}`}
                                style={{ width: `${warehouse.utilization}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{warehouse.utilization}%</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {warehouse.lowStockItems > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            <AlertTriangle className="h-3 w-3" />
                            {warehouse.lowStockItems}
                          </span>
                        ) : (
                          <span className="text-green-600 text-xs font-semibold">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed View */}
      {view === 'detailed' && currentWarehouse && (
        <Card>
          <CardHeader>
            <CardTitle>{currentWarehouse.name} - Detailed Stock Levels</CardTitle>
            <CardDescription>{currentWarehouse.location || 'No location'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Warehouse Stats */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{currentWarehouse.totalItems}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">On Hand</p>
                  <p className="text-2xl font-bold">{currentWarehouse.totalQuantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600">{currentWarehouse.totalAvailable}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className={`text-2xl font-bold ${currentWarehouse.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {currentWarehouse.lowStockItems}
                  </p>
                </div>
              </div>

              {/* Stock Levels Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold">Item</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-center py-3 px-4 font-semibold">Unit</th>
                      <th className="text-right py-3 px-4 font-semibold">On Hand</th>
                      <th className="text-right py-3 px-4 font-semibold">Reserved</th>
                      <th className="text-right py-3 px-4 font-semibold">Available</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentWarehouse.stockLevels.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-muted-foreground">
                          No stock items in this warehouse
                        </td>
                      </tr>
                    ) : (
                      currentWarehouse.stockLevels.map((level) => {
                        const item = level.inventory_items;
                        const reorderPoint = item?.reorder_point || 10;
                        const isLowStock = level.quantity_on_hand < reorderPoint;

                        return (
                          <tr
                            key={level.id}
                            className={`border-b ${isLowStock ? 'bg-red-50' : 'hover:bg-muted/50'}`}
                          >
                            <td className="py-3 px-4 font-medium">{item?.name || 'Unknown'}</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {item?.category || '-'}
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground">{item?.unit || '-'}</td>
                            <td className="py-3 px-4 text-right font-mono">{level.quantity_on_hand}</td>
                            <td className="py-3 px-4 text-right font-mono text-orange-600">
                              {level.quantity_reserved || 0}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-semibold text-green-600">
                              {(level.quantity_on_hand - (level.quantity_reserved || 0))}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                                  level.quantity_on_hand,
                                  reorderPoint
                                )}`}
                              >
                                {level.quantity_on_hand === 0
                                  ? 'Out'
                                  : isLowStock
                                  ? 'Low'
                                  : 'OK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
