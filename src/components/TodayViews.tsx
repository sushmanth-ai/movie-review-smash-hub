import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TodayViewsProps {
  viewCount: number;
}

export const TodayViews: React.FC<TodayViewsProps> = ({ viewCount }) => {
  return (
    <div className="max-w-md mx-auto mb-6">
      <Card className="bg-gradient-to-br from-black via-red-900 to-red-600 border-red-500/50 backdrop-blur-xl shadow-2xl hover:shadow-red-500/40 transition-all duration-700 hover:scale-110 hover:-rotate-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-black/30"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-300"></div>
        <CardContent className="relative flex items-center justify-center gap-5 p-8">
          <div className="bg-gradient-to-br from-red-500/40 to-black/60 p-5 rounded-full shadow-2xl backdrop-blur-md border border-red-400/30 hover:scale-110 transition-transform duration-300">
            <Users className="h-8 w-8 text-red-300 drop-shadow-2xl" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-4xl drop-shadow-2xl tracking-tight bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">{viewCount.toLocaleString()}</p>
            <p className="text-red-200/95 text-sm font-bold tracking-[0.2em] uppercase drop-shadow-lg">Today's Views</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};