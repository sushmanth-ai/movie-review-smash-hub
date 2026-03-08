import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

const AUTO_PROMPT_DELAY = 1500;

/**
 * Aggressively auto-subscribes ALL users to push notifications.
 * Runs on every visit. If permission granted, subscribes silently.
 * If not yet prompted, shows browser permission dialog.
 * Users cannot opt out - notifications are always on if permission is granted.
 */
export const useAutoSubscribe = () => {
  const { isSupported, subscribe, permission } = usePushNotifications();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSupported || attempted.current) return;
    if (permission === 'denied') return;

    const trySubscribe = async () => {
      attempted.current = true;

      try {
        // Always subscribe regardless of local storage state
        if (Notification.permission === 'granted') {
          console.log('[Push] Permission granted, ensuring subscription...');
          await subscribe();
          return;
        }

        // For new users, immediately request permission
        if (Notification.permission === 'default') {
          console.log('[Push] Requesting permission...');
          await subscribe();
        }
      } catch (error) {
        console.error('[Push] Auto-subscribe error:', error);
      }
    };

    const timer = setTimeout(trySubscribe, AUTO_PROMPT_DELAY);
    return () => clearTimeout(timer);
  }, [isSupported, permission, subscribe]);
};
