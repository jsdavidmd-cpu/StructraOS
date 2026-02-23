import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { Upload, FileText, Trash2, Eye } from 'lucide-react';

interface Document {
  id: string;
  project_id: string | null;
  name: string;
  type: string;
  file_url: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export default function DocumentsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const profile = useAuthStore((state) => state.profile);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'specification',
    file: null as File | null,
  });

  const documentTypes = [
    { value: 'specification', label: 'Specification' },
    { value: 'drawing', label: 'Drawing' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'transmittal', label: 'Transmittal' },
    { value: 'rfi', label: 'RFI (Request for Information)' },
    { value: 'nco', label: 'NCO (Notice of Change Order)' },
    { value: 'contract', label: 'Contract' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const loadDocuments = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let query = supabase
          .from('documents')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false });

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error: queryError } = await query;

        if (queryError) throw queryError;
        setDocuments((data || []) as Document[]);
      } catch (err: any) {
        console.error('Failed to load documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    void loadDocuments();
  }, [profile?.organization_id, projectId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.file) {
      setError('Please fill in all fields');
      return;
    }

    if (!profile?.organization_id) {
      setError('Organization not found');
      return;
    }

    try {
      setUploading(true);

      // For now, store document metadata without actual file storage
      // In production, you'd upload to Supabase Storage or similar
      const docRecord = {
        organization_id: profile.organization_id,
        project_id: projectId || null,
        name: formData.name,
        type: formData.type,
        file_url: null,
        uploaded_by: profile.id,
      };

      const { data, error: insertError } = await (supabase
        .from('documents') as any)
        .insert([docRecord])
        .select();

      if (insertError) throw insertError;

      setSuccess(`Document "${formData.name}" uploaded successfully.`);
      setFormData({ name: '', type: 'specification', file: null });
      if (data) setDocuments([...documents, data[0] as Document]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (deleteError) throw deleteError;

      setDocuments(documents.filter((d) => d.id !== docId));
      setSuccess('Document deleted.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">
          {projectId ? 'Project files, transmittals, RFIs, and controlled records.' : 'Manage all project documents and records.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Add specifications, drawings, schedules, or other project documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Structural Drawings Revision 2"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <Label>Document Type</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  disabled={uploading}
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button type="submit" className="w-full" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents Library</CardTitle>
          <CardDescription>{documents.length} document(s) in library</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading documents...</p>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {documentTypes.find((t) => t.value === doc.type)?.label} •{' '}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.file_url && (
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(doc.id)}
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
