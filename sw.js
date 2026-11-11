/* Mondiloo service worker: works offline and picks up updates.
   When you publish an update, change VERSION below so phones download the new files. */
const VERSION = "mondiloo-2.3.2";
const CORE = ["./", "index.html", "app.html", "css/app.css", "js/content.js", "js/app.js", "js/voice-ht.js", "manifest.webmanifest",
  "privacy.html", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "mondiloo-fonts" && k !== "mondiloo-songs").map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Google Fonts: cache once, reuse offline
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    e.respondWith(caches.open("mondiloo-fonts").then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      const res = await fetch(e.request); c.put(e.request, res.clone()); return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Songs: the first time a song is played the whole file is saved, so it plays offline afterwards
  if ((url.pathname.includes("/songs/") || url.pathname.includes("/audio/")) && url.pathname.endsWith(".mp3")) {
    e.respondWith(caches.open("mondiloo-songs").then(async c => {
      const key = url.origin + url.pathname, hit = await c.match(key); if (hit) return hit;
      const res = await fetch(key); if (res.ok && res.status === 200) c.put(key, res.clone()); return res;
    }).catch(() => fetch(e.request)));
    return;
  }
  // App files: use the cached copy (fast + offline); updates arrive through a new VERSION
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
