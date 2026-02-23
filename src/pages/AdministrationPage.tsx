import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { adminUserService, type ProvisionRole } from '@/services/adminUserService';

export default function AdministrationPage() {
  const profile = useAuthStore((state) => state.profile);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    full_name: '',
    role: 'viewer' as ProvisionRole,
  });

  const isAdmin = profile?.role === 'admin';

  const roleOptions = useMemo(
    () => [
      { value: 'admin', label: 'Admin' },
      { value: 'project_manager', label: 'Project Manager' },
      { value: 'engineer', label: 'Engineer' },
      { value: 'quantity_surveyor', label: 'Quantity Surveyor' },
      { value: 'foreman', label: 'Foreman' },
      { value: 'viewer', label: 'Viewer' },
    ],
    []
  );

  const loadUsers = async () => {
    if (!profile?.organization_id) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const rows = await adminUserService.listUsers(profile.organization_id);
      setUsers(rows as any[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [profile?.organization_id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAdmin) {
      setError('Only admins can provision users.');
      return;
    }

    try {
      setSubmitting(true);
      await adminUserService.inviteUser(form);
      setSuccess(`Invite sent to ${form.email}.`);
      setForm({ email: '', full_name: '', role: 'viewer' });
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to provision user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administration</h2>
        <p className="text-muted-foreground">Tenant setup, permissions, and admin-controlled user provisioning.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Provisioning</CardTitle>
          <CardDescription>Self-registration is disabled. Only admins can create accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isAdmin && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              You do not have permission to create users. Please contact an Admin.
            </div>
          )}

          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {success && (
            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-2 md:col-span-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                disabled={!isAdmin || submitting}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label>Full Name</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                disabled={!isAdmin || submitting}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label>Role</Label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as ProvisionRole }))}
                disabled={!isAdmin || submitting}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full" disabled={!isAdmin || submitting}>
                {submitting ? 'Provisioning...' : 'Create / Invite User'}
              </Button>
            </div>
          </form>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 bg-muted/50 text-xs font-semibold px-3 py-2">
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-3">Created</div>
            </div>

            {loading ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">No users in this organization yet.</div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="grid grid-cols-12 px-3 py-2 text-sm border-t">
                  <div className="col-span-4 truncate">{user.email}</div>
                  <div className="col-span-3 truncate">{user.full_name || '-'}</div>
                  <div className="col-span-2">{user.role}</div>
                  <div className="col-span-3">{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
