import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TodayViewsProps {
  viewCount: number;
}

export const TodayViews: React.FC<TodayViewsProps> = ({ viewCount }) => {
  return (
    <div className="max-w-sm mx-auto mb-4 mt-6">
      <Card className="bg-gradient-to-br from-black via-red-900 to-red-600 border-red-500/50 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-black/30"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-300"></div>
        <CardContent className="relative flex items-center justify-center gap-3 p-4 pt-6">
          <div className="bg-gradient-to-br from-red-500/40 to-black/60 p-3 rounded-full shadow-xl backdrop-blur-md border border-red-400/30">
            <Users className="h-5 w-5 text-red-300 drop-shadow-xl" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <p className="text-white font-black text-2xl drop-shadow-xl tracking-tight bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent">{viewCount.toLocaleString()}</p>
            <p className="text-red-200/95 text-xs font-bold tracking-[0.2em] uppercase drop-shadow-lg">Today's Views</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};