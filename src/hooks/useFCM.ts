import { useEffect } from 'react';
import { messaging, db } from '@/utils/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';

export const generateDeviceFingerprint = () => {
  let fingerprint = localStorage.getItem('device_fingerprint');
  if (!fingerprint) {
    // Basic entropy: timestamp + random + screen resolution + userAgent
    const str = `${Date.now()}-${Math.random()}-${window.screen.width}x${window.screen.height}-${navigator.userAgent}`;
    // Simple fast hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    fingerprint = `device_${Math.abs(hash).toString(16)}_${Date.now().toString(16)}`;
    localStorage.setItem('device_fingerprint', fingerprint);
  }
  return fingerprint;
};

export const useFCM = () => {
  useEffect(() => {
    const setupFCM = async () => {
      try {
        if (!messaging || !db) return;

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register SW to ensure FCM uses correct worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          
          const currentToken = await getToken(messaging, {
            // Add VAPID key if you have one, or configure in Firebase Console -> Cloud Messaging -> Web configuration
            // vapidKey: 'YOUR_VAPID_KEY_HERE', 
            serviceWorkerRegistration: registration,
          });

          if (currentToken) {
            console.log('FCM Token received');
            const deviceId = generateDeviceFingerprint();
            
            // Store token in Firestore for the Cloud Functions to use
            await setDoc(doc(db, 'fcm_tokens', deviceId), {
              token: currentToken,
              updatedAt: new Date(),
              platform: navigator.platform || 'web',
            }, { merge: true });

          } else {
            console.log('No registration token available.');
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    setupFCM();

    // Listen to foreground messages (optional if you want to show a toast while app is open)
    const unsubscribe = messaging ? onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      // Let the GlobalNotificationListener handle the toasted UI via firestore changes instead,
      // or implement custom in-app handling.
    }) : undefined;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
};
