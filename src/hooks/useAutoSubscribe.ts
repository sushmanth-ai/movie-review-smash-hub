import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const AUTO_PROMPT_DELAY = 2000;

export const useAutoSubscribe = () => {
  const { isSupported, subscribe, permission, lastError } = usePushNotifications();
  const { toast } = useToast();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSupported || attempted.current) return;
    if (permission === 'denied') return;

    const trySubscribe = async () => {
      attempted.current = true;

      try {
        if (Notification.permission === 'granted' || Notification.permission === 'default') {
          console.log('[Push] Auto-subscribing, permission:', Notification.permission);
          const result = await subscribe();
          console.log('[Push] Auto-subscribe result:', result);
          
          if (!result) {
            console.error('[Push] Auto-subscribe failed');
          }
        }
      } catch (error) {
        console.error('[Push] Auto-subscribe error:', error);
      }
    };

    const timer = setTimeout(trySubscribe, AUTO_PROMPT_DELAY);
    return () => clearTimeout(timer);
  }, [isSupported, permission, subscribe]);
};
