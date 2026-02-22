import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileDown, Calculator, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { estimateService } from '@/services/estimateService';
import { formatCurrency } from '@/lib/currency';
import EnhancedBOQEditorPage from '@/pages/estimator/EnhancedBOQEditorPage';

export default function EstimateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [boqItems, setBOQItems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadEstimate();
    }
  }, [id]);

  const loadEstimate = async () => {
    try {
      const data = await estimateService.getEstimate(id!);
      setEstimate(data);
      setBOQItems((data as any)?.boq_items || []);
    } catch (error) {
      console.error('Failed to load estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstimate = async (field: string, value: any) => {
    try {
      setSaving(true);
      await estimateService.updateEstimate(id!, { [field]: value });
      setEstimate({ ...estimate, [field]: value });
    } catch (error) {
      console.error('Failed to update estimate:', error);
    } finally {
      setSaving(false);
    }
  };


  const calculateTotals = () => {
    if (!estimate) return null;

    return estimateService.calculateTotals(
      boqItems,
      {
        overhead: estimate.ocm_overhead || 0,
        contingency: estimate.ocm_contingency || 0,
        misc: estimate.ocm_misc || 0,
        profit: estimate.ocm_profit || 0,
      },
      estimate.vat_rate || 12
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Estimate not found</p>
        <Button onClick={() => navigate('/estimates')} className="mt-4">
          Back to Estimates
        </Button>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/estimates')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{estimate.estimate_number}</h2>
            <p className="text-muted-foreground">{estimate.project_name}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button
            onClick={() => navigate(`/estimates/${id}/bar-schedule`)}
            variant="outline"
            className="gap-2"
          >
            <Grid3x3 className="w-4 h-4" />
            Bar Schedule
          </Button>
          <Button disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Project Details</TabsTrigger>
          <TabsTrigger value="boq">Bill of Quantities</TabsTrigger>
          <TabsTrigger value="summary">Summary & OCM</TabsTrigger>
        </TabsList>

        {/* Project Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Basic details about the construction project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={estimate.project_name}
                    onChange={(e) => handleUpdateEstimate('project_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={estimate.location || ''}
                    onChange={(e) => handleUpdateEstimate('location', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input
                    value={estimate.client_name || ''}
                    onChange={(e) => handleUpdateEstimate('client_name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Floor Area (sq.m)</Label>
                  <Input
                    type="number"
                    value={estimate.floor_area || ''}
                    onChange={(e) => handleUpdateEstimate('floor_area', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={estimate.notes || ''}
                  onChange={(e) => handleUpdateEstimate('notes', e.target.value)}
                  placeholder="Additional notes or specifications..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOQ Tab */}
        <TabsContent value="boq" className="space-y-4">
          <EnhancedBOQEditorPage embedded onSaved={loadEstimate} />
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>OCM & Profit</CardTitle>
                <CardDescription>Overhead, Contingency, Miscellaneous & Profit percentages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Overhead (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={estimate.ocm_overhead}
                    onChange={(e) => handleUpdateEstimate('ocm_overhead', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contingency (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={estimate.ocm_contingency}
                    onChange={(e) => handleUpdateEstimate('ocm_contingency', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Miscellaneous (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={estimate.ocm_misc}
                    onChange={(e) => handleUpdateEstimate('ocm_misc', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profit (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={estimate.ocm_profit}
                    onChange={(e) => handleUpdateEstimate('ocm_profit', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>VAT (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={estimate.vat_rate}
                    onChange={(e) => handleUpdateEstimate('vat_rate', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">Mode: {estimate.vat_type?.toUpperCase()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Calculator className="inline mr-2 h-5 w-5" />
                  Cost Summary
                </CardTitle>
                <CardDescription>Total project cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Direct Cost</span>
                    <span className="font-semibold">{formatCurrency(totals?.directCost || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Overhead ({estimate.ocm_overhead}%)</span>
                    <span>{formatCurrency(totals?.overhead || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Contingency ({estimate.ocm_contingency}%)</span>
                    <span>{formatCurrency(totals?.contingency || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Miscellaneous ({estimate.ocm_misc}%)</span>
                    <span>{formatCurrency(totals?.misc || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b font-medium">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals?.subtotal || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Profit ({estimate.ocm_profit}%)</span>
                    <span>{formatCurrency(totals?.profit || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b font-medium">
                    <span>Subtotal with Profit</span>
                    <span>{formatCurrency(totals?.subtotalWithProfit || 0)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">VAT ({estimate.vat_rate}%) - EXCLUSIVE</span>
                    <span>{formatCurrency(totals?.vat || 0)}</span>
                  </div>

                  <div className="flex justify-between py-3 bg-primary/10 px-4 rounded-lg">
                    <span className="font-bold text-lg">TOTAL AMOUNT</span>
                    <span className="font-bold text-lg text-primary">
                      {formatCurrency(totals?.total || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
