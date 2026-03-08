import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Target, ChevronRight } from 'lucide-react';

interface ActiveMovie {
  id: string;
  title: string;
  image_url: string | null;
  release_date: string | null;
}

export const HomePredictions: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<ActiveMovie[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('prediction_movies')
        .select('id, title, image_url, release_date')
        .eq('is_active', true)
        .is('resolved_at', null)
        .order('created_at', { ascending: false })
        .limit(4);
      if (data) setMovies(data);
    };
    fetch();
  }, []);

  if (movies.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-primary/80 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4" /> 🎯 Predict Now
        </h3>
        <button
          onClick={() => navigate('/predictions')}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {movies.map(movie => (
          <button
            key={movie.id}
            onClick={() => navigate('/auth')}
            className="shrink-0 w-40 bg-card border border-primary/20 rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-[0_0_15px_rgba(255,215,0,0.15)] group"
          >
            <div className="h-24 overflow-hidden">
              {movie.image_url ? (
                <img src={movie.image_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                  <span className="text-3xl">🎬</span>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-foreground font-bold text-xs truncate">{movie.title}</p>
              {movie.release_date && (
                <p className="text-muted-foreground text-[10px] mt-0.5">
                  {new Date(movie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              )}
              <div className="mt-1.5 bg-primary/10 text-primary text-[10px] font-bold py-1 rounded-full text-center">
                Predict →
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
