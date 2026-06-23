// Push notification handlers - injected into PWA service worker scope
// This file is imported by the main service worker

self.addEventListener('push', (event) => {
  let data = {
    title: 'SM Review 3.0',
    body: 'New update available!',
    icon: '/pwa-icon-192.png',
    url: '/',
    tag: 'sm-review-update',
    image: null,
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('Push data parse error:', e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/pwa-icon-192.png',
    tag: data.tag,
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
    },
    actions: [
      { action: 'open', title: '🎬 Open' },
      { action: 'dismiss', title: '✖️ Dismiss' },
    ],
  };

  // Add large image if provided
  if (data.image) {
    options.image = data.image;
  }

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
