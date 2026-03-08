import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PredictionMovie {
  id: string;
  title: string;
  image_url: string | null;
  release_date: string | null;
  is_active: boolean;
  actual_verdict: string | null;
  actual_rating: number | null;
  actual_collection: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  movie_id: string;
  verdict_prediction: string | null;
  rating_prediction: number | null;
  collection_prediction: string | null;
  points_earned: number;
  is_resolved: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  total_points: number;
  predictions_count: number;
  correct_predictions: number;
}

export const usePredictions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movies, setMovies] = useState<PredictionMovie[]>([]);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    const { data } = await supabase
      .from('prediction_movies')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMovies(data);
  };

  const fetchUserPredictions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id);
    if (data) setUserPredictions(data);
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, total_points, predictions_count, correct_predictions')
      .order('total_points', { ascending: false })
      .limit(20);
    if (data) setLeaderboard(data);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMovies(), fetchUserPredictions(), fetchLeaderboard()]);
      setLoading(false);
    };
    load();
  }, [user]);

  const submitPrediction = async (
    movieId: string,
    verdict: string | null,
    rating: number | null,
    collection: string | null
  ) => {
    if (!user) return;

    const { error } = await supabase.from('predictions').insert({
      user_id: user.id,
      movie_id: movieId,
      verdict_prediction: verdict,
      rating_prediction: rating,
      collection_prediction: collection,
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already predicted!', description: 'You already made a prediction for this movie.', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
      return;
    }

    toast({ title: '🎯 Prediction submitted!', description: 'Good luck! Points will be awarded after release.' });
    await fetchUserPredictions();
  };

  const getUserPredictionForMovie = (movieId: string) => {
    return userPredictions.find(p => p.movie_id === movieId);
  };

  return {
    movies,
    userPredictions,
    leaderboard,
    loading,
    submitPrediction,
    getUserPredictionForMovie,
    fetchMovies,
    activeMovies: movies.filter(m => m.is_active && !m.resolved_at),
    resolvedMovies: movies.filter(m => m.resolved_at),
  };
};
