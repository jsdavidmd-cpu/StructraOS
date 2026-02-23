import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, X } from 'lucide-react';
import { progressService, ProgressPhoto } from '@/services/progressService';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface ProgressPhotosProps {
  projectId: string;
}

export default function ProgressPhotos({ projectId }: ProgressPhotosProps) {
  const profile = useAuthStore((state) => state.profile);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    date: new Date().toISOString().split('T')[0],
    caption: '',
    location: '',
    tags: '',
    file: null as File | null,
  });

  useEffect(() => {
    loadPhotos();
  }, [projectId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await progressService.getProgressPhotos(projectId);
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !profile?.id) {
      alert('Please select a file.');
      return;
    }

    try {
      setUploading(true);

      const photoData: ProgressPhoto = {
        project_id: projectId,
        date: uploadForm.date,
        caption: uploadForm.caption,
        location: uploadForm.location,
        tags: uploadForm.tags ? uploadForm.tags.split(',').map((t) => t.trim()) : [],
        uploaded_by: profile.id,
        storage_path: '', // Will be set by service
      };

      await progressService.uploadProgressPhoto(photoData, uploadForm.file);

      // Reset form
      setUploadForm({
        date: new Date().toISOString().split('T')[0],
        caption: '',
        location: '',
        tags: '',
        file: null,
      });
      setShowUploadForm(false);

      await loadPhotos();
      alert('Photo uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload photo:', err);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return;

    try {
      await progressService.deleteProgressPhoto(id, storagePath);
      await loadPhotos();
    } catch (err) {
      console.error('Failed to delete photo:', err);
      alert('Failed to delete photo.');
    }
  };

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('progress-photos')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  return (
    <div className="space-y-4">
      {/* Upload Form */}
      {showUploadForm ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upload Progress Photo</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowUploadForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={uploadForm.date}
                  onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  type="text"
                  value={uploadForm.location}
                  onChange={(e) => setUploadForm({ ...uploadForm, location: e.target.value })}
                  placeholder="e.g., Ground Floor, North Wing"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Caption</label>
              <Input
                type="text"
                value={uploadForm.caption}
                onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
                placeholder="Describe what this photo shows"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                placeholder="e.g., concrete, formwork, foundation"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Photo File</label>
              <Input type="file" accept="image/*" onChange={handleFileSelect} />
              {uploadForm.file && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {uploadForm.file.name}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={uploading || !uploadForm.file} className="gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setShowUploadForm(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Photo
          </Button>
        </div>
      )}

      {/* Photos Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Photos</CardTitle>
          <CardDescription>Visual documentation of project progress</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading photos...</div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No photos uploaded yet.</p>
              <p className="text-sm mt-2">Upload photos to document project progress.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={getPhotoUrl(photo.storage_path)}
                      alt={photo.caption || 'Progress photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {format(new Date(photo.date), 'MMM dd, yyyy')}
                        </div>
                        {photo.location && (
                          <div className="text-xs text-muted-foreground">{photo.location}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(photo.id, photo.storage_path)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                    {photo.caption && (
                      <p className="text-sm text-muted-foreground">{photo.caption}</p>
                    )}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {photo.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="text-xs bg-muted px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
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
