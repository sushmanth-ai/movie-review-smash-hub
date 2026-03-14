import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useMovieUpdates } from '@/hooks/useMovieUpdates';
import { useToast } from '@/hooks/use-toast';
import { sendPushNotification } from '@/hooks/usePushNotifications';
import { Loader as Loader2, CircleAlert as AlertCircle, Upload, Image, Video, X } from 'lucide-react';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CATEGORIES = [
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'trailer', label: '🎬 Trailer' },
  { value: 'teaser', label: '🎥 Teaser' },
  { value: 'release-date', label: '📅 Release Date' },
  { value: 'box-office', label: '📊 Box Office' },
  { value: 'shooting-update', label: '🎥 Shooting Update' },
  { value: 'breaking-news', label: '🔥 Breaking News' },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

interface UpdateFormProps {
  onClose: () => void;
}

export const UpdateForm: React.FC<UpdateFormProps> = ({ onClose }) => {
  const { addUpdate } = useMovieUpdates();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    movieName: '',
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    category: 'announcement' as string,
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast({ title: 'Image too large', description: 'Maximum image size is 5MB', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (selectedVideo) {
      toast({ title: 'Cannot upload both', description: 'Remove the video first to upload an image', variant: 'destructive' });
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(p => ({ ...p, imageUrl: '' }));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      toast({ title: 'Video too large', description: 'Maximum video size is 50MB', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({ title: 'Invalid file', description: 'Please select a video file', variant: 'destructive' });
      return;
    }

    if (selectedImage) {
      toast({ title: 'Cannot upload both', description: 'Remove the image first to upload a video', variant: 'destructive' });
      return;
    }

    setSelectedVideo(file);
    setForm(p => ({ ...p, videoUrl: '' }));
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storage = getStorage();
    const fileRef = storageRef(storage, path);
    
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(fileRef, file);
      task.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const detectType = (): 'image' | 'text' | 'video' => {
    if (selectedVideo || form.videoUrl) return 'video';
    if (selectedImage || form.imageUrl) return 'image';
    return 'text';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.movieName.trim() || !form.title.trim()) {
      setError('Movie name and title are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let imageUrl = form.imageUrl.trim();
      let videoUrl = form.videoUrl.trim();

      // Upload image if selected from device
      if (selectedImage) {
        setUploading(true);
        const timestamp = Date.now();
        const safeName = selectedImage.name.replace(/[^a-zA-Z0-9.]/g, '_');
        imageUrl = await uploadFile(selectedImage, `movie_updates/images/${timestamp}_${safeName}`);
        setUploading(false);
      }

      // Upload video if selected from device
      if (selectedVideo) {
        setUploading(true);
        const timestamp = Date.now();
        const safeName = selectedVideo.name.replace(/[^a-zA-Z0-9.]/g, '_');
        videoUrl = await uploadFile(selectedVideo, `movie_updates/videos/${timestamp}_${safeName}`);
        setUploading(false);
      }

      await addUpdate({
        movieName: form.movieName.trim(),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
        type: detectType(),
        category: form.category as any,
      });

      // Send push notification to all subscribers
      try {
        await sendPushNotification(
          `🔥 ${form.movieName}`,
          `${form.title} | SM Reviews`,
          '/movie-updates',
          'movie-update',
          imageUrl || undefined
        );
      } catch (err) {
        console.error('[Push] Notification send failed:', err);
      }

      toast({ title: '✅ Update Published!', description: `${form.movieName} update is now live.` });
      onClose();
    } catch (err: any) {
      console.error('[UpdateForm] Publish failed:', err);
      const msg = err?.message || 'Check connection and permissions';
      setError(msg);
      toast({ title: 'Error publishing update', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const isBusy = saving || uploading;

  return (
    <Card className="bg-white/95 max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-black">📰 Publish Movie Update</h2>
        <p className="text-sm text-gray-500">Upload images/videos from your device or paste URLs</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="font-mono text-xs break-all">{error}</AlertDescription>
            </Alert>
          )}

          {uploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Uploading media... {uploadProgress}%</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div>
            <Label className="text-black">🎬 Movie Name *</Label>
            <Input value={form.movieName} onChange={(e) => setForm(p => ({ ...p, movieName: e.target.value }))} required placeholder="e.g. Pushpa 3" className="bg-white text-black border-gray-300" />
          </div>

          <div>
            <Label className="text-black">📝 Update Title *</Label>
            <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Shooting Started in Hyderabad" className="bg-white text-black border-gray-300" />
          </div>

          <div>
            <Label className="text-black">📄 Description (optional)</Label>
            <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed update text..." rows={3} className="bg-white text-black border-gray-300" />
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-black">🖼️ Image</Label>
            {selectedImage ? (
              <div className="relative mt-2">
                <img src={imagePreview!} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black">
                  <X className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 mt-1">{selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(1)}MB)</p>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()} disabled={!!selectedVideo} className="flex-1 text-black border-gray-300 bg-white hover:bg-gray-50">
                  <Image className="w-4 h-4 mr-2" /> Upload from Device
                </Button>
                <Input 
                  value={form.imageUrl} 
                  onChange={(e) => setForm(p => ({ ...p, imageUrl: e.target.value }))} 
                  placeholder="or paste URL" 
                  className="flex-1 bg-white text-black border-gray-300"
                  disabled={!!selectedVideo}
                />
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>

          {/* Video Upload */}
          <div>
            <Label className="text-black">🎥 Video</Label>
            {selectedVideo ? (
              <div className="relative mt-2 bg-gray-100 p-3 rounded-lg flex items-center gap-3">
                <Video className="w-8 h-8 text-gray-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">{selectedVideo.name}</p>
                  <p className="text-xs text-gray-500">{(selectedVideo.size / 1024 / 1024).toFixed(1)}MB</p>
                </div>
                <button type="button" onClick={removeVideo} className="bg-black/10 p-1 rounded-full hover:bg-black/20">
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <Button type="button" variant="outline" onClick={() => videoInputRef.current?.click()} disabled={!!selectedImage} className="flex-1 text-black border-gray-300 bg-white hover:bg-gray-50">
                  <Video className="w-4 h-4 mr-2" /> Upload from Device
                </Button>
                <Input 
                  value={form.videoUrl} 
                  onChange={(e) => setForm(p => ({ ...p, videoUrl: e.target.value }))} 
                  placeholder="or paste YouTube URL" 
                  className="flex-1 bg-white text-black border-gray-300"
                  disabled={!!selectedImage}
                />
              </div>
            )}
            <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
          </div>

          <div>
            <Label className="text-black">🏷️ Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger className="bg-white text-black border-gray-300"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {(imagePreview || form.imageUrl || form.title) && (
            <div className="rounded-lg overflow-hidden border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs font-semibold mb-2 text-gray-500">Preview</p>
              {(imagePreview || form.imageUrl) && (
                <img src={imagePreview || form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-md mb-2" onError={(e) => (e.currentTarget.style.display = 'none')} />
              )}
              <p className="font-bold text-black">{form.movieName}</p>
              <p className="text-sm text-gray-700">{form.title}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isBusy} className="flex-1">
              {isBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Publish Update'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy} className="flex-1">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
