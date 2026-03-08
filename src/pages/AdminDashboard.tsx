import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Home, Bell, Loader2 } from 'lucide-react';
import { ReviewList } from '@/components/admin/ReviewList';
import { ReviewForm } from '@/components/admin/ReviewForm';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import { AdminRatings } from '@/types/ratings';
import { PollManager } from '@/components/admin/PollManager';

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
  const [showForm, setShowForm] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [editingReview, setEditingReview] = useState<{ id: string; data: ReviewFormData } | null>(null);
  
  const { reviews, loading, addReview, updateReview, deleteReview } = useAdminReviews();

  useEffect(() => {
    // Check if logged in
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    navigate('/admin/login');
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

      <div className="container mx-auto px-4 py-8">
        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => { setShowPolls(false); setShowForm(false); }}
            variant={!showPolls ? "default" : "outline"}
            className={!showPolls ? "bg-white text-primary" : "bg-white/10 text-white border-white/20"}
          >
            🎬 Reviews
          </Button>
          <Button
            onClick={() => { setShowPolls(true); setShowForm(false); }}
            variant={showPolls ? "default" : "outline"}
            className={showPolls ? "bg-white text-primary" : "bg-white/10 text-white border-white/20"}
          >
            📊 Polls
          </Button>
        </div>

        {showPolls ? (
          <PollManager reviews={reviews.map(r => ({ id: r.id, title: r.title }))} />
        ) : !showForm ? (
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
              loading={loading}
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
