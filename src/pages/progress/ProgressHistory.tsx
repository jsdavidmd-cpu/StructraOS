import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { progressService } from '@/services/progressService';
import { format } from 'date-fns';

interface ProgressHistoryProps {
  projectId: string;
}

export default function ProgressHistory({ projectId }: ProgressHistoryProps) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadEntries();
  }, [projectId, startDate, endDate]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await progressService.getProgressEntries(
        projectId,
        startDate || undefined,
        endDate || undefined
      );
      setEntries(data);
    } catch (err) {
      console.error('Failed to load progress entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this progress entry? This cannot be undone.')) return;

    try {
      await progressService.deleteProgressEntry(id);
      await loadEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
      alert('Failed to delete entry.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress History</CardTitle>
        <CardDescription>All recorded progress entries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Filters */}
        <div className="flex gap-4">
          <div>
            <label className="text-sm font-medium">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 px-2 py-1 border rounded text-sm"
            />
          </div>
          {(startDate || endDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Entries Table */}
        {loading ? (
          <div className="text-muted-foreground text-center py-8">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No progress entries found.</p>
            <p className="text-sm mt-2">Record daily progress to see entries here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Item</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-right py-2 px-2">Qty Today</th>
                  <th className="text-right py-2 px-2">Qty To Date</th>
                  <th className="text-right py-2 px-2">%</th>
                  <th className="text-left py-2 px-2">Remarks</th>
                  <th className="text-center py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry: any) => (
                  <tr key={entry.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-2 px-2 font-medium">
                      {entry.boq_items?.item_number || '-'}
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-xs text-muted-foreground mb-1">
                        {entry.boq_items?.trade}
                      </div>
                      <div>{entry.boq_items?.description}</div>
                    </td>
                    <td className="py-2 px-2 text-right">
                      {Number(entry.qty_today).toFixed(2)} {entry.boq_items?.unit}
                    </td>
                    <td className="py-2 px-2 text-right">
                      {Number(entry.qty_to_date).toFixed(2)} {entry.boq_items?.unit}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {entry.percent_complete?.toFixed(1) || 0}%
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">
                      {entry.remarks || '-'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
