// 우리반 습관 체크 — 서비스 워커
// 화면 파일만 저장해 두고, 체크 기록(Firebase)은 건드리지 않아요.
const CACHE = 'habit63-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // Firebase·글꼴 등 바깥 주소는 그대로 통과

  if (req.mode === 'navigate') {                         // 화면: 항상 최신 먼저, 인터넷이 끊기면 저장본
    e.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));  // 아이콘 등: 저장본 먼저
});
