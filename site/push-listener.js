/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 * This code is used under the licence available at https://github.com/zevisert/zuzi-site/LICENCE.txt
 */

self.addEventListener("push", function (event) {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      // Visual Options
      // body: "<String>",
      // icon: "<URL String>",
      // image: "<URL String>",
      // badge: "<URL String>",
      // vibrate: "<Array of Integers>",
      // sound: "<URL String>",
      // dir: "<String of 'auto' | 'ltr' | 'rtl'>",
      body: data.body,
      image: data.image,
      icon: "images/favicon.ico",
      badge: "images/favicon.ico",

      // Behavioural Options
      // tag: "<String>",
      // data: "<Anything>",
      // requireInteraction: "<boolean>",
      // renotify: "<Boolean>",
      // silent: "<Boolean>",
      data: data.url,

      // Both Visual & Behavioural Options
      // actions: "<Array of { action: <String>, title: <String>, icon: <String> }>",

      // Information Option. No visual affect.
      // timestamp: "<Long>"
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  if (!event.action) {
    // Click on body
  } else {
    switch (event.action) {
      default:
        break;
    }
  }

  const urlToOpen = new URL(event.notification.data, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        const matchingClient = Array.from(windowClients).find(
          (client) => client.url === urlToOpen
        );

        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
