import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePredictions, PredictionMovie } from '@/hooks/usePredictions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Target, Star, TrendingUp, LogOut, Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const VERDICTS = [
  { value: 'hit', label: '🔥 Hit', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' },
  { value: 'average', label: '😐 Average', color: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
  { value: 'flop', label: '💀 Flop', color: 'bg-red-500/20 border-red-500/50 text-red-400' },
];

const COLLECTIONS = [
  { value: '0-50cr', label: '0-50 Cr' },
  { value: '50-100cr', label: '50-100 Cr' },
  { value: '100-200cr', label: '100-200 Cr' },
  { value: '200-500cr', label: '200-500 Cr' },
  { value: '500cr+', label: '500+ Cr' },
];

const RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

type Tab = 'active' | 'results' | 'leaderboard';

const PredictionsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { activeMovies, resolvedMovies, leaderboard, loading, submitPrediction, getUserPredictionForMovie } = usePredictions();
  const [tab, setTab] = useState<Tab>('active');

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </button>
          <h1 className="text-lg font-black text-primary flex items-center gap-2">
            <Target className="w-5 h-5" /> Predictions
          </h1>
          <button onClick={signOut} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="flex gap-2 bg-card rounded-full p-1 border border-primary/20">
          {([
            { key: 'active', label: 'Predict', icon: Target },
            { key: 'results', label: 'Results', icon: Star },
            { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-bold transition-all',
                tab === key
                  ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : tab === 'active' ? (
          <ActivePredictions movies={activeMovies} getUserPrediction={getUserPredictionForMovie} onSubmit={submitPrediction} />
        ) : tab === 'results' ? (
          <ResolvedPredictions movies={resolvedMovies} getUserPrediction={getUserPredictionForMovie} />
        ) : (
          <Leaderboard entries={leaderboard} userId={user.id} />
        )}
      </div>
    </div>
  );
};

// Active predictions
const ActivePredictions: React.FC<{
  movies: PredictionMovie[];
  getUserPrediction: (id: string) => any;
  onSubmit: (movieId: string, verdict: string | null, rating: number | null, collection: string | null) => void;
}> = ({ movies, getUserPrediction, onSubmit }) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">🎬</div>
        <p className="text-muted-foreground">No active predictions right now</p>
        <p className="text-muted-foreground/60 text-sm mt-1">Check back when new movies are announced!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {movies.map(movie => (
        <PredictionCard key={movie.id} movie={movie} existingPrediction={getUserPrediction(movie.id)} onSubmit={onSubmit} />
      ))}
    </div>
  );
};

