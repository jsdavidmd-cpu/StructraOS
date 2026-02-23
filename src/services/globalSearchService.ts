import { supabase } from '@/lib/supabase';

export interface SearchResult {
  id: string;
  type: 'project' | 'estimate' | 'material' | 'task' | 'assembly' | 'worker' | 'boq_item' | 'document';
  title: string;
  subtitle?: string;
  description?: string;
  path: string;
  metadata?: Record<string, any>;
}

/**
 * Global search across all modules in STRUCTRA
 * Searches projects, estimates, materials, tasks, assemblies, workers, BOQ items
 */
export const globalSearchService = {
  /**
   * Search across all modules
   * @param query Search term
   * @param organizationId Current user's organization
   * @param limit Max results per category (default: 5)
   */
  async search(query: string, organizationId: string, limit: number = 5): Promise<SearchResult[]> {
    if (!query.trim() || !organizationId) return [];

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    try {
      // Search in parallel for better performance
      const [
        projects,
        estimates,
        materials,
        tasks,
        assemblies,
        workers,
        boqItems,
      ] = await Promise.all([
        this.searchProjects(searchTerm, organizationId, limit),
        this.searchEstimates(searchTerm, organizationId, limit),
        this.searchMaterials(searchTerm, organizationId, limit),
        this.searchTasks(searchTerm, organizationId, limit),
        this.searchAssemblies(searchTerm, organizationId, limit),
        this.searchWorkers(searchTerm, organizationId, limit),
        this.searchBOQItems(searchTerm, organizationId, limit),
      ]);

      // Combine and return all results
      results.push(
        ...projects,
        ...estimates,
        ...materials,
        ...tasks,
        ...assemblies,
        ...workers,
        ...boqItems
      );

      return results;
    } catch (error) {
      console.error('Global search error:', error);
      return results;
    }
  },

  async searchProjects(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, client, location, status')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${query}%,client.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((project: any) => ({
        id: project.id,
        type: 'project' as const,
        title: project.name,
        subtitle: project.client,
        description: project.location,
        path: `/projects/${project.id}`,
        metadata: { status: project.status },
      }));
    } catch (error) {
      console.error('Search projects error:', error);
      return [];
    }
  },

  async searchEstimates(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('id, estimate_number, project_name, location, total_amount, status')
        .eq('organization_id', organizationId)
        .or(`estimate_number.ilike.%${query}%,project_name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((estimate: any) => ({
        id: estimate.id,
        type: 'estimate' as const,
        title: `${estimate.estimate_number} - ${estimate.project_name}`,
        subtitle: estimate.location,
        description: `₱${(estimate.total_amount || 0).toLocaleString()}`,
        path: `/estimates/${estimate.id}`,
        metadata: { status: estimate.status },
      }));
    } catch (error) {
      console.error('Search estimates error:', error);
      return [];
    }
  },

  async searchMaterials(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, name, category, unit, base_price')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((material: any) => ({
        id: material.id,
        type: 'material' as const,
        title: material.name,
        subtitle: material.category,
        description: `₱${(material.base_price || 0).toLocaleString()} / ${material.unit}`,
        path: `/inventory/materials`,
        metadata: { unit: material.unit },
      }));
    } catch (error) {
      console.error('Search materials error:', error);
      return [];
    }
  },

  async searchTasks(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      // Get projects first to filter tasks
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('organization_id', organizationId);

      if (!projects || projects.length === 0) return [];

      const projectIds = projects.map((p: any) => p.id);

      const { data, error } = await supabase
        .from('schedule_tasks')
        .select('id, task_name, description, status, project_id, phase')
        .in('project_id', projectIds)
        .or(`task_name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((task: any) => ({
        id: task.id,
        type: 'task' as const,
        title: task.task_name,
        subtitle: task.phase || 'Unassigned',
        description: task.description,
        path: `/projects/${task.project_id}/schedule`,
        metadata: { status: task.status },
      }));
    } catch (error) {
      console.error('Search tasks error:', error);
      return [];
    }
  },

  async searchAssemblies(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('assemblies')
        .select('id, code, name, unit, category')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((assembly: any) => ({
        id: assembly.id,
        type: 'assembly' as const,
        title: assembly.name,
        subtitle: assembly.code,
        description: `${assembly.category} (${assembly.unit})`,
        path: `/assemblies/${assembly.id}`,
        metadata: { unit: assembly.unit },
      }));
    } catch (error) {
      console.error('Search assemblies error:', error);
      return [];
    }
  },

  async searchWorkers(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('id, employee_number, name, trade, daily_rate')
        .eq('organization_id', organizationId)
        .or(`name.ilike.%${query}%,employee_number.ilike.%${query}%,trade.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((worker: any) => ({
        id: worker.id,
        type: 'worker' as const,
        title: worker.name,
        subtitle: worker.employee_number,
        description: `${worker.trade} - ₱${(worker.daily_rate || 0).toLocaleString()}/day`,
        path: `/manpower`,
        metadata: { trade: worker.trade },
      }));
    } catch (error) {
      console.error('Search workers error:', error);
      return [];
    }
  },

  async searchBOQItems(query: string, organizationId: string, limit: number): Promise<SearchResult[]> {
    try {
      // Get estimates first
      const { data: estimates } = await supabase
        .from('estimates')
        .select('id, project_name')
        .eq('organization_id', organizationId);

      if (!estimates || estimates.length === 0) return [];

      const estimateIds = estimates.map((e: any) => e.id);
      const estimateMap = new Map(estimates.map((e: any) => [e.id, e.project_name]));

      const { data, error } = await supabase
        .from('boq_items')
        .select('id, item_number, description, estimate_id, unit, qty, unit_price, amount')
        .in('estimate_id', estimateIds)
        .or(`item_number.ilike.%${query}%,description.ilike.%${query}%,trade.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        type: 'boq_item' as const,
        title: `${item.item_number} - ${item.description}`,
        subtitle: estimateMap.get(item.estimate_id) || 'Unknown Project',
        description: `${item.qty} ${item.unit} @ ₱${(item.unit_price || 0).toLocaleString()}`,
        path: `/estimates/${item.estimate_id}`,
        metadata: { amount: item.amount },
      }));
    } catch (error) {
      console.error('Search BOQ items error:', error);
      return [];
    }
  },

  /**
   * Group results by type for display
   */
  groupByType(results: SearchResult[]): Record<string, SearchResult[]> {
    const grouped: Record<string, SearchResult[]> = {};

    results.forEach((result) => {
      if (!grouped[result.type]) {
        grouped[result.type] = [];
      }
      grouped[result.type].push(result);
    });

    return grouped;
  },

  /**
   * Get display name for result type
   */
  getTypeName(type: SearchResult['type']): string {
    const names: Record<SearchResult['type'], string> = {
      project: 'Projects',
      estimate: 'Estimates',
      material: 'Materials',
      task: 'Tasks',
      assembly: 'Assemblies',
      worker: 'Workers',
      boq_item: 'BOQ Items',
      document: 'Documents',
    };
    return names[type] || type;
  },

  /**
   * Get icon for result type (lucide-react icon name)
   */
  getTypeIcon(type: SearchResult['type']): string {
    const icons: Record<SearchResult['type'], string> = {
      project: 'FolderKanban',
      estimate: 'FileText',
      material: 'Package',
      task: 'CheckSquare',
      assembly: 'Layers',
      worker: 'Users',
      boq_item: 'ListTree',
      document: 'FileText',
    };
    return icons[type] || 'Circle';
  },
};
