import { useState, useEffect, useCallback } from 'react';
import { messaging, db } from '@/utils/firebase';
import { getToken } from 'firebase/messaging';
import { collection, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const FCM_TOKEN_KEY = 'sm_fcm_token';
const VAPID_KEY = 'YOUR_VAPID_KEY'; // This should ideally be in env

export const useFCM = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(FCM_TOKEN_KEY));
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window);
  }, []);

  const registerToken = useCallback(async (newToken: string) => {
    if (!db) return;
    try {
      // Save token to Firestore in 'fcm_tokens' collection
      await setDoc(doc(db, 'fcm_tokens', newToken), {
        token: newToken,
        updatedAt: new Date(),
        platform: navigator.userAgent.includes('Android') ? 'android' : 'web'
      });
      console.log('FCM Token registered in database');
    } catch (error) {
      console.error('Error registering token:', error);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!messaging || !isSupported) return null;
    
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const currentToken = await getToken(messaging, {
          vapidKey: 'BMx2e6H7qX4_l_5Y5_z0-E6p8xQ8i0W9_l_5Y5_z0-E6p8xQ8i0W9_l_5Y5_z0-E6p' // Placeholder, user should provide real one or I generate
        });

        if (currentToken) {
          setToken(currentToken);
          localStorage.setItem(FCM_TOKEN_KEY, currentToken);
          await registerToken(currentToken);
          toast({
            title: "Notifications Enabled! 🔔",
            description: "You'll now receive real-time movie updates.",
          });
          return currentToken;
        } else {
          console.warn('No registration token available. Request permission to generate one.');
        }
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings to get updates.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('An error occurred while retrieving token:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [isSupported, registerToken, toast]);

  const removeToken = useCallback(async () => {
    if (!db || !token) return;
    try {
      await deleteDoc(doc(db, 'fcm_tokens', token));
      localStorage.removeItem(FCM_TOKEN_KEY);
      setToken(null);
      toast({
        title: "Notifications Disabled",
        description: "You will no longer receive push notifications.",
      });
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }, [token, toast]);

  return { token, isSupported, isLoading, requestPermission, removeToken };
};
