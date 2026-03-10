import React, { useState, useEffect } from 'react';
import { messaging } from '@/utils/firebase';
import { onMessage } from 'firebase/messaging';
import { X, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationData {
  title: string;
  body: string;
  image?: string;
  url?: string;
}

const NotificationOverlay: React.FC = () => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      if (payload.notification) {
        setNotification({
          title: payload.notification.title || 'SM Reviews',
          body: payload.notification.body || '',
          image: payload.notification.image || (payload.data?.image as string),
          url: payload.data?.url as string
        });
        setShow(true);

        // Auto hide after 6 seconds
        setTimeout(() => {
          setShow(false);
        }, 6000);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNotificationClick = () => {
    if (notification?.url) {
      if (notification.url.startsWith('http')) {
        window.open(notification.url, '_blank');
      } else {
        navigate(notification.url);
      }
    }
    setShow(false);
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none transition-all duration-500 ease-out ${show ? 'translate-y-5 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'}`}>
      {notification && (
        <div 
          onClick={handleNotificationClick}
          className="pointer-events-auto cursor-pointer group relative flex w-full max-w-md items-center gap-4 overflow-hidden rounded-2xl border border-white/20 bg-black/40 p-4 shadow-2xl backdrop-blur-xl transition-all hover:bg-black/50"
        >
            {/* Glassmorphism Background Glow */}
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20" />
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl group-hover:bg-purple-500/20" />

            {/* Icon / Image */}
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              {notification.image ? (
                <img src={notification.image} alt="Notification" className="h-full w-full object-cover" />
              ) : (
                <Bell className="h-7 w-7 text-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">SM Reviews Update</p>
                <span className="text-[10px] text-gray-400">Just now</span>
              </div>
              <h3 className="mt-0.5 truncate text-base font-bold text-white antialiased">
                {notification.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-snug text-gray-300 antialiased">
                {notification.body}
              </p>
            </div>

            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShow(false);
              }}
              className="ml-2 flex-shrink-0 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 h-1 w-full scale-x-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-500 group-hover:scale-x-100" />
          </div>
      )}
    </div>
  );
};

export default NotificationOverlay;
