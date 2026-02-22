import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Paintbrush, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { estimateService } from '@/services/estimateService';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type VerticalCategory = {
  key: string;
  title: string;
  description: string;
  icon: typeof Home;
};

const VERTICAL_CATEGORIES: VerticalCategory[] = [
  {
    key: 'residential',
    title: 'Residential',
    description: 'Single-family, multi-family, low-rise, and high-rise residential projects.',
    icon: Home,
  },
  {
    key: 'commercial',
    title: 'Commercial',
    description: 'Office, retail, mixed-use, and hospitality developments.',
    icon: Building2,
  },
  {
    key: 'interior-fitouts',
    title: 'Interior Fit-outs',
    description: 'Tenant improvements, fit-outs, and interior renovation scopes.',
    icon: Paintbrush,
  },
];

export default function VerticalBOQPage() {
  const navigate = useNavigate();
  const [creatingKey, setCreatingKey] = useState<string | null>(null);

  const handleCreateNew = async (category: VerticalCategory) => {
    try {
      setCreatingKey(category.key);
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
        project_name: `${category.title} - New Estimate`,
        location: '',
        client_name: '',
        floor_area: 0,
        notes: `Project Type: ${category.title}`,
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

      navigate(`/estimates/${(newEstimate as any)?.id}`);
    } catch (error) {
      console.error('Failed to create estimate:', error);
      alert('Failed to create estimate. Check the console for details.');
    } finally {
      setCreatingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vertical Projects BOQ</h2>
          <p className="text-muted-foreground">
            Start a BOQ for vertical projects: residential, commercial, and interior fit-outs.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/estimates')}>
          View All Estimates
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {VERTICAL_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isCreating = creatingKey === category.key;

          return (
            <Card key={category.key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleCreateNew(category)}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? 'Creating...' : 'Create BOQ'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
