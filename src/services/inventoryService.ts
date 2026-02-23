import { supabase } from '@/lib/supabase';

export const inventoryService = {
  // Warehouse Management
  async getWarehouses(organizationId: string) {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createWarehouse(warehouse: any) {
    const { data, error } = await (supabase.from('warehouses') as any).insert([warehouse]).select().single();
    if (error) throw error;
    return data;
  },

  async updateWarehouse(id: string, updates: any) {
    const { data, error } = await (supabase.from('warehouses') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteWarehouse(id: string) {
    const { data, error } = await (supabase.from('warehouses') as any)
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Materials Management (Inventory Items)
  async getMaterials(organizationId: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createMaterial(material: any) {
    const { data, error } = await (supabase.from('materials') as any).insert([material]).select().single();
    if (error) throw error;
    return data;
  },

  async updateMaterial(id: string, updates: any) {
    const { data, error } = await (supabase.from('materials') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMaterial(id: string) {
    const { data, error } = await (supabase.from('materials') as any)
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Stock Levels Management
  async getStockLevels(warehouseId: string) {
    const { data, error } = await supabase
      .from('stock_levels')
      .select(`
        *,
        materials(id, name, unit, ncr_price)
      `)
      .eq('warehouse_id', warehouseId)
      .order('created_at');
    if (error) throw error;
    return data || [];
  },

  async getStockLevel(warehouseId: string, materialId: string) {
    const { data, error } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .eq('material_id', materialId)
      .single();
    if (error && (error as any).code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  async updateStockLevel(id: string, currentStock: number) {
    const { data, error } = await (supabase.from('stock_levels') as any)
      .update({ current_stock: currentStock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createStockLevel(warehouseId: string, materialId: string, currentStock: number = 0) {
    const { data, error } = await (supabase.from('stock_levels') as any).insert([{
      warehouse_id: warehouseId,
      material_id: materialId,
      current_stock: currentStock,
      min_stock: 10,
      max_stock: 100,
    }]).select().single();
    if (error) throw error;
    return data;
  },

  // Stock Movements
  async recordStockMovement(movement: any) {
    const { data, error } = await (supabase.from('stock_movements') as any).insert([movement]).select().single();
    if (error) throw error;
    
    // Update stock level
    const stockLevel: any = await this.getStockLevel(movement.warehouse_id, movement.material_id);
    if (stockLevel) {
      const adjustment = movement.movement_type === 'in' ? movement.quantity : -movement.quantity;
      const newQuantity = stockLevel.current_stock + adjustment;
      await this.updateStockLevel(stockLevel.id, Math.max(0, newQuantity));
    }

    return data;
  },

  async getStockMovements(organizationId: string, warehouseId?: string, limit = 100) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        materials(name, unit),
        warehouses(name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Dashboard Stats
  async getInventoryStats(organizationId: string) {
    const { data: materials } = await supabase
      .from('materials')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    const { data: stockLevels } = await supabase
      .from('stock_levels')
      .select('current_stock, min_stock');

    const { data: movements } = await supabase
      .from('stock_movements')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('movement_type', 'out')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    const lowStockCount = stockLevels?.filter((s: any) => s.current_stock <= s.min_stock).length || 0;

    return {
      totalItems: materials?.length || 0,
      lowStockItems: lowStockCount,
      recentMovements: movements?.length || 0,
    };
  },
};
