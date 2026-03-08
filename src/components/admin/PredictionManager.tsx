import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Trophy, CheckCircle, Film, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PredictionMovie {
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

interface PredictionWithUser {
  id: string;
  user_id: string;
  movie_id: string;
  verdict_prediction: string | null;
  rating_prediction: number | null;
  collection_prediction: string | null;
  points_earned: number;
  is_resolved: boolean;
  profiles: { username: string } | null;
}

export const PredictionManager: React.FC = () => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<PredictionMovie[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [resolvingMovie, setResolvingMovie] = useState<PredictionMovie | null>(null);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newReleaseDate, setNewReleaseDate] = useState('');

  // Resolve form state
  const [actualVerdict, setActualVerdict] = useState('');
  const [actualRating, setActualRating] = useState('');
  const [actualCollection, setActualCollection] = useState('');

  const fetchMovies = async () => {
    const { data } = await supabase
      .from('prediction_movies')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMovies(data);
    setLoading(false);
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleAddMovie = async () => {
    if (!newTitle.trim()) return;
    const { error } = await supabase.from('prediction_movies').insert({
      title: newTitle.trim(),
      image_url: newImageUrl.trim() || null,
      release_date: newReleaseDate || null,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: '🎬 Movie added!', description: `${newTitle} is now open for predictions.` });
    setNewTitle(''); setNewImageUrl(''); setNewReleaseDate('');
    setShowAddForm(false);
    fetchMovies();
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" and all its predictions?`)) return;
    // Delete predictions first, then movie
    await supabase.from('predictions').delete().eq('movie_id', id);
    const { error } = await supabase.from('prediction_movies').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Deleted', description: `${title} removed.` });
    fetchMovies();
  };

  const handleToggleActive = async (movie: PredictionMovie) => {
    await supabase.from('prediction_movies').update({ is_active: !movie.is_active }).eq('id', movie.id);
    fetchMovies();
  };

  const handleResolve = async () => {
    if (!resolvingMovie || !actualVerdict) return;

    // 1. Update movie with actual results
    const { error: movieError } = await supabase.from('prediction_movies').update({
      actual_verdict: actualVerdict,
      actual_rating: actualRating ? parseFloat(actualRating) : null,
      actual_collection: actualCollection.trim() || null,
      is_active: false,
      resolved_at: new Date().toISOString(),
    }).eq('id', resolvingMovie.id);

    if (movieError) {
      toast({ title: 'Error', description: movieError.message, variant: 'destructive' });
      return;
    }

    // 2. Fetch all predictions for this movie
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('movie_id', resolvingMovie.id)
      .eq('is_resolved', false);

    if (predictions && predictions.length > 0) {
      // 3. Calculate points for each prediction
      for (const pred of predictions) {
        let points = 0;

        // Verdict: exact match = 10 points
        if (pred.verdict_prediction && pred.verdict_prediction === actualVerdict) {
          points += 10;
        }

        // Rating: within 0.5 = 10pts, within 1 = 5pts
        if (pred.rating_prediction && actualRating) {
          const diff = Math.abs(pred.rating_prediction - parseFloat(actualRating));
          if (diff <= 0.5) points += 10;
          else if (diff <= 1) points += 5;
        }

        // Collection: exact match = 5 points
        if (pred.collection_prediction && actualCollection &&
            pred.collection_prediction === actualCollection) {
          points += 5;
        }

        // 4. Update prediction
        await supabase.from('predictions').update({
          points_earned: points,
          is_resolved: true,
        }).eq('id', pred.id);

        // 5. Update user profile points
        if (points > 0) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('total_points, predictions_count, correct_predictions')
            .eq('id', pred.user_id)
            .single();

          if (profile) {
            await supabase.from('profiles').update({
              total_points: profile.total_points + points,
              predictions_count: profile.predictions_count + 1,
              correct_predictions: profile.correct_predictions + (points >= 10 ? 1 : 0),
            }).eq('id', pred.user_id);
          }
        } else {
          // Still count as participated
          const { data: profile } = await supabase
            .from('profiles')
            .select('predictions_count')
            .eq('id', pred.user_id)
            .single();
          if (profile) {
            await supabase.from('profiles').update({
              predictions_count: profile.predictions_count + 1,
            }).eq('id', pred.user_id);
          }
        }
      }
    }

    toast({ title: '🏆 Movie resolved!', description: `Points awarded to ${predictions?.length || 0} predictions.` });
    setResolvingMovie(null);
    setActualVerdict(''); setActualRating(''); setActualCollection('');
    fetchMovies();
  };

  const activeMovies = movies.filter(m => !m.resolved_at);
  const resolvedMovies = movies.filter(m => m.resolved_at);

  return (
    <div className="space-y-6">
      {/* Add Movie */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">🎯 Prediction Movies</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-white text-primary hover:bg-white/90">
          {showAddForm ? <><X className="w-4 h-4 mr-2" /> Cancel</> : <><Plus className="w-4 h-4 mr-2" /> Add Movie</>}
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white/10 border-white/20">
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label className="text-white">Movie Title *</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Pushpa 3" className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white">Poster URL</Label>
              <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://..." className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white">Release Date</Label>
              <Input type="date" value={newReleaseDate} onChange={e => setNewReleaseDate(e.target.value)} className="bg-white/10 border-white/20 text-white" />
            </div>
            <Button onClick={handleAddMovie} className="bg-green-500 hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add Movie
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resolve Modal */}
      {resolvingMovie && (
        <Card className="bg-white/10 border-yellow-500/50 border-2">
          <CardHeader>
            <h3 className="text-lg font-bold text-yellow-400">🏆 Resolve: {resolvingMovie.title}</h3>
            <p className="text-white/60 text-sm">Enter actual results to award points</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Actual Verdict *</Label>
              <Select value={actualVerdict} onValueChange={setActualVerdict}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select verdict" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Blockbuster">🔥 Blockbuster</SelectItem>
                  <SelectItem value="Hit">✅ Hit</SelectItem>
                  <SelectItem value="Average">😐 Average</SelectItem>
                  <SelectItem value="Flop">❌ Flop</SelectItem>
                  <SelectItem value="Disaster">💀 Disaster</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white">Actual Rating (1-5)</Label>
              <Input type="number" min="1" max="5" step="0.5" value={actualRating} onChange={e => setActualRating(e.target.value)} className="bg-white/10 border-white/20 text-white" />
            </div>
            <div>
              <Label className="text-white">Box Office Collection Range</Label>
              <Select value={actualCollection} onValueChange={setActualCollection}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under 50Cr">Under 50Cr</SelectItem>
                  <SelectItem value="50-100Cr">50-100Cr</SelectItem>
                  <SelectItem value="100-200Cr">100-200Cr</SelectItem>
                  <SelectItem value="200-500Cr">200-500Cr</SelectItem>
                  <SelectItem value="500Cr+">500Cr+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleResolve} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                <Trophy className="w-4 h-4 mr-2" /> Resolve & Award Points
              </Button>
              <Button onClick={() => setResolvingMovie(null)} variant="outline" className="border-white/20 text-white">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Movies */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader><h3 className="text-lg font-bold text-white">🎬 Active ({activeMovies.length})</h3></CardHeader>
        <CardContent>
          {loading ? <p className="text-white/60">Loading...</p> : activeMovies.length === 0 ? (
            <p className="text-white/60">No active prediction movies. Add one above!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Title</TableHead>
                  <TableHead className="text-white/70">Release</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMovies.map(movie => (
                  <TableRow key={movie.id} className="border-white/10">
                    <TableCell className="text-white font-medium">{movie.title}</TableCell>
                    <TableCell className="text-white/70">{movie.release_date || '—'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${movie.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {movie.is_active ? 'Open' : 'Closed'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleToggleActive(movie)} className="text-white/70 hover:text-white h-8 px-2">
                          {movie.is_active ? '🔒 Close' : '🔓 Open'}
                        </Button>
                        <Button size="sm" onClick={() => { setResolvingMovie(movie); setActualVerdict(''); setActualRating(''); setActualCollection(''); }} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 h-8 px-2">
                          <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteMovie(movie.id, movie.title)} className="text-red-400 hover:text-red-300 h-8 px-2">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolved Movies */}
      {resolvedMovies.length > 0 && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader><h3 className="text-lg font-bold text-white">✅ Resolved ({resolvedMovies.length})</h3></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Title</TableHead>
                  <TableHead className="text-white/70">Verdict</TableHead>
                  <TableHead className="text-white/70">Rating</TableHead>
                  <TableHead className="text-white/70">Collection</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedMovies.map(movie => (
                  <TableRow key={movie.id} className="border-white/10">
                    <TableCell className="text-white font-medium">{movie.title}</TableCell>
                    <TableCell className="text-white/70">{movie.actual_verdict || '—'}</TableCell>
                    <TableCell className="text-white/70">{movie.actual_rating ? `${movie.actual_rating}⭐` : '—'}</TableCell>
                    <TableCell className="text-white/70">{movie.actual_collection || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
