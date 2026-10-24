var CACHE = 'laplace-pos-v2';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function save(req, res) {
  if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
  return res;
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  // Page : réseau d'abord (mises à jour immédiates), cache si hors ligne
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(function (res) { return save(req, res); }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
    }));
    return;
  }
  // Autres fichiers : cache d'abord, mise à jour en arrière-plan
  e.respondWith(caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) { return save(req, res); }).catch(function () { return hit; });
    return hit || net;
  }));
});
