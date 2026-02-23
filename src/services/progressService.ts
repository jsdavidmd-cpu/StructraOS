import { supabase } from '@/lib/supabase';

export interface ProgressEntry {
  id?: string;
  project_id: string;
  boq_item_id: string;
  date: string;
  qty_today: number;
  qty_to_date: number;
  percent_complete?: number;
  remarks?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressPhoto {
  id?: string;
  project_id: string;
  date: string;
  storage_path: string;
  caption?: string;
  location?: string;
  tags?: string[];
  uploaded_by?: string;
  created_at?: string;
}

export interface ProgressStats {
  overall_percent: number;
  cost_earned: number;
  cost_planned: number;
  schedule_variance: number;
  cost_variance: number;
  items_completed: number;
  items_in_progress: number;
  items_not_started: number;
}

export interface BOQProgressItem {
  boq_item_id: string;
  item_number: string;
  trade: string;
  description: string;
  unit: string;
  qty_planned: number;
  unit_price: number;
  amount_planned: number;
  qty_to_date: number;
  percent_complete: number;
  amount_earned: number;
  last_updated?: string;
}

export const progressService = {
  // ============================================================================
  // Progress Entries
  // ============================================================================

  async getProgressEntries(projectId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('progress_entries')
      .select(`
        *,
        boq_items(id, item_number, trade, description, unit, qty, unit_price, amount)
      `)
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getProgressEntriesByBOQ(boqItemId: string) {
    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('boq_item_id', boqItemId)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createProgressEntry(entry: ProgressEntry) {
    const { data, error } = await (supabase.from('progress_entries') as any)
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProgressEntry(id: string, updates: Partial<ProgressEntry>) {
    const { data, error } = await (supabase.from('progress_entries') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProgressEntry(id: string) {
    const { error } = await supabase
      .from('progress_entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ============================================================================
  // Progress Photos
  // ============================================================================

  async getProgressPhotos(projectId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('progress_photos')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async uploadProgressPhoto(photo: ProgressPhoto, file: File) {
    // Upload file to Supabase Storage
    const fileName = `${photo.project_id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create database record
    const photoRecord = {
      ...photo,
      storage_path: uploadData.path,
    };

    const { data, error } = await (supabase.from('progress_photos') as any)
      .insert([photoRecord])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProgressPhoto(id: string, storagePath: string) {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('progress-photos')
      .remove([storagePath]);
    if (storageError) console.error('Storage delete error:', storageError);

    // Delete from database
    const { error } = await supabase
      .from('progress_photos')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async getPhotoUrl(storagePath: string) {
    const { data } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  },

  // ============================================================================
  // Progress Analytics & Statistics
  // ============================================================================

  async getBOQProgress(_projectId: string, estimateId: string): Promise<BOQProgressItem[]> {
    // Get all BOQ items for the estimate
    const { data: boqItems, error: boqError } = await supabase
      .from('boq_items')
      .select('*')
      .eq('estimate_id', estimateId)
      .order('sort_order');

    if (boqError) throw boqError;
    if (!boqItems) return [];

    // Get progress entries for each BOQ item
    const progressData: BOQProgressItem[] = [];

    for (const item of boqItems as any[]) {
      // Get latest progress entry for this BOQ item
      const { data: entries } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('boq_item_id', item.id)
        .order('date', { ascending: false })
        .limit(1);

      const latestEntry: any = entries?.[0];
      const qtyToDate = latestEntry?.qty_to_date || 0;
      const qtyPlanned = Number(item.qty) || 0;
      const percentComplete = qtyPlanned > 0 ? (qtyToDate / qtyPlanned) * 100 : 0;
      const unitPrice = Number(item.unit_price) || 0;

      progressData.push({
        boq_item_id: item.id,
        item_number: item.item_number || '',
        trade: item.trade || '',
        description: item.description || '',
        unit: item.unit || '',
        qty_planned: qtyPlanned,
        unit_price: unitPrice,
        amount_planned: Number(item.amount) || 0,
        qty_to_date: qtyToDate,
        percent_complete: Math.min(100, percentComplete),
        amount_earned: qtyToDate * unitPrice,
        last_updated: latestEntry?.date,
      });
    }

    return progressData;
  },

  async getProgressStats(projectId: string, estimateId: string): Promise<ProgressStats> {
    const boqProgress = await this.getBOQProgress(projectId, estimateId);

    const totalPlanned = boqProgress.reduce((sum, item) => sum + item.amount_planned, 0);
    const totalEarned = boqProgress.reduce((sum, item) => sum + item.amount_earned, 0);
    const overallPercent = totalPlanned > 0 ? (totalEarned / totalPlanned) * 100 : 0;

    const itemsCompleted = boqProgress.filter((item) => item.percent_complete >= 100).length;
    const itemsInProgress = boqProgress.filter(
      (item) => item.percent_complete > 0 && item.percent_complete < 100
    ).length;
    const itemsNotStarted = boqProgress.filter((item) => item.percent_complete === 0).length;

    // Get project dates for schedule variance
    const { data: project } = await supabase
      .from('projects')
      .select('start_date, end_date, contract_amount')
      .eq('id', projectId)
      .single();

    let scheduleVariance = 0;
    const projectData: any = project;
    if (projectData?.start_date && projectData?.end_date) {
      const startDate = new Date(projectData.start_date);
      const endDate = new Date(projectData.end_date);
      const today = new Date();

      const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const plannedPercent = Math.min(100, (elapsedDays / totalDays) * 100);

      scheduleVariance = overallPercent - plannedPercent;
    }

    const costVariance = totalEarned - totalPlanned;

    return {
      overall_percent: overallPercent,
      cost_earned: totalEarned,
      cost_planned: totalPlanned,
      schedule_variance: scheduleVariance,
      cost_variance: costVariance,
      items_completed: itemsCompleted,
      items_in_progress: itemsInProgress,
      items_not_started: itemsNotStarted,
    };
  },

  // ============================================================================
  // S-Curve Data
  // ============================================================================

  async getSCurveData(projectId: string, estimateId: string) {
    const { data: project } = await supabase
      .from('projects')
      .select('start_date, end_date, contract_amount')
      .eq('id', projectId)
      .single();

    const projectData: any = project;
    if (!projectData?.start_date || !projectData?.end_date) {
      return { planned: [], actual: [] };
    }

    const startDate = new Date(projectData.start_date);
    const endDate = new Date(projectData.end_date);

    // Get all progress entries ordered by date
    const { data: entries } = await supabase
      .from('progress_entries')
      .select(`
        *,
        boq_items(unit_price)
      `)
      .eq('project_id', projectId)
      .order('date', { ascending: true });

    // Get total project value
    const { data: boqItems } = await supabase
      .from('boq_items')
      .select('amount')
      .eq('estimate_id', estimateId);

    const totalValue = (boqItems as any[])?.reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

    // Generate planned S-curve (linear for simplicity, can be customized)
    const planned: { date: string; value: number; percent: number }[] = [];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDays; i += Math.ceil(totalDays / 20)) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const percent = (i / totalDays) * 100;
      const value = (percent / 100) * totalValue;

      planned.push({
        date: date.toISOString().split('T')[0],
        value,
        percent,
      });
    }

    // Generate actual S-curve from progress entries
    const actual: { date: string; value: number; percent: number }[] = [];
    let cumulativeValue = 0;

    if (entries && entries.length > 0) {
      const groupedByDate: { [date: string]: number } = {};

      entries.forEach((entry: any) => {
        const date = entry.date;
        const unitPrice = Number(entry.boq_items?.unit_price || 0);
        const value = entry.qty_today * unitPrice;

        if (!groupedByDate[date]) {
          groupedByDate[date] = 0;
        }
        groupedByDate[date] += value;
      });

      Object.keys(groupedByDate)
        .sort()
        .forEach((date) => {
          cumulativeValue += groupedByDate[date];
          const percent = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;

          actual.push({
            date,
            value: cumulativeValue,
            percent,
          });
        });
    }

    return { planned, actual };
  },

  // ============================================================================
  // Bulk Progress Entry
  // ============================================================================

  async recordDailyProgress(
    projectId: string,
    date: string,
    items: Array<{ boq_item_id: string; qty_today: number; remarks?: string }>,
    createdBy: string
  ) {
    const entries: ProgressEntry[] = [];

    for (const item of items) {
      if (item.qty_today <= 0) continue;

      // Get previous qty_to_date
      const { data: prevEntries } = await supabase
        .from('progress_entries')
        .select('qty_to_date')
        .eq('boq_item_id', item.boq_item_id)
        .lt('date', date)
        .order('date', { ascending: false })
        .limit(1);

      const prevEntry: any = prevEntries?.[0];
      const prevQty = prevEntry?.qty_to_date || 0;
      const qtyToDate = prevQty + item.qty_today;

      // Get BOQ planned qty for percent calculation
      const { data: boqItem } = await supabase
        .from('boq_items')
        .select('qty')
        .eq('id', item.boq_item_id)
        .single();

      const boqData: any = boqItem;
      const plannedQty = Number(boqData?.qty || 0);
      const percentComplete = plannedQty > 0 ? (qtyToDate / plannedQty) * 100 : 0;

      entries.push({
        project_id: projectId,
        boq_item_id: item.boq_item_id,
        date,
        qty_today: item.qty_today,
        qty_to_date: qtyToDate,
        percent_complete: Math.min(100, percentComplete),
        remarks: item.remarks,
        created_by: createdBy,
      });
    }

    if (entries.length > 0) {
      const { data, error } = await (supabase.from('progress_entries') as any)
        .insert(entries)
        .select();
      if (error) throw error;
      return data;
    }

    return [];
  },
};
