import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
interface TodayViewsProps {
  viewCount: number;
}
export const TodayViews: React.FC<TodayViewsProps> = ({
  viewCount
}) => {
  return <div className="max-w-sm mx-auto mb-4 mt-6">
      <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 border-purple-500/50 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-600/20 via-transparent to-indigo-900/40"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-xs font-medium">LIVE</span>
        </div>
        
      </Card>
    </div>;
};