// Single prediction card
const PredictionCard: React.FC<{
  movie: PredictionMovie;
  existingPrediction: any;
  onSubmit: (movieId: string, verdict: string | null, rating: number | null, collection: string | null) => void;
}> = ({ movie, existingPrediction, onSubmit }) => {
  const [verdict, setVerdict] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [collection, setCollection] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!verdict && !rating && !collection) return;
    setSubmitting(true);
    await onSubmit(movie.id, verdict, rating, collection);
    setSubmitting(false);
  };

  const alreadyPredicted = !!existingPrediction;

  return (
    <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.08)]">
      {/* Movie header */}
      <div className="relative h-40 overflow-hidden">
        {movie.image_url ? (
          <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
            <span className="text-5xl">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-xl font-black text-white drop-shadow-lg">{movie.title}</h3>
          {movie.release_date && (
            <p className="text-white/70 text-xs mt-0.5">
              Release: {new Date(movie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {alreadyPredicted ? (
        <div className="p-5">
          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 text-center">
            <span className="text-2xl">✅</span>
            <p className="text-primary font-bold mt-1">Prediction Submitted!</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3 text-sm">
              {existingPrediction.verdict_prediction && (
                <span className="bg-secondary px-3 py-1 rounded-full text-foreground">
                  Verdict: {existingPrediction.verdict_prediction}
                </span>
              )}
              {existingPrediction.rating_prediction && (
                <span className="bg-secondary px-3 py-1 rounded-full text-foreground">
                  Rating: {existingPrediction.rating_prediction}⭐
                </span>
              )}
              {existingPrediction.collection_prediction && (
                <span className="bg-secondary px-3 py-1 rounded-full text-foreground">
                  Collection: {existingPrediction.collection_prediction}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Verdict */}
          <div>
            <p className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Verdict Prediction
            </p>
            <div className="flex gap-2">
              {VERDICTS.map(v => (
                <button
                  key={v.value}
                  onClick={() => setVerdict(verdict === v.value ? null : v.value)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all',
                    verdict === v.value ? v.color + ' scale-105' : 'border-muted bg-secondary/50 text-muted-foreground hover:border-primary/30'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> Rating Prediction
            </p>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map(r => (
                <button
                  key={r}
                  onClick={() => setRating(rating === r ? null : r)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm font-bold transition-all',
                    rating === r
                      ? 'bg-primary/20 border-primary text-primary scale-105'
                      : 'border-muted bg-secondary/50 text-muted-foreground hover:border-primary/30'
                  )}
                >
                  {r}⭐
                </button>
              ))}
            </div>
          </div>

          {/* Collection */}
          <div>
            <p className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-1.5">
              💰 Box Office Prediction
            </p>
            <div className="flex flex-wrap gap-2">
              {COLLECTIONS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCollection(collection === c.value ? null : c.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-sm font-bold transition-all',
                    collection === c.value
                      ? 'bg-primary/20 border-primary text-primary scale-105'
                      : 'border-muted bg-secondary/50 text-muted-foreground hover:border-primary/30'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || (!verdict && !rating && !collection)}
            className="w-full bg-gradient-to-r from-primary via-yellow-500 to-primary text-primary-foreground font-bold py-3 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.4)] disabled:opacity-40"
          >
            {submitting ? 'Submitting...' : '🎯 Submit Prediction'}
          </Button>
        </div>
      )}
    </div>
  );
};

// Resolved predictions
const ResolvedPredictions: React.FC<{
  movies: PredictionMovie[];
  getUserPrediction: (id: string) => any;
}> = ({ movies, getUserPrediction }) => {
  if (movies.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📊</div>
        <p className="text-muted-foreground">No results yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {movies.map(movie => {
        const pred = getUserPrediction(movie.id);
        return (
          <div key={movie.id} className="bg-card border border-primary/20 rounded-2xl p-5">
            <h3 className="font-bold text-foreground text-lg">{movie.title}</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-secondary/50 p-3 rounded-xl">
                <p className="text-muted-foreground text-xs">Actual Verdict</p>
                <p className="text-foreground font-bold capitalize">{movie.actual_verdict || '-'}</p>
              </div>
              <div className="bg-secondary/50 p-3 rounded-xl">
                <p className="text-muted-foreground text-xs">Your Prediction</p>
                <p className="text-foreground font-bold capitalize">{pred?.verdict_prediction || '-'}</p>
              </div>
              {movie.actual_rating && (
                <>
                  <div className="bg-secondary/50 p-3 rounded-xl">
                    <p className="text-muted-foreground text-xs">Actual Rating</p>
                    <p className="text-foreground font-bold">{movie.actual_rating}⭐</p>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-xl">
                    <p className="text-muted-foreground text-xs">Your Rating</p>
                    <p className="text-foreground font-bold">{pred?.rating_prediction ? `${pred.rating_prediction}⭐` : '-'}</p>
                  </div>
                </>
              )}
            </div>
            {pred && (
              <div className="mt-3 text-center">
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold',
                  pred.points_earned > 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {pred.points_earned > 0 ? `🏆 +${pred.points_earned} points` : 'No points'}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Leaderboard
const Leaderboard: React.FC<{ entries: any[]; userId: string }> = ({ entries, userId }) => {
  const rankIcons = [Crown, Medal, Award];

  return (
    <div className="space-y-3">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🏆</div>
        <h2 className="text-xl font-black text-primary">Top Predictors</h2>
      </div>
      {entries.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No predictions yet. Be the first!</p>
      ) : (
        entries.map((entry, i) => {
          const RankIcon = rankIcons[i];
          const isMe = entry.id === userId;
          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all',
                isMe
                  ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
                  : 'bg-card border-primary/10'
              )}
            >
              <div className="w-8 text-center">
                {i < 3 && RankIcon ? (
                  <RankIcon className={cn('w-6 h-6 mx-auto', i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-orange-400')} />
                ) : (
                  <span className="text-muted-foreground font-bold">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('font-bold truncate', isMe ? 'text-primary' : 'text-foreground')}>
                  {entry.username} {isMe && '(You)'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.predictions_count} predictions · {entry.correct_predictions} correct
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary font-black text-lg">{entry.total_points}</p>
                <p className="text-muted-foreground text-xs">pts</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PredictionsPage;
