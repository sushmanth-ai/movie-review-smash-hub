import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { useLanguage } from '@/i18n/LanguageContext';

export const NotificationBell = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  
  const { toast } = useToast();
  const { playSound } = useSound();
  const { t } = useLanguage();

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  if (!isSupported) return null;

  const handleClick = async () => {
    playSound('click');

    if (permission === 'denied') {
      toast({
        title: t('notificationsBlocked'),
        description: t('notificationsBlockedDesc'),
        variant: 'destructive',
      });
      return;
    }

    if (permission === 'granted') {
      toast({
        title: t('notificationsActive'),
        description: t('notificationsActiveDesc'),
      });
      return;
    }

    const newPermission = await Notification.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      playSound('popup');
      toast({
        title: t('notificationsEnabled'),
        description: t('notificationsEnabledDesc'),
      });
      // The `useFCM` hook in App.tsx automatically captures the token once this permission is granted on the window scope.
    } else {
      toast({
        title: t('notificationsFailed'),
        description: t('notificationsFailedDesc'),
        variant: 'destructive',
      });
    }
  };

  const isSubscribed = permission === 'granted';

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 rounded-full transition-all duration-300 ${
        isSubscribed
          ? 'bg-primary/20 text-primary hover:bg-primary/30'
          : permission === 'denied'
          ? 'bg-destructive/20 text-destructive'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-primary'
      }`}
      title={isSubscribed ? t('notificationsActive') : t('enableNotifications')}
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
