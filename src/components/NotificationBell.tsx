import React from 'react';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';

export const NotificationBell = () => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe } = usePushNotifications();
  const { toast } = useToast();
  const { playSound } = useSound();

  if (!isSupported) return null;

  const handleClick = async () => {
    playSound('click');

    if (permission === 'denied') {
      toast({
        title: '⚠️ Notifications Blocked',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
      return;
    }

    if (isSubscribed) {
      toast({
        title: '🔔 Notifications Active',
        description: 'You\'re receiving push notifications!',
      });
      return;
    }

    const success = await subscribe();
    if (success) {
      playSound('popup');
      toast({
        title: '🔔 Notifications Enabled!',
        description: 'You\'ll get notified about new reviews!',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: 'Could not enable notifications.',
        variant: 'destructive',
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`relative p-2 rounded-full transition-all duration-300 ${
        isSubscribed
          ? 'bg-primary/20 text-primary hover:bg-primary/30'
          : permission === 'denied'
          ? 'bg-destructive/20 text-destructive'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-primary'
      } ${isLoading ? 'animate-pulse' : ''}`}
      title={isSubscribed ? 'Notifications Active' : 'Enable Notifications'}
    >
      {permission === 'denied' ? (
        <BellOff className="w-5 h-5" />
      ) : isSubscribed ? (
        <BellRing className="w-5 h-5" />
      ) : (
        <Bell className="w-5 h-5" />
      )}
      {isSubscribed && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-green-500" />
      )}
    </button>
  );
};
