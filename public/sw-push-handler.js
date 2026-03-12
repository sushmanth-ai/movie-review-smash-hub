// Premium Native Style Push Notification Handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'SM Review 3.0',
    body: 'New update available!',
    url: '/',
    image: null,
    movieName: null,
  };

  try {
    if (event.data) {
      data = JSON.parse(event.data.text());
    }
  } catch (e) {
    console.error('Push Parse Error:', e);
  }

  // Map fields to match WhatsApp/Facebook Android tray style (shown in user image)
  // Bold Header -> Movie Name (e.g., Pushpa 3)
  // Subtext -> Update Title (e.g., Shooting Started)
  // Avatar -> Movie Poster
  // App Badge -> SM Review Logo
  
  const displayTitle = data.movieName || data.title || "SM Review 3.0";
  const displayBody = data.movieName ? data.title || data.body : data.body;

  const options = {
    body: displayBody,
    icon: data.image || '/pwa-icon-192.png', // Large avatar on the left
    badge: '/pwa-icon-192.png', // Small status bar / brand icon
    image: data.image, // Optional: show expanded big picture if available
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
    timestamp: data.timestamp || Date.now(),
    renotify: true,
    tag: 'sm-news-' + (data.movieName || 'update'),
    requireInteraction: false,
    silent: false,
    priority: 2,
    data: {
      url: data.url,
    },
    actions: [
      { action: 'open', title: '🎬 Open Now' },
      { action: 'dismiss', title: '✖️ Close' },
    ],
  };

  event.waitUntil(self.registration.showNotification(displayTitle, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
