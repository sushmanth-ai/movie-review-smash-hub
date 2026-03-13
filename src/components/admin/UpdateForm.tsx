import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useMovieUpdates } from '@/hooks/useMovieUpdates';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'trailer', label: '🎬 Trailer' },
  { value: 'teaser', label: '🎥 Teaser' },
  { value: 'release-date', label: '📅 Release Date' },
  { value: 'box-office', label: '📊 Box Office' },
  { value: 'shooting-update', label: '🎥 Shooting Update' },
  { value: 'breaking-news', label: '🔥 Breaking News' },
];

interface UpdateFormProps {
  onClose: () => void;
}

export const UpdateForm: React.FC<UpdateFormProps> = ({ onClose }) => {
  const { addUpdate } = useMovieUpdates();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    movieName: '',
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    category: 'announcement' as string,
  });

  const detectType = (): 'image' | 'text' | 'video' => {
    if (form.videoUrl) return 'video';
    if (form.imageUrl) return 'image';
    return 'text';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.movieName.trim() || !form.title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await addUpdate({
        movieName: form.movieName.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        videoUrl: form.videoUrl.trim(),
        type: detectType(),
        category: form.category as any,
      });
      toast({ title: '✅ Update Published!', description: `${form.movieName} update is now live.` });
      onClose();
    } catch (err: any) {
      console.error('[UpdateForm] Publish failed:', err);
      const msg = err?.message || 'Check connection and permissions';
      setError(msg);
      toast({ 
        title: 'Error publishing update', 
        description: msg, 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <h2 className="text-2xl font-bold">📰 Publish Movie Update</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Publishing Failed</AlertTitle>
              <AlertDescription className="font-mono text-xs break-all">
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div>
            <Label>🎬 Movie Name *</Label>
            <Input value={form.movieName} onChange={(e) => setForm(p => ({ ...p, movieName: e.target.value }))} required placeholder="e.g. Pushpa 3" />
          </div>
          <div>
            <Label>📝 Update Title *</Label>
            <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="e.g. Shooting Started in Hyderabad" />
          </div>
          <div>
            <Label>📄 Description (optional)</Label>
            <Textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed update text..." rows={3} />
          </div>
          <div>
            <Label>🖼️ Image URL (optional)</Label>
            <Input value={form.imageUrl} onChange={(e) => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="https://example.com/poster.jpg" />
          </div>
          <div>
            <Label>🎥 Video URL (optional)</Label>
            <Input value={form.videoUrl} onChange={(e) => setForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div>
            <Label>🏷️ Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm(p => ({ ...p, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {(form.imageUrl || form.title) && (
            <div className="rounded-lg overflow-hidden border p-3 bg-muted/30">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">Preview</p>
              {form.imageUrl && <img src={form.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-md mb-2" onError={(e) => (e.currentTarget.style.display = 'none')} />}
              <p className="font-bold">{form.movieName}</p>
              <p className="text-sm">{form.title}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Publish Update
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
