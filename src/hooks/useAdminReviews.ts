import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useToast } from '@/hooks/use-toast';
import { ReviewFormData } from '@/pages/AdminDashboard';

interface Review extends ReviewFormData {
  id: string;
}

export const useAdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const reviewsQuery = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData: Review[] = [];
      snapshot.forEach((doc) => {
        reviewsData.push({
          id: doc.id,
          ...doc.data() as ReviewFormData
        });
      });
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading reviews:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addReview = async (data: ReviewFormData) => {
    if (!db) {
      toast({
        title: "Error",
        description: "Firebase not available",
        variant: "destructive"
      });
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        ...data,
        createdAt: new Date()
      });
      
      toast({
        title: "Success",
        description: "Review added successfully",
      });
    } catch (error) {
      console.error('Error adding review:', error);
      toast({
        title: "Error",
        description: "Failed to add review",
        variant: "destructive"
      });
    }
  };

  const updateReview = async (id: string, data: ReviewFormData) => {
    if (!db) {
      toast({
        title: "Error",
        description: "Firebase not available",
        variant: "destructive"
      });
      return;
    }

    try {
      const reviewRef = doc(db, 'reviews', id);
      await updateDoc(reviewRef, {
        ...data,
        updatedAt: new Date()
      });
      
      toast({
        title: "Success",
        description: "Review updated successfully",
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive"
      });
    }
  };

  const deleteReview = async (id: string) => {
    if (!db) {
      toast({
        title: "Error",
        description: "Firebase not available",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteDoc(doc(db, 'reviews', id));
      
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive"
      });
    }
  };

  return {
    reviews,
    loading,
    addReview,
    updateReview,
    deleteReview
  };
};
