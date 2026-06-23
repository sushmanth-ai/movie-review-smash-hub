import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { ReviewFormData } from '@/pages/AdminDashboard';

interface Review extends ReviewFormData {
  id: string;
}

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onEdit: (id: string, data: ReviewFormData) => void;
  onDelete: (id: string) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  loading,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="text-center py-8 text-white">
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-white">
        <p>No reviews yet. Add your first review!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-white/95 overflow-hidden">
          <img
            src={review.image}
            alt={review.title}
            className="w-full h-48 object-cover"
          />
          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-2">{review.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {review.review}
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="font-bold text-orange-600">{review.rating}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(review.id, review)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(review.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
