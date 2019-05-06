/**
* @license
* Copyright (c) Zev Isert, All rights reserved
* This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
*/

self.addEventListener('push', function(event) {
  const data = event.data.json()
  const title = data.title;
  const options = {
    body: data.body,
    data: data.url,
    icon: 'images/favicon.ico',
    badge: 'images/favicon.ico'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
