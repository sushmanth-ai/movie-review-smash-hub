import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Plus, Home, ShieldAlert } from 'lucide-react';
import { ReviewList } from '@/components/admin/ReviewList';
import { ReviewForm } from '@/components/admin/ReviewForm';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import { AdminRatings } from '@/types/ratings';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface ReviewFormData {
  title: string;
  image: string;
  review: string;
  firstHalf: string;
  secondHalf: string;
  positives: string;
  negatives: string;
  overall: string;
  rating: string;
  trailerUrl?: string;
  adminRatings?: AdminRatings;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, isAdmin, signOut } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<{ id: string; data: ReviewFormData } | null>(null);
  
  const { reviews, loading: reviewsLoading, addReview, updateReview, deleteReview } = useAdminReviews();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        // User is logged in but not admin - will show access denied
      }
    }
  }, [user, loading, isAdmin, navigate]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      navigate('/');
    }
  };

  const handleAddNew = () => {
    setEditingReview(null);
    setShowForm(true);
  };

  const handleEdit = (id: string, data: ReviewFormData) => {
    setEditingReview({ id, data });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteReview(id);
    }
  };

  const handleSubmit = async (data: ReviewFormData) => {
    if (editingReview) {
      await updateReview(editingReview.id, data);
    } else {
      await addReview(data);
    }
    setShowForm(false);
    setEditingReview(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-red-500 to-orange-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)'
      }}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex flex-col items-center gap-4">
              <ShieldAlert className="w-16 h-16 text-destructive" />
              <h1 className="text-2xl font-bold text-center">Access Denied</h1>
              <p className="text-sm text-muted-foreground text-center">
                You don't have admin privileges to access this area.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => navigate('/')}
              className="w-full"
            >
              Return to Home
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-orange-500">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Movie Reviews</h2>
              <Button
                onClick={handleAddNew}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Review
              </Button>
            </div>

            <ReviewList
              reviews={reviews}
              loading={reviewsLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </>
        ) : (
          <ReviewForm
            initialData={editingReview?.data}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={!!editingReview}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
