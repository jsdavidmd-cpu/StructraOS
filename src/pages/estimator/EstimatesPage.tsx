import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { estimateService } from '@/services/estimateService';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function EstimatesPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const profile = useAuthStore((state) => state.profile);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEstimates();
  }, [projectId, profile?.organization_id]);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      setError('');
      
      // If no projectId and no organization, show error
      if (!projectId && !profile?.organization_id) {
        setError('Please select or create a project to view estimates.');
        setEstimates([]);
        return;
      }

      const data = await estimateService.getEstimates(projectId, profile?.organization_id ?? undefined);
      setEstimates(data || []);
    } catch (err: any) {
      console.error('Failed to load estimates:', err);
      setError(err.message || 'Failed to load estimates. Please try again.');
      setEstimates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let profile = useAuthStore.getState().profile;
      
      if (!user) {
        alert('Please log in first');
        return;
      }

      if (!profile) {
        const { data: loadedProfile, error: loadError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (loadError && (loadError as any).code !== 'PGRST116') {
          throw loadError;
        }

        if (loadedProfile) {
          profile = loadedProfile as any;
          useAuthStore.getState().setProfile(loadedProfile as any);
        }
      }

      const estimateNumber = await estimateService.generateEstimateNumber();
      // Ensure the user has an organization_id for RLS checks
      const fallbackOrgId = '795acdd9-9a69-4699-aaee-2787f7babce0';
      let organizationId = profile?.organization_id || null;

      if (!organizationId) {
        const { data: updatedProfile, error: updateError } = await (supabase
          .from('profiles') as any)
          .update({ organization_id: fallbackOrgId })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        organizationId = fallbackOrgId;
        useAuthStore.getState().setProfile(updatedProfile as any);
      }

      if (!organizationId) {
        alert('Your account is missing an organization. Please set one before creating estimates.');
        return;
      }

      const newEstimate = await estimateService.createEstimate({
        organization_id: organizationId,
        estimate_number: estimateNumber,
        project_name: 'New Estimate',
        location: '',
        client_name: '',
        floor_area: 0,
        notes: '',
        ocm_overhead: 5,
        ocm_contingency: 5,
        ocm_misc: 3,
        ocm_profit: 10,
        vat_type: 'exclusive',
        vat_rate: 12,
        status: 'draft',
        version: 1,
        created_by: user.id,
        project_id: null,
        subtotal: 0,
        total_amount: 0,
      });

      if (projectId) {
        navigate(`/projects/${projectId}/estimates/${(newEstimate as any)?.id}`);
      } else {
        navigate(`/estimates/${(newEstimate as any)?.id}`);
      }
    } catch (error) {
      console.error('Failed to create estimate:', error);
      alert('Failed to create estimate. Check the console for details.');
    }
  };

  const filteredEstimates = estimates.filter((est) =>
    est.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'revised': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading estimates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cost Estimates</h2>
            <p className="text-muted-foreground">Create and manage project cost estimates with BOQ</p>
          </div>
          <Button onClick={() => navigate('/projects')} variant="default">
            Go to Projects
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">{error}</p>
              <p className="text-sm text-red-700 mt-1">Create a new project or select an existing one to view estimates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cost Estimates</h2>
          <p className="text-muted-foreground">
            Create and manage project cost estimates with BOQ
          </p>
        </div>

        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Estimate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by project name, estimate number, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
          <CardDescription>
            {filteredEstimates.length} estimate(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No estimates found. Create your first estimate to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEstimates.map((estimate) => (
                  <TableRow
                    key={estimate.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      if (projectId) {
                        navigate(`/projects/${projectId}/estimates/${estimate.id}`);
                      } else {
                        navigate(`/estimates/${estimate.id}`);
                      }
                    }}
                  >
                    <TableCell className="font-medium">{estimate.estimate_number}</TableCell>
                    <TableCell>{estimate.project_name}</TableCell>
                    <TableCell>{estimate.location || '-'}</TableCell>
                    <TableCell>{estimate.client_name || '-'}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(estimate.total_amount)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                        {estimate.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(estimate.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
