import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

const AUTO_PROMPT_DELAY = 2000; // 2 seconds after load

/**
 * Auto-subscribes users to push notifications on every visit.
 * If permission is already granted, subscribes silently.
 * If not yet prompted, shows the browser permission dialog.
 */
export const useAutoSubscribe = () => {
  const { isSupported, isSubscribed, subscribe, permission } = usePushNotifications();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSupported || attempted.current) return;
    if (permission === 'denied') return;

    // If already subscribed, re-subscribe to ensure the subscription is fresh
    // (browser may have invalidated the old push subscription)
    const trySubscribe = async () => {
      attempted.current = true;

      try {
        // Check if there's actually an active push subscription in the browser
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();

        if (existingSub && isSubscribed) {
          console.log('[Push] Already subscribed, subscription active');
          return;
        }

        // If permission already granted (e.g. PWA reinstall) or existing sub expired
        if (Notification.permission === 'granted') {
          console.log('[Push] Permission granted, subscribing...');
          const result = await subscribe();
          console.log('[Push] Subscribe result:', result);
          return;
        }

        // For new users, request permission
        if (Notification.permission === 'default') {
          console.log('[Push] Requesting permission...');
          const result = await subscribe();
          console.log('[Push] Subscribe result:', result);
        }
      } catch (error) {
        console.error('[Push] Auto-subscribe error:', error);
      }
    };

    const timer = setTimeout(trySubscribe, AUTO_PROMPT_DELAY);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, subscribe]);
};
