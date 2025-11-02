import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ReviewFormData } from '@/pages/AdminDashboard';

interface ReviewFormProps {
  initialData?: ReviewFormData;
  onSubmit: (data: ReviewFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    title: '',
    image: '',
    review: '',
    firstHalf: '',
    secondHalf: '',
    positives: '',
    negatives: '',
    overall: '',
    rating: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof ReviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Edit Review' : 'Add New Review'}
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">🎞️ Movie Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="Enter movie title"
            />
          </div>

          <div>
            <Label htmlFor="image">🖼️ Poster Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              required
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <Label htmlFor="review">🎬 Short Description</Label>
            <Textarea
              id="review"
              value={formData.review}
              onChange={(e) => handleChange('review', e.target.value)}
              required
              placeholder="Brief overview of the movie"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="firstHalf">First Half Review</Label>
            <Textarea
              id="firstHalf"
              value={formData.firstHalf}
              onChange={(e) => handleChange('firstHalf', e.target.value)}
              required
              placeholder="Detailed review of the first half"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="secondHalf">Second Half Review</Label>
            <Textarea
              id="secondHalf"
              value={formData.secondHalf}
              onChange={(e) => handleChange('secondHalf', e.target.value)}
              required
              placeholder="Detailed review of the second half"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="positives">✅ Positives</Label>
            <Textarea
              id="positives"
              value={formData.positives}
              onChange={(e) => handleChange('positives', e.target.value)}
              required
              placeholder="List the strengths (storyline, acting, visuals, etc.)"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="negatives">❌ Negatives</Label>
            <Textarea
              id="negatives"
              value={formData.negatives}
              onChange={(e) => handleChange('negatives', e.target.value)}
              required
              placeholder="List the weaknesses (pacing, writing, etc.)"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="overall">Overall Review</Label>
            <Textarea
              id="overall"
              value={formData.overall}
              onChange={(e) => handleChange('overall', e.target.value)}
              required
              placeholder="Final thoughts and overall impression"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="rating">⭐ Overall Rating</Label>
            <Input
              id="rating"
              value={formData.rating}
              onChange={(e) => handleChange('rating', e.target.value)}
              required
              placeholder="e.g., 4 STARS or 3.5 STARS"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {isEditing ? 'Update Review' : 'Add Review'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
