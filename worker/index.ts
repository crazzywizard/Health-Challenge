/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Define interfaces for push event data
interface PushData {
  title?: string;
  body?: string;
  url?: string;
}

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  try {
    const data: PushData = event.data.json();
    const title = data.title || 'Health Challenge';
    const options: NotificationOptions = {
      body: data.body || 'You have a new update!',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.url || '/',
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('Error handling push event:', error);
  }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this URL
      for (const client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

export {};
