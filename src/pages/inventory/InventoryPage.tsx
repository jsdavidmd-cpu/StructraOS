import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { inventoryService } from '@/services/inventoryService';
import WarehouseManager from './WarehouseManager';
import MaterialsList from './MaterialsList';
import StockLevels from './StockLevels';
import StockMovements from './StockMovements';

export default function InventoryPage() {
  const profile = useAuthStore((state) => state.profile);
  const [stats, setStats] = useState({ totalItems: 0, lowStockItems: 0, recentMovements: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!profile?.organization_id) return;
    loadStats();
  }, [profile?.organization_id]);

  const loadStats = async () => {
    try {
      const orgId = profile?.organization_id;
      if (!orgId) return;
      const data = await inventoryService.getInventoryStats(orgId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load inventory stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.organization_id) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">Organization Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-800">Please ensure your profile is assigned to an organization.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
        <p className="text-muted-foreground">
          Track materials, warehouses, and stock movements
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Active materials</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Below minimum stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Movements</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.recentMovements}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview</CardTitle>
              <CardDescription>View inventory levels across all warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <StockLevels organizationId={profile.organization_id} onUpdated={loadStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <WarehouseManager organizationId={profile.organization_id} onUpdated={loadStats} />
        </TabsContent>

        <TabsContent value="materials">
          <MaterialsList organizationId={profile.organization_id} onUpdated={loadStats} />
        </TabsContent>

        <TabsContent value="movements">
          <StockMovements organizationId={profile.organization_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
