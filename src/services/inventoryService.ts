import { supabase } from '@/lib/supabase';

export const inventoryService = {
  // Warehouse Management
  async getWarehouses(organizationId: string) {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('organization_id', organizationId)
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
      .update({ status: 'inactive' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Inventory Items Management
  async getInventoryItems(organizationId: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createInventoryItem(item: any) {
    const { data, error } = await (supabase.from('inventory_items') as any).insert([item]).select().single();
    if (error) throw error;
    return data;
  },

  async updateInventoryItem(id: string, updates: any) {
    const { data, error } = await (supabase.from('inventory_items') as any)
      .update(updates)
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
        inventory_items(id, name, unit, unit_cost, reorder_point)
      `)
      .eq('warehouse_id', warehouseId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getStockLevel(warehouseId: string, itemId: string) {
    const { data, error } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .eq('item_id', itemId)
      .single();
    if (error && (error as any).code === 'PGRST116') return null;
    if (error) throw error;
    return data;
  },

  async updateStockLevel(id: string, quantityOnHand: number, quantityReserved?: number) {
    const updates: any = { 
      quantity_on_hand: quantityOnHand,
      updated_at: new Date().toISOString()
    };
    if (quantityReserved !== undefined) {
      updates.quantity_reserved = quantityReserved;
    }
    const { data, error } = await (supabase.from('stock_levels') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createStockLevel(warehouseId: string, itemId: string, quantityOnHand: number = 0) {
    const { data, error } = await (supabase.from('stock_levels') as any).insert([{
      warehouse_id: warehouseId,
      item_id: itemId,
      quantity_on_hand: quantityOnHand,
      quantity_reserved: 0,
    }]).select().single();
    if (error) throw error;
    return data;
  },

  // Stock Movements (Audit Trail)
  async recordStockMovement(movement: any) {
    const { data: movementData, error: movementError } = await (supabase.from('stock_movements') as any)
      .insert([movement])
      .select()
      .single();
    if (movementError) throw movementError;
    
    // Auto-update stock level based on movement
    const stockLevel: any = await this.getStockLevel(movement.warehouse_id, movement.item_id);
    if (stockLevel) {
      const adjustment = movement.movement_type === 'in' 
        ? movement.quantity 
        : (movement.movement_type === 'adjustment' ? movement.quantity : -movement.quantity);
      const newQuantity = Math.max(0, stockLevel.quantity_on_hand + adjustment);
      await this.updateStockLevel(stockLevel.id, newQuantity);
    }

    return movementData;
  },

  async getStockMovements(organizationId: string, warehouseId?: string, limit = 100) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        inventory_items(name, unit),
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
    const { data: items } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    const { data: stockLevels } = await supabase
      .from('stock_levels')
      .select('quantity_on_hand, inventory_items(reorder_point)');

    const { data: movements } = await supabase
      .from('stock_movements')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('movement_type', 'out')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const lowStockCount = stockLevels?.filter((s: any) => {
      const reorder = s.inventory_items?.reorder_point || 10;
      return s.quantity_on_hand <= reorder;
    }).length || 0;

    return {
      totalItems: items?.length || 0,
      lowStockItems: lowStockCount,
      recentMovements: movements?.length || 0,
    };
  },
};
