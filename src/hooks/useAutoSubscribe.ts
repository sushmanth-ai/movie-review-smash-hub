import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

const AUTO_PROMPT_KEY = 'sm_push_auto_prompted';
const AUTO_PROMPT_DELAY = 3000; // 3 seconds after load

/**
 * Auto-subscribes users to push notifications.
 * - If PWA is installed (standalone mode), subscribes silently.
 * - Otherwise, prompts once after a short delay.
 */
export const useAutoSubscribe = () => {
  const { isSupported, isSubscribed, subscribe, permission } = usePushNotifications();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSupported || isSubscribed || attempted.current) return;
    if (permission === 'denied') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    const alreadyPrompted = localStorage.getItem(AUTO_PROMPT_KEY);

    const trySubscribe = async () => {
      attempted.current = true;

      // If already granted (e.g. PWA reinstall), subscribe silently
      if (permission === 'granted' || Notification.permission === 'granted') {
        await subscribe();
        return;
      }

      // For standalone/installed PWA, auto-prompt immediately
      if (isStandalone) {
        await subscribe();
        localStorage.setItem(AUTO_PROMPT_KEY, 'true');
        return;
      }

      // For browser users, prompt once
      if (!alreadyPrompted) {
        await subscribe();
        localStorage.setItem(AUTO_PROMPT_KEY, 'true');
      }
    };

    const timer = setTimeout(trySubscribe, AUTO_PROMPT_DELAY);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, subscribe]);
};
