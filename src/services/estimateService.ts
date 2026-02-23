import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type EstimateInsert = Database['public']['Tables']['estimates']['Insert'];
type EstimateUpdate = Database['public']['Tables']['estimates']['Update'];
type BOQItem = Database['public']['Tables']['boq_items']['Row'];
type BOQItemInsert = Database['public']['Tables']['boq_items']['Insert'];

export const estimateService = {
  // Get all estimates for current organization or project
  async getEstimates(projectId?: string, organizationId?: string) {
    let query = supabase
      .from('estimates')
      .select('*, projects(name)')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    } else if (organizationId) {
      // If no projectId, filter by organization to prevent loading all estimates in system
      query = query.eq('organization_id', organizationId);
    } else {
      // Neither projectId nor organizationId provided - return empty to avoid loading entire table
      return [];
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  // Get single estimate with BOQ items
  async getEstimate(id: string) {
    const { data: estimate, error } = await supabase
      .from('estimates')
      .select('*, projects(name), boq_items(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return estimate;
  },

  // Create new estimate
  async createEstimate(estimate: EstimateInsert) {
    const { data, error } = await supabase
      .from('estimates')
      .insert([estimate] as any)
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  // Update estimate
  async updateEstimate(id: string, updates: EstimateUpdate) {
    const { data, error } = await (supabase
      .from('estimates') as any)
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete estimate
  async deleteEstimate(id: string) {
    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Calculate estimate totals
  calculateTotals(boqItems: BOQItem[], ocm: { overhead: number; contingency: number; misc: number; profit: number }, vatRate: number = 12) {
    const directCost = boqItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    
    const overhead = (directCost * ocm.overhead) / 100;
    const contingency = (directCost * ocm.contingency) / 100;
    const misc = (directCost * ocm.misc) / 100;
    
    const subtotal = directCost + overhead + contingency + misc;
    const profit = (subtotal * ocm.profit) / 100;
    const subtotalWithProfit = subtotal + profit;
    
    const vat = (subtotalWithProfit * vatRate) / 100;
    const total = subtotalWithProfit + vat;

    return {
      directCost,
      overhead,
      contingency,
      misc,
      subtotal,
      profit,
      subtotalWithProfit,
      vat,
      total,
    };
  },

  // BOQ Items
  async addBOQItem(item: BOQItemInsert) {
    const { data, error } = await supabase
      .from('boq_items')
      .insert([item] as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBOQItem(id: string, updates: Partial<BOQItemInsert>) {
    const { data, error } = await (supabase
      .from('boq_items') as any)
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBOQItem(id: string) {
    const { error } = await supabase
      .from('boq_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update BOQ items in batch (for Enhanced BOQ Editor)
  async updateBOQItems(estimateId: string, items: any[]) {
    // Delete existing items
    await supabase
      .from('boq_items')
      .delete()
      .eq('estimate_id', estimateId);

    // Insert updated items
    const itemsToInsert = items.map(item => ({
      estimate_id: estimateId,
      item_number: item.item_number,
      section: item.section,
      trade: item.trade,
      description: item.description,
      unit: item.unit,
      qty: item.qty,
      assembly_id: item.assembly_id,
      unit_price: item.unit_price,
      amount: item.qty * item.unit_price,
      markup_percent: item.markup_percent,
      internal_amount: item.internal_amount,
      contract_amount: item.contract_amount,
      material_cost: item.material_cost,
      labor_cost: item.labor_cost,
      equipment_cost: item.equipment_cost,
      is_active: true,
    }));

    const { data, error } = await (supabase.from('boq_items') as any)
      .insert(itemsToInsert);

    if (error) throw error;
    return data;
  },

  // Get assembly details for unit price calculation
  async getAssemblyUnitPrice(assemblyId: string) {
    const { data: components, error } = await supabase
      .from('assembly_components')
      .select('*')
      .eq('assembly_id', assemblyId);

    if (error) throw error;

    let totalCost = 0;

    for (const component of components || []) {
      const comp = component as any;
      if (comp.type === 'material') {
        const { data: material } = await supabase
          .from('materials')
          .select('ncr_price')
          .eq('id', comp.ref_id)
          .single();
        
        if (material) {
          totalCost += (material as any).ncr_price * comp.qty;
        }
      } else if (comp.type === 'labor') {
        const { data: labor } = await supabase
          .from('labor_types')
          .select('daily_rate')
          .eq('id', comp.ref_id)
          .single();
        
        if (labor) {
          // Convert daily rate to hourly (8 hours per day)
          const hourlyRate = (labor as any).daily_rate / 8;
          totalCost += hourlyRate * comp.qty;
        }
      } else if (comp.type === 'equipment') {
        const { data: equipment } = await supabase
          .from('equipment')
          .select('rate, rate_type')
          .eq('id', comp.ref_id)
          .single();
        
        if (equipment) {
          let cost = (equipment as any).rate * comp.qty;
          // Adjust for rate type if needed
          if ((equipment as any).rate_type === 'monthly') {
            cost = cost / 26; // Approximate daily rate
          }
          totalCost += cost;
        }
      }
    }

    return totalCost;
  },

  // Generate estimate number
  async generateEstimateNumber() {
    const { data, error } = await supabase
      .from('estimates')
      .select('estimate_number')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    let sequence = 1;
    if (data && data.length > 0) {
      const lastNumber = (data[0] as any).estimate_number;
      const match = lastNumber.match(/EST-(\d{4})(\d{2})-(\d{4})/);
      if (match && match[1] === String(year) && match[2] === month) {
        sequence = parseInt(match[3]) + 1;
      }
    }

    return `EST-${year}${month}-${String(sequence).padStart(4, '0')}`;
  },
};
