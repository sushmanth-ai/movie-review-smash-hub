
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment, getDocs, Timestamp, setDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { MovieReview, Comment } from '@/data/movieReviews';
import { useToast } from '@/hooks/use-toast';

export const useFirebaseOperations = () => {
  const { toast } = useToast();
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const [todayViews, setTodayViews] = useState<number>(0);

  // Load liked reviews from localStorage on component mount
  useEffect(() => {
    const savedLikedReviews = localStorage.getItem('likedReviews');
    if (savedLikedReviews) {
      try {
        const likedArray = JSON.parse(savedLikedReviews);
        setLikedReviews(new Set(likedArray));
      } catch (error) {
        console.error('Error parsing liked reviews from localStorage:', error);
      }
    }
  }, []);

  // Save liked reviews to localStorage whenever it changes
  const saveLikedReviewsToStorage = (newLikedReviews: Set<string>) => {
    try {
      localStorage.setItem('likedReviews', JSON.stringify(Array.from(newLikedReviews)));
    } catch (error) {
      console.error('Error saving liked reviews to localStorage:', error);
    }
  };

  const loadLikes = async (setReviews: React.Dispatch<React.SetStateAction<MovieReview[]>>) => {
    if (!db) return;
    
    try {
      const likesQuery = query(collection(db, 'likes'));
      const likesSnapshot = await getDocs(likesQuery);
      const likesData: { [key: string]: number } = {};
      
      likesSnapshot.forEach((doc) => {
        likesData[doc.id] = doc.data().count || 0;
      });

      setReviews(prev => prev.map(review => ({
        ...review,
        likes: likesData[review.id] || 0
      })));
      
      console.log('Likes loaded successfully');
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const loadComments = (setReviews: React.Dispatch<React.SetStateAction<MovieReview[]>>) => {
    if (!db) return;
    
    try {
      const commentsQuery = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
      onSnapshot(commentsQuery, (snapshot) => {
        const commentsData: { [key: string]: Comment[] } = {};
        const repliesData: { [key: string]: Comment[] } = {};
        
        // First pass: collect all comments and replies
        snapshot.forEach((doc) => {
          const commentData = doc.data();
          const comment: Comment & { reviewId: string; parentCommentId?: string } = {
            id: doc.id,
            text: commentData.text,
            timestamp: commentData.timestamp instanceof Timestamp 
              ? commentData.timestamp.toDate() 
              : new Date(commentData.timestamp),
            author: commentData.author,
            reviewId: commentData.reviewId,
            replies: []
          };
          
          if (commentData.parentCommentId) {
            // This is a reply
            if (!repliesData[commentData.parentCommentId]) {
              repliesData[commentData.parentCommentId] = [];
            }
            repliesData[commentData.parentCommentId].push(comment);
          } else {
            // This is a main comment
            if (!commentsData[comment.reviewId]) {
              commentsData[comment.reviewId] = [];
            }
            commentsData[comment.reviewId].push(comment);
          }
        });

        // Second pass: attach replies to their parent comments
        Object.keys(commentsData).forEach(reviewId => {
          commentsData[reviewId] = commentsData[reviewId].map(comment => ({
            ...comment,
            replies: repliesData[comment.id] || []
          }));
        });

        setReviews(prev => prev.map(review => ({
          ...review,
          comments: commentsData[review.id] || []
        })));
        
        console.log('Comments and replies loaded successfully');
      });
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async (reviewId: string, setReviews: React.Dispatch<React.SetStateAction<MovieReview[]>>) => {
    console.log('Like button clicked for:', reviewId);
    
    const isCurrentlyLiked = likedReviews.has(reviewId);
    const newLikedReviews = new Set(likedReviews);
    
    if (isCurrentlyLiked) {
      // Unlike the review
      newLikedReviews.delete(reviewId);
      setLikedReviews(newLikedReviews);
      
      // Update local state immediately for instant feedback
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, likes: Math.max(0, review.likes - 1) }
          : review
      ));
      
      toast({
        title: "Unliked!",
        description: "You have removed your like from this review.",
      });
    } else {
      // Like the review
      newLikedReviews.add(reviewId);
      setLikedReviews(newLikedReviews);
      
      // Update local state immediately for instant feedback
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, likes: review.likes + 1 }
          : review
      ));
      
      toast({
        title: "Liked!",
        description: "Your like has been recorded.",
      });
    }
    
    // Save to localStorage immediately
    saveLikedReviewsToStorage(newLikedReviews);

    if (!db) {
      toast({
        title: isCurrentlyLiked ? "Unliked! (Demo Mode)" : "Liked! (Demo Mode)",
        description: isCurrentlyLiked 
          ? "Unlike recorded locally - Firebase not available."
          : "Like recorded locally - Firebase not available.",
      });
      return;
    }

    try {
      const reviewRef = doc(db, 'likes', reviewId);
      
      if (isCurrentlyLiked) {
        // Decrement like count
        await updateDoc(reviewRef, {
          count: increment(-1)
        }).catch(async () => {
          // If document doesn't exist, create it with count 0
          await setDoc(reviewRef, {
            reviewId: reviewId,
            count: 0
          });
        });
        console.log('Like decremented successfully');
      } else {
        // Increment like count
        await updateDoc(reviewRef, {
          count: increment(1)
        }).catch(async () => {
          // If document doesn't exist, create it with count 1
          await setDoc(reviewRef, {
            reviewId: reviewId,
            count: 1
          });
        });
        console.log('Like incremented successfully');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast({
        title: isCurrentlyLiked ? "Unliked! (Demo Mode)" : "Liked! (Demo Mode)",
        description: isCurrentlyLiked
          ? "Unlike recorded locally - Firebase connection issue."
          : "Like recorded locally - Firebase connection issue.",
      });
    }
  };

  const handleComment = async (
    reviewId: string, 
    commentText: string, 
    setReviews: React.Dispatch<React.SetStateAction<MovieReview[]>>,
    setNewComment: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
  ) => {
    if (!commentText?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Ask for user name
    const userName = prompt("Please enter your name:");
    if (!userName?.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name to post a comment.",
        variant: "destructive"
      });
      return;
    }

    console.log('Comment submitted for:', reviewId, 'Text:', commentText, 'Author:', userName);

    const comment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      timestamp: new Date(),
      author: userName.trim()
    };

    // Clear the input immediately
    setNewComment(prev => ({ ...prev, [reviewId]: '' }));

    // Update local state first for immediate feedback
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, comments: [comment, ...review.comments] }
        : review
    ));

    if (!db) {
      toast({
        title: "Comment added! (Demo Mode)",
        description: "Comment saved locally - Firebase not available.",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'comments'), {
        reviewId,
        text: comment.text,
        timestamp: comment.timestamp,
        author: comment.author
      });

      console.log('Comment saved to Firebase successfully');
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Comment added! (Demo Mode)",
        description: "Comment saved locally - Firebase connection issue.",
      });
    }
  };

  const handleReply = async (
    reviewId: string,
    parentCommentId: string,
    replyText: string,
    setReviews: React.Dispatch<React.SetStateAction<MovieReview[]>>
  ) => {
    if (!replyText?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply before submitting.",
        variant: "destructive"
      });
      return;
    }

    // Ask for user name
    const userName = prompt("Please enter your name:");
    if (!userName?.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name to post a reply.",
        variant: "destructive"
      });
      return;
    }

    console.log('Reply submitted for comment:', parentCommentId, 'Text:', replyText, 'Author:', userName);

    const reply: Comment = {
      id: Date.now().toString(),
      text: replyText,
      timestamp: new Date(),
      author: userName.trim()
    };

    // Update local state first for immediate feedback
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        const updatedComments = review.comments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [reply, ...(comment.replies || [])]
            };
          }
          return comment;
        });
        return { ...review, comments: updatedComments };
      }
      return review;
    }));

    if (!db) {
      toast({
        title: "Reply added! (Demo Mode)",
        description: "Reply saved locally - Firebase not available.",
      });
      return;
    }

    try {
      await addDoc(collection(db, 'comments'), {
        reviewId,
        parentCommentId,
        text: reply.text,
        timestamp: reply.timestamp,
        author: reply.author
      });

      console.log('Reply saved to Firebase successfully');
      toast({
        title: "Reply added!",
        description: "Your reply has been posted.",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Reply added! (Demo Mode)",
        description: "Reply saved locally - Firebase connection issue.",
      });
    }
  };

  const handleShare = async (review: MovieReview) => {
    console.log('Share button clicked for:', review.title);
    
    const shareText = `Check out this movie review of ${review.title}: ${review.overall} - Rating: ${review.rating}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `SM Review: ${review.title}`,
          text: shareText,
          url: shareUrl
        });
        
        console.log('Content shared successfully via Web Share API');
        toast({
          title: "Shared!",
          description: "Review shared successfully.",
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Web Share API failed:', error);
        } else {
          console.log('Share was cancelled by user');
          return;
        }
      }
    }

    try {
      const textToShare = `${review.title}\n\n${shareText}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(textToShare);
      
      console.log('Content copied to clipboard successfully');
      toast({
        title: "Copied to Clipboard!",
        description: "Review details copied to clipboard for sharing.",
      });
    } catch (clipboardError) {
      console.error('Clipboard copy failed:', clipboardError);
      
      toast({
        title: "Share Content",
        description: shareText,
      });
    }
  };

  // Setup real-time listener for today's views
  const setupRealTimeViewListener = (setViewCount: React.Dispatch<React.SetStateAction<number>>) => {
    if (!db) return () => {};

    const today = new Date().toISOString().split('T')[0];
    const viewsRef = doc(db, 'dailyViews', today);

    const unsubscribe = onSnapshot(viewsRef, (doc) => {
      if (doc.exists()) {
        const count = doc.data().count || 0;
        setViewCount(count);
      } else {
        setViewCount(0);
      }
    }, (error) => {
      console.error('Error listening to view updates:', error);
    });

    return unsubscribe;
  };

  // Load today's views
  const loadTodayViews = async () => {
    if (!db) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const viewsRef = doc(db, 'dailyViews', today);
      const viewsSnap = await getDoc(viewsRef);
      
      if (viewsSnap.exists()) {
        const count = viewsSnap.data().count || 0;
        setTodayViews(count);
        console.log('Today views loaded successfully:', count);
      } else {
        setTodayViews(0);
      }
    } catch (error) {
      console.error('Error loading today views:', error);
    }
  };

  // Generate or get persistent user ID
  const getPersistentUserId = () => {
    let userId = localStorage.getItem('persistentUserId');
    if (!userId) {
      // Create a more unique user ID using browser fingerprinting elements
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: `${screen.width}x${screen.height}`,
        timestamp: Date.now(),
        random: Math.random().toString(36).substr(2, 9)
      };
      
      // Create a hash-like ID from browser info
      const hashCode = JSON.stringify(browserInfo).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      userId = `user_${Math.abs(hashCode)}_${browserInfo.random}`;
      localStorage.setItem('persistentUserId', userId);
      console.log('Generated new persistent user ID:', userId);
    }
    return userId;
  };

  // Clean up old view entries from localStorage
  const cleanupOldViewEntries = () => {
    const keys = Object.keys(localStorage);
    const viewKeys = keys.filter(key => key.startsWith('dailyView_'));
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    viewKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const { timestamp } = JSON.parse(data);
          const timeDiff = Date.now() - timestamp;
          
          if (timeDiff >= twentyFourHours) {
            localStorage.removeItem(key);
            console.log('Removed old view entry:', key);
          }
        }
      } catch (error) {
        // Invalid data, remove it
        localStorage.removeItem(key);
        console.log('Removed invalid view entry:', key);
      }
    });
  };

  // Track daily view for current user
  const trackDailyView = async () => {
    console.log('Tracking daily view for hostname:', window.location.hostname);
    
    // Clean up old entries first
    cleanupOldViewEntries();

    // Use persistent user ID that doesn't change on page reload
    const userId = getPersistentUserId();
    const dailyViewKey = `dailyView_${userId}`;
    
    // Check if user has already been counted in the last 24 hours
    const viewData = localStorage.getItem(dailyViewKey);
    if (viewData) {
      try {
        const { timestamp } = JSON.parse(viewData);
        const timeDiff = Date.now() - timestamp;
        const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (timeDiff < twentyFourHours) {
          console.log('User already counted in last 24 hours, skipping view increment');
          return;
        } else {
          console.log('24+ hours passed, allowing new view count');
        }
      } catch (error) {
        console.log('Invalid view data, clearing');
      }
    }
    
    // Mark user as viewed with current timestamp
    localStorage.setItem(dailyViewKey, JSON.stringify({ 
      viewed: true, 
      timestamp: Date.now(),
      userId: userId
    }));

    if (!db) {
      console.log('Daily view tracked locally - Firebase not available');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const viewsRef = doc(db, 'dailyViews', today);
      
      await runTransaction(db, async (transaction) => {
        const viewsDoc = await transaction.get(viewsRef);
        const currentCount = viewsDoc.exists() ? viewsDoc.data().count || 0 : 0;
        transaction.set(viewsRef, { 
          count: currentCount + 1,
          date: today,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      });
      
      console.log('Daily view tracked successfully for user:', userId);
    } catch (error) {
      console.error('Error tracking daily view:', error);
    }
  };

  // Function to reset live views to zero
  const resetLiveViews = async () => {
    try {
      // Clear all localStorage view tracking data
      const keys = Object.keys(localStorage);
      const viewKeys = keys.filter(key => key.startsWith('dailyView_') || key === 'persistentUserId');
      viewKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('Removed localStorage key:', key);
      });
      
      // Reset Firebase daily views to 0
      if (db) {
        const today = new Date().toISOString().split('T')[0];
        const viewsRef = doc(db, 'dailyViews', today);
        
        await setDoc(viewsRef, { 
          count: 0,
          date: today,
          lastUpdated: new Date().toISOString(),
          resetAt: new Date().toISOString()
        });
        
        console.log('Firebase daily views reset to 0');
      }
      
      // Reset local state
      setTodayViews(0);
      
      toast({
        title: "Reset Complete",
        description: "Live views have been reset to zero. Fresh start!",
      });
      
      console.log('Live views reset successfully');
    } catch (error) {
      console.error('Error resetting live views:', error);
      toast({
        title: "Error",
        description: "Failed to reset live views. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to clear all liked reviews (for testing purposes)
  const clearLikedReviews = () => {
    setLikedReviews(new Set());
    localStorage.removeItem('likedReviews');
    toast({
      title: "Cleared",
      description: "All liked reviews have been cleared.",
    });
  };

  return {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleReply,
    handleShare,
    likedReviews,
    clearLikedReviews,
    todayViews,
    loadTodayViews,
    trackDailyView,
    setupRealTimeViewListener,
    resetLiveViews
  };
};
