import React from 'react';
import { useFCM } from '@/hooks/useFCM';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotificationToggle: React.FC = () => {
  const { token, requestPermission, removeToken, isLoading, isSupported } = useFCM();

  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${token ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {token ? <Bell size={24} /> : <BellOff size={24} />}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">
            {token ? 'Notifications Enabled' : 'Get Real-time Updates'}
          </span>
          <span className="text-xs text-gray-400">
            {token ? 'You are receiving movie reviews & news' : 'Never miss a review or news update'}
          </span>
        </div>
      </div>
      
      <Button
        onClick={token ? removeToken : requestPermission}
        disabled={isLoading}
        variant={token ? "outline" : "default"}
        className={`w-full mt-2 rounded-xl h-11 transition-all duration-300 ${token ? 'border-white/20 text-white hover:bg-white/10' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20'}`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : token ? (
          'Disable Notifications'
        ) : (
          'Enable Notifications'
        )}
      </Button>
    </div>
  );
};

export default NotificationToggle;
