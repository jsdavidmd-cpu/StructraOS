import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { assemblyService } from '@/services/assemblyService';
import { formatCurrency } from '@/lib/currency';

interface UPAModalProps {
  assemblyId: string;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export default function UnitPriceAnalysisModal({
  assemblyId,
  onClose,
  trigger,
}: UPAModalProps) {
  const [open, setOpen] = useState(!trigger);
  const [loading, setLoading] = useState(true);
  const [assembly, setAssembly] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);

  useEffect(() => {
    if (open && assemblyId) {
      loadAssembly();
    }
  }, [open, assemblyId]);

  const loadAssembly = async () => {
    try {
      setLoading(true);
      const data = await assemblyService.getAssembly(assemblyId);
      setAssembly(data);

      const bd = await assemblyService.getAssemblyBreakdown(assemblyId);
      setBreakdown(bd);
    } catch (error) {
      console.error('Failed to load assembly:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  if (!assembly) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unit Price Analysis</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Assembly not found
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  const materialCostPercent =
    breakdown?.totalCost > 0
      ? (breakdown?.materialCost / breakdown?.totalCost) * 100
      : 0;
  const laborCostPercent =
    breakdown?.totalCost > 0
      ? (breakdown?.laborCost / breakdown?.totalCost) * 100
      : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Printable Section */}
        <div className="p-6 space-y-6" id="upaContent">
          {/* Header */}
          <div className="border-b pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Unit Price Analysis
                </h2>
                <p className="text-gray-600 mt-1">
                  {assembly.code && <span>{assembly.code} • </span>}
                  {assembly.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Unit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">{assembly.unit}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Unit Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold">
                  {formatCurrency(assembly.unit_price)}
                </p>
              </CardContent>
            </Card>

            {breakdown && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Material %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">
                      {materialCostPercent.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Labor %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">
                      {laborCostPercent.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Breakdown Section */}
          {breakdown && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Materials */}
              <Card>
                <CardHeader className="bg-blue-50 pb-3">
                  <CardTitle className="text-sm font-medium text-blue-900">
                    Materials
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(breakdown.materialCost)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.materials.length} items
                  </p>
                </CardContent>
              </Card>

              {/* Labor */}
              <Card>
                <CardHeader className="bg-green-50 pb-3">
                  <CardTitle className="text-sm font-medium text-green-900">
                    Labor
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(breakdown.laborCost)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.labor.length} items
                  </p>
                </CardContent>
              </Card>

              {/* Equipment */}
              <Card>
                <CardHeader className="bg-orange-50 pb-3">
                  <CardTitle className="text-sm font-medium text-orange-900">
                    Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(breakdown.equipmentCost)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {breakdown.equipment.length} items
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Components */}
          <div className="space-y-6">
            {/* Materials Section */}
            {breakdown?.materials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Materials
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.materials.map((mat: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {mat.item_name}
                            {mat.remarks && (
                              <p className="text-xs text-gray-500 mt-1">
                                {mat.remarks}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-600">
                            {mat.item_unit}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {mat.qty.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(mat.item_price || 0)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(mat.component_cost || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={4} className="text-right">
                          Material Subtotal:
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(breakdown.materialCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Labor Section */}
            {breakdown?.labor.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Labor
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Trade</TableHead>
                        <TableHead className="text-right">Unit</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Daily Rate</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.labor.map((lab: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {lab.item_name}
                            {lab.remarks && (
                              <p className="text-xs text-gray-500 mt-1">
                                {lab.remarks}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-600">
                            {lab.item_unit}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {lab.qty.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(lab.item_price || 0)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(lab.component_cost || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={4} className="text-right">
                          Labor Subtotal:
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(breakdown.laborCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Equipment Section */}
            {breakdown?.equipment.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Equipment
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Equipment</TableHead>
                        <TableHead className="text-right">Rate Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.equipment.map((eq: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {eq.item_name}
                            {eq.remarks && (
                              <p className="text-xs text-gray-500 mt-1">
                                {eq.remarks}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-600">
                            {eq.item_unit}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {eq.qty.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(eq.item_price || 0)}
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(eq.component_cost || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-semibold">
                        <TableCell colSpan={4} className="text-right">
                          Equipment Subtotal:
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(breakdown.equipmentCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-900">
                  Total Unit Price ({assembly.unit})
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(assembly.unit_price)}
                </p>
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="flex gap-3 pt-4 border-t justify-center print:hidden">
            <Button
              onClick={() => window.print()}
              className="gap-2"
              variant="outline"
            >
              <FileText className="w-4 h-4" />
              Print UPA
            </Button>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
