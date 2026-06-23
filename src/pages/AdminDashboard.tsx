import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Plus, Chrome as Home, Bell, Loader as Loader2, Pencil, Trash2 } from 'lucide-react';
import { ReviewList } from '@/components/admin/ReviewList';
import { ReviewForm } from '@/components/admin/ReviewForm';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import { AdminRatings } from '@/types/ratings';
import { PollManager } from '@/components/admin/PollManager';
import { UpdateForm } from '@/components/admin/UpdateForm';
import { useMovieUpdates, getCategoryInfo, type MovieUpdate } from '@/hooks/useMovieUpdates';
import { sendPushNotification } from '@/hooks/usePushNotifications';

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
  const [showUpdates, setShowUpdates] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'polls' | 'updates'>('reviews');
  const [editingReview, setEditingReview] = useState<{ id: string; data: ReviewFormData } | null>(null);
  const [editingUpdate, setEditingUpdate] = useState<MovieUpdate | null>(null);
  const [sendingDigest, setSendingDigest] = useState(false);
  
  const { reviews, loading, addReview, updateReview, deleteReview } = useAdminReviews();
  const { updates, loading: updatesLoading, removeUpdate } = useMovieUpdates();

  const handleSendWeeklyDigest = async () => {
    setSendingDigest(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-digest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ source: "admin" }),
        }
      );
      const data = await response.json();
      if (data.success) {
        toast({
          title: "📬 Weekly Digest Sent!",
          description: `Sent to ${data.pushResult?.sent || 0} subscribers. Top: ${data.top3?.map((r: any) => r.title).join(", ")}`,
        });
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err) {
      toast({
        title: "Failed to send digest",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSendingDigest(false);
    }
  };

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
      // Send push notification to all subscribers
      try {
        await sendPushNotification(
          `🎬 ${data.title}`,
          `⭐ New Review: ${data.title} - Rating: ${data.rating}/5 | Read now on SM Reviews!`,
          `/review/${encodeURIComponent(data.title)}`,
          'new-review',
          data.image || undefined
        );
        toast({ title: '🔔 Notification Sent!', description: 'All subscribers have been notified.' });
      } catch (err) {
        console.error('[Push] Failed to send notification:', err);
      }
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
                onClick={handleSendWeeklyDigest}
                disabled={sendingDigest}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {sendingDigest ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bell className="w-4 h-4 mr-2" />}
                Weekly Digest
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
            onClick={() => { setActiveTab('reviews'); setShowForm(false); setShowUpdates(false); }}
            variant={activeTab === 'reviews' ? "default" : "outline"}
            className={activeTab === 'reviews' ? "bg-white text-primary" : "bg-white/10 text-white border-white/20"}
          >
            🎬 Reviews
          </Button>
          <Button
            onClick={() => { setActiveTab('polls'); setShowForm(false); setShowUpdates(false); }}
            variant={activeTab === 'polls' ? "default" : "outline"}
            className={activeTab === 'polls' ? "bg-white text-primary" : "bg-white/10 text-white border-white/20"}
          >
            📊 Polls
          </Button>
          <Button
            onClick={() => { setActiveTab('updates'); setShowForm(false); setShowUpdates(false); }}
            variant={activeTab === 'updates' ? "default" : "outline"}
            className={activeTab === 'updates' ? "bg-white text-primary" : "bg-white/10 text-white border-white/20"}
          >
            📰 Updates
          </Button>
        </div>

        {activeTab === 'updates' ? (
          showUpdates ? (
            <UpdateForm onClose={() => { setShowUpdates(false); setEditingUpdate(null); }} editingUpdate={editingUpdate} />
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Movie Updates ({updates.length})</h2>
                <Button onClick={() => { setEditingUpdate(null); setShowUpdates(true); }} className="bg-white text-primary hover:bg-white/90">
                  <Plus className="w-4 h-4 mr-2" /> Publish New Update
                </Button>
              </div>

              {updatesLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-6xl mb-4">📰</p>
                  <p className="text-white/70">No updates published yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {updates.map((update) => {
                    const catInfo = getCategoryInfo(update.category);
                    return (
                      <div key={update.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-start gap-4">
                        {update.imageUrl && (
                          <img src={update.imageUrl} alt={update.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{catInfo.emoji} {catInfo.label}</span>
                            <span className="text-xs text-white/50">{update.createdAt.toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-white font-bold truncate">{update.movieName}</h3>
                          <p className="text-white/70 text-sm truncate">{update.title}</p>
                          <div className="flex gap-3 text-xs text-white/50 mt-1">
                            <span>👁 {update.views}</span>
                            <span>❤️ {update.likes}</span>
                            <span>💬 {update.comments}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingUpdate(update); setShowUpdates(true); }}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/30 h-8 w-8 p-0"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (window.confirm(`Delete "${update.title}"?`)) {
                                try {
                                  await removeUpdate(update.id);
                                  toast({ title: '🗑️ Update deleted' });
                                } catch (err) {
                                  toast({ title: 'Delete failed', variant: 'destructive' });
                                }
                              }
                            }}
                            className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/40 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )
        ) : activeTab === 'polls' ? (
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
