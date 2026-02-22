import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type AssemblyInsert = Database['public']['Tables']['assemblies']['Insert'];
type AssemblyUpdate = Database['public']['Tables']['assemblies']['Update'];

export interface AssemblyWithComponents {
  id: string;
  code: string | null;
  name: string;
  unit: string;
  category: string | null;
  description: string | null;
  is_active: boolean;
  components: AssemblyComponentDetail[];
  unit_price: number;
}

export interface AssemblyComponentDetail {
  id: string;
  type: 'material' | 'labor' | 'equipment';
  ref_id: string;
  qty: number;
  wastage_factor: number; // Percentage (e.g., 5.00 for 5%)
  remarks: string | null;
  // Denormalized data for display
  item_name?: string;
  item_unit?: string;
  item_price?: number;
  item_rate_type?: string;
  component_cost?: number; // qty * price (with wastage applied)
  qty_with_wastage?: number; // Calculated: qty * (1 + wastage_factor/100)
}

export const assemblyService = {
  // Get all assemblies for current organization
  async getAssemblies() {
    const { data, error } = await supabase
      .from('assemblies')
      .select('*')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get single assembly with all components
  async getAssembly(id: string): Promise<AssemblyWithComponents> {
    const { data: assembly, error: asmError } = await supabase
      .from('assemblies')
      .select('*')
      .eq('id', id)
      .single();

    if (asmError) throw asmError;

    const { data: components, error: compError } = await supabase
      .from('assembly_components')
      .select('*')
      .eq('assembly_id', id);

    if (compError) throw compError;

    // Fetch details for each component to calculate costs
    const detailedComponents: AssemblyComponentDetail[] = [];
    let totalCost = 0;

    for (const comp of (components as any[]) || []) {
      const wastage_factor = comp.wastage_factor || 0;
      const qty_with_wastage = comp.qty * (1 + wastage_factor / 100);
      
      const detail: AssemblyComponentDetail = {
        id: comp.id,
        type: comp.type as 'material' | 'labor' | 'equipment',
        ref_id: comp.ref_id,
        qty: comp.qty,
        wastage_factor,
        remarks: comp.remarks,
        qty_with_wastage,
      };

      if (comp.type === 'material') {
        const { data: material } = await supabase
          .from('materials')
          .select('name, unit, ncr_price')
          .eq('id', comp.ref_id)
          .single();

        if (material) {
          const mat = material as any;
          detail.item_name = mat.name;
          detail.item_unit = mat.unit;
          detail.item_price = mat.ncr_price;
          detail.component_cost = mat.ncr_price * qty_with_wastage;
          totalCost += detail.component_cost;
        }
      } else if (comp.type === 'labor') {
        const { data: labor } = await supabase
          .from('labor_types')
          .select('trade, daily_rate')
          .eq('id', comp.ref_id)
          .single();

        if (labor) {
          const lab = labor as any;
          detail.item_name = lab.trade;
          detail.item_unit = 'manday';
          detail.item_price = lab.daily_rate;
          // Labor: manday * daily_rate
          detail.component_cost = lab.daily_rate * comp.qty;
          totalCost += detail.component_cost;
        }
      } else if (comp.type === 'equipment') {
        const { data: equipment } = await supabase
          .from('equipment')
          .select('name, rate_type, rate')
          .eq('id', comp.ref_id)
          .single();

        if (equipment) {
          const eq = equipment as any;
          detail.item_name = eq.name;
          detail.item_unit = eq.rate_type;
          detail.item_price = eq.rate;
          // Equipment: qty * rate (qty is in units of rate_type: day/hour/month)
          detail.component_cost = eq.rate * comp.qty;
          totalCost += detail.component_cost;
        }
      }

      detailedComponents.push(detail);
    }

    return {
      ...(assembly as any),
      components: detailedComponents,
      unit_price: totalCost,
    };
  },

  // Create new assembly
  async createAssembly(assembly: AssemblyInsert) {
    const { data, error } = await supabase
      .from('assemblies')
      .insert([assembly] as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update assembly
  async updateAssembly(id: string, updates: AssemblyUpdate) {
    const { data, error } = await (supabase
      .from('assemblies') as any)
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete assembly (soft delete via is_active)
  async deleteAssembly(id: string) {
    const { error } = await (supabase
      .from('assemblies') as any)
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Add component to assembly
  async addComponent(
    assemblyId: string,
    type: 'material' | 'labor' | 'equipment',
    refId: string,
    qty: number,
    wastage_factor?: number,
    remarks?: string
  ) {
    const { data, error } = await (supabase
      .from('assembly_components') as any)
      .insert([
        {
          assembly_id: assemblyId,
          type,
          ref_id: refId,
          qty,
          wastage_factor: wastage_factor || 0,
          remarks: remarks || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update component
  async updateComponent(
    componentId: string,
    qty: number,
    wastage_factor?: number,
    remarks?: string
  ) {
    const { data, error } = await (supabase
      .from('assembly_components') as any)
      .update({
        qty,
        wastage_factor: wastage_factor !== undefined ? wastage_factor : 0,
        remarks: remarks || null,
      })
      .eq('id', componentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete component
  async deleteComponent(componentId: string) {
    const { error } = await supabase
      .from('assembly_components')
      .delete()
      .eq('id', componentId);

    if (error) throw error;
  },

  // Get available materials for selection
  async getMaterials() {
    const { data, error } = await supabase
      .from('materials')
      .select('id, code, name, unit, ncr_price, category')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get available labor types for selection
  async getLaborTypes() {
    const { data, error } = await supabase
      .from('labor_types')
      .select('id, trade, daily_rate, skill_level')
      .eq('is_active', true)
      .order('skill_level', { ascending: true })
      .order('trade', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Get available equipment for selection
  async getEquipment() {
    const { data, error } = await supabase
      .from('equipment')
      .select('id, code, name, rate_type, rate')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Validate component units compatibility
  validateUnitCompatibility(): boolean {
    // For now, allow any unit combination
    // In production, you'd want stricter validation
    return true;
  },

  // Calculate assembly breakdown for display
  async getAssemblyBreakdown(assemblyId: string) {
    const assembly = await this.getAssembly(assemblyId);

    const breakdown = {
      materials: assembly.components.filter((c) => c.type === 'material'),
      labor: assembly.components.filter((c) => c.type === 'labor'),
      equipment: assembly.components.filter((c) => c.type === 'equipment'),
      materialCost: 0,
      laborCost: 0,
      equipmentCost: 0,
      totalCost: assembly.unit_price,
    };

    breakdown.materials.forEach((m) => {
      breakdown.materialCost += m.component_cost || 0;
    });
    breakdown.labor.forEach((l) => {
      breakdown.laborCost += l.component_cost || 0;
    });
    breakdown.equipment.forEach((e) => {
      breakdown.equipmentCost += e.component_cost || 0;
    });

    return breakdown;
  },
};
