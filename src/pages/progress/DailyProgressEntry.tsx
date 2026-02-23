import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Plus, X } from 'lucide-react';
import { progressService } from '@/services/progressService';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface DailyProgressEntryProps {
  projectId: string;
  estimateId: string;
  onProgressRecorded: () => void;
}

interface BOQItem {
  id: string;
  item_number: string;
  trade: string;
  description: string;
  unit: string;
  qty: number;
}

interface ProgressRow {
  boq_item_id: string;
  qty_today: number;
  remarks: string;
}

export default function DailyProgressEntry({
  projectId,
  estimateId,
  onProgressRecorded,
}: DailyProgressEntryProps) {
  const profile = useAuthStore((state) => state.profile);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (estimateId) {
      loadBOQItems();
    }
  }, [estimateId]);

  const loadBOQItems = async () => {
    try {
      const { data, error } = await supabase
        .from('boq_items')
        .select('id, item_number, trade, description, unit, qty')
        .eq('estimate_id', estimateId)
        .order('sort_order');

      if (error) throw error;
      setBoqItems(data || []);
    } catch (err) {
      console.error('Failed to load BOQ items:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProgressRow = () => {
    setProgressRows([
      ...progressRows,
      {
        boq_item_id: '',
        qty_today: 0,
        remarks: '',
      },
    ]);
  };

  const removeProgressRow = (index: number) => {
    setProgressRows(progressRows.filter((_, i) => i !== index));
  };

  const updateProgressRow = (index: number, field: keyof ProgressRow, value: any) => {
    const updated = [...progressRows];
    updated[index] = { ...updated[index], [field]: value };
    setProgressRows(updated);
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    const validRows = progressRows.filter(
      (row) => row.boq_item_id && row.qty_today > 0
    );

    if (validRows.length === 0) {
      alert('Please add at least one progress entry with quantity.');
      return;
    }

    try {
      setSaving(true);
      await progressService.recordDailyProgress(projectId, date, validRows, profile.id);
      
      // Reset form
      setProgressRows([]);
      onProgressRecorded();
      alert('Progress recorded successfully!');
    } catch (err) {
      console.error('Failed to record progress:', err);
      alert('Failed to record progress. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading BOQ items...</div>;
  }

  if (!estimateId || boqItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No BOQ items found for this project.</p>
          <p className="text-sm mt-2">Create an estimate with BOQ items first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Daily Progress</CardTitle>
        <CardDescription>Enter quantities accomplished today for each work item</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Date:</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </div>

        {/* Progress Rows */}
        <div className="space-y-3">
          {progressRows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No entries yet. Click "Add Item" to start recording progress.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {progressRows.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start border rounded-lg p-3">
                  <div className="col-span-5">
                    <label className="text-xs text-muted-foreground">BOQ Item</label>
                    <select
                      value={row.boq_item_id}
                      onChange={(e) => updateProgressRow(index, 'boq_item_id', e.target.value)}
                      className="w-full px-2 py-1.5 border rounded text-sm"
                    >
                      <option value="">Select item...</option>
                      {boqItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.item_number} - {item.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Qty Today</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={row.qty_today || ''}
                      onChange={(e) =>
                        updateProgressRow(index, 'qty_today', parseFloat(e.target.value) || 0)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="col-span-1 pt-6">
                    <div className="text-xs text-muted-foreground">
                      {row.boq_item_id
                        ? boqItems.find((i) => i.id === row.boq_item_id)?.unit || ''
                        : ''}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <label className="text-xs text-muted-foreground">Remarks</label>
                    <Input
                      type="text"
                      value={row.remarks}
                      onChange={(e) => updateProgressRow(index, 'remarks', e.target.value)}
                      placeholder="Optional notes"
                      className="text-sm"
                    />
                  </div>

                  <div className="col-span-1 pt-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProgressRow(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={addProgressRow} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>

          <Button onClick={handleSave} disabled={saving || progressRows.length === 0} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Progress'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
