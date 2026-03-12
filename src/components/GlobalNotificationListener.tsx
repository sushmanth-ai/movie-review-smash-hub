import { useEffect, useRef } from 'react';
import { db } from '@/utils/firebase';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { getCategoryInfo } from '@/hooks/useMovieUpdates';
import { useNavigate } from 'react-router-dom';

export const GlobalNotificationListener = () => {
  const navigate = useNavigate();
  // Keep track of when we started listening so we don't show toasts for old updates
  const initTimeRef = useRef(Date.now());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!db) return;

    // Listen to the most recent update
    const q = query(
      collection(db, 'movie_updates'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialLoadRef.current) {
        // Skip the first snapshot because it contains existing data
        isInitialLoadRef.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Double check it's actually new (created after we loaded)
          const createdAtDate = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt);
            
          if (createdAtDate.getTime() > initTimeRef.current) {
            const catInfo = getCategoryInfo(data.category || 'announcement');
            
            // Show custom WhatsApp/Way2News style toast
            toast.custom((t) => (
              <div 
                className="w-[calc(100vw-32px)] sm:w-[400px] pointer-events-auto bg-white/95 backdrop-blur-md border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex gap-4 items-start cursor-pointer hover:bg-gray-50/90 transition-all duration-300 ring-1 ring-black/5"
                onClick={() => {
                  toast.dismiss(t);
                  navigate('/updates');
                }}
              >
                {data.imageUrl ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 ring-1 ring-black/5">
                    <img 
                      src={data.imageUrl} 
                      alt={data.movieName || 'Update image'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl sm:text-3xl ring-1 ring-primary/10">
                    {catInfo.emoji}
                  </div>
                )}
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      New Update
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium">Just now</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate pr-4 leading-tight">
                    {data.movieName || 'Movie Update'}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1 leading-snug">
                    {data.title || 'Tap to view details'}
                  </p>
                </div>
              </div>
            ), {
              duration: 6000,
              position: 'top-center',
            });
          }
        }
      });
    }, (error) => {
      console.error('[GlobalNotificationListener] Error:', error);
    });

    return () => unsubscribe();
  }, [navigate]);

  return null;
};
