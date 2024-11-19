// Importing workbox library.
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/workbox-sw/7.3.0/workbox-sw.min.js"
);

// The pre-cache assets credits.
const CACHE = "gharzah-cache";
const OFFLINE_WEBPAGE = "offline.min.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE_WEBPAGE))
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Enabling the navigation preload.
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;

          if (preloadResp) {
            return preloadResp;
          }

          const networkResp = await fetch(event.request);
          return networkResp;
        } catch (error) {
          const cache = await caches.open(CACHE);
          const cachedResp = await cache.match(OFFLINE_WEBPAGE);
          return cachedResp;
        }
      })()
    );
  }
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    self.registration.showNotification("Notification Title", {
      body: "Notification Body Text",
      icon: "./assets/icon.svg",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  clients.openWindow("web app url");
});
