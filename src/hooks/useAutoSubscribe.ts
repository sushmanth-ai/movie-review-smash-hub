import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

const AUTO_PROMPT_DELAY = 2000;

export const useAutoSubscribe = () => {
  const { isSupported, subscribe, permission } = usePushNotifications();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSupported || attempted.current) return;
    if (permission === 'denied') return;

    const trySubscribe = async () => {
      attempted.current = true;
      try {
        await subscribe();
      } catch (e) {
        console.error('[Push] Auto-subscribe error:', e);
      }
    };

    const timer = setTimeout(trySubscribe, AUTO_PROMPT_DELAY);
    return () => clearTimeout(timer);
  }, [isSupported, permission, subscribe]);
};
