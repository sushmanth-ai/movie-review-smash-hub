import React from 'react';
import { Bell, BellRing, BellOff, Loader2 } from 'lucide-react';
import { useFCM } from '@/hooks/useFCM';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { useLanguage } from '@/i18n/LanguageContext';

export const NotificationBell = () => {
  const { token, isSupported, isLoading, requestPermission, removeToken } = useFCM();
  const { toast } = useToast();
  const { playSound } = useSound();
  const { t } = useLanguage();

  if (!isSupported) return null;

  const handleClick = async () => {
    playSound('click');

    if (token) {
      await removeToken();
    } else {
      const newToken = await requestPermission();
      if (newToken) {
        playSound('popup');
      }
    }
  };

  const isSubscribed = !!token;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`relative p-2 rounded-full transition-all duration-300 ${
        isSubscribed
          ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-primary border border-transparent'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSubscribed ? "Disable Notifications" : "Enable Notifications"}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isSubscribed ? (
        <BellRing className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
      {isSubscribed && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-green-500 animate-pulse" />
      )}
    </button>
  );
};
