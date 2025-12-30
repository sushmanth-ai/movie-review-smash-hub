import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';
import { ReviewFormData } from '@/pages/AdminDashboard';
import { AdminRatings, calculateAdminOverall } from '@/types/ratings';

interface ReviewFormProps {
  initialData?: ReviewFormData;
  onSubmit: (data: ReviewFormData) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const RATING_CATEGORIES: { key: keyof AdminRatings; label: string; emoji: string }[] = [
  { key: 'story', label: 'Story', emoji: '📖' },
  { key: 'acting', label: 'Acting', emoji: '🎭' },
  { key: 'music', label: 'Music', emoji: '🎵' },
  { key: 'direction', label: 'Direction', emoji: '🎬' },
  { key: 'cinematography', label: 'Cinematography', emoji: '📷' },
  { key: 'rewatchValue', label: 'Rewatch Value', emoji: '🔄' },
];

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
    rating: '',
    adminRatings: {
      story: 3,
      acting: 3,
      music: 3,
      direction: 3,
      cinematography: 3,
      rewatchValue: 3,
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        adminRatings: initialData.adminRatings || {
          story: 3,
          acting: 3,
          music: 3,
          direction: 3,
          cinematography: 3,
          rewatchValue: 3,
        }
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof ReviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRatingChange = (category: keyof AdminRatings, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      adminRatings: {
        ...prev.adminRatings!,
        [category]: value[0]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate overall rating from admin ratings
    const adminOverall = calculateAdminOverall(formData.adminRatings!);
    onSubmit({
      ...formData,
      rating: `${adminOverall} STARS`
    });
  };

  const renderStars = (value: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 font-bold text-primary">{value}/5</span>
      </div>
    );
  };

  const adminOverall = formData.adminRatings ? calculateAdminOverall(formData.adminRatings) : 0;

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

          {/* Category-wise Ratings Section */}
          <div className="border-2 border-primary/30 rounded-lg p-4 bg-gradient-to-r from-primary/5 to-primary/10">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              ⭐ Category-Wise Ratings (Critic Score)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RATING_CATEGORIES.map(({ key, label, emoji }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">
                      {emoji} {label}
                    </Label>
                    {renderStars(formData.adminRatings?.[key] || 3)}
                  </div>
                  <Slider
                    value={[formData.adminRatings?.[key] || 3]}
                    onValueChange={(value) => handleRatingChange(key, value)}
                    min={1}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            {/* Overall Critic Score */}
            <div className="mt-6 pt-4 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  🎬 Overall Critic Rating:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-primary">
                    {adminOverall}
                  </span>
                  <span className="text-lg text-muted-foreground">/5 STARS</span>
                </div>
              </div>
            </div>
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
