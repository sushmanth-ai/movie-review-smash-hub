
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, updateDoc, doc, increment, getDocs, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { MovieReview, Comment } from '@/data/movieReviews';
import { useToast } from '@/hooks/use-toast';

export const useFirebaseOperations = () => {
  const { toast } = useToast();

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
        
        snapshot.forEach((doc) => {
          const commentData = doc.data();
          const comment: Comment & { reviewId: string } = {
            id: doc.id,
            text: commentData.text,
            timestamp: commentData.timestamp instanceof Timestamp 
              ? commentData.timestamp.toDate() 
              : new Date(commentData.timestamp),
            author: commentData.author,
            reviewId: commentData.reviewId
          };
          
          if (!commentsData[comment.reviewId]) {
            commentsData[comment.reviewId] = [];
          }
          commentsData[comment.reviewId].push(comment);
        });

        setReviews(prev => prev.map(review => ({
          ...review,
          comments: commentsData[review.id] || []
        })));
        
        console.log('Comments loaded successfully');
      });
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLike = async (reviewId: string, setReviews: React.Dispatch<React.SetStateAction<MovieReview[]>>) => {
    console.log('Like button clicked for:', reviewId);
    
    // Always update local state first for immediate feedback
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, likes: review.likes + 1 }
        : review
    ));

    if (!db) {
      toast({
        title: "Liked! (Demo Mode)",
        description: "Like recorded locally - Firebase not available.",
      });
      return;
    }

    try {
      const reviewRef = doc(db, 'likes', reviewId);
      
      try {
        await updateDoc(reviewRef, {
          count: increment(1)
        });
        console.log('Like updated successfully');
      } catch (updateError) {
        await setDoc(reviewRef, {
          reviewId: reviewId,
          count: 1
        });
        console.log('Like document created successfully');
      }
      
      toast({
        title: "Liked!",
        description: "Your like has been recorded.",
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Liked! (Demo Mode)",
        description: "Like recorded locally - Firebase connection issue.",
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
      });
      return;
    }

    console.log('Comment submitted for:', reviewId, 'Text:', commentText);

    const comment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      timestamp: new Date(),
      author: 'Anonymous User'
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

  return {
    loadLikes,
    loadComments,
    handleLike,
    handleComment,
    handleShare
  };
};
