// ChanZong Knowledge Base - Service Worker v1
const CACHE_NAME = 'chanzong-kb-v1';

const CORE_ASSETS = [
  '/',
  '/books',
  '/concepts',
  '/methods',
  '/qas',
  '/persons',
  '/graph',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Installing ChanZong KB SW...');
      await Promise.all(
        CORE_ASSETS.map(async (url) => {
          try {
            const resp = await fetch(url, { cache: 'no-cache' });
            if (resp.ok) {
              await cache.put(url, resp.clone());
            }
          } catch (e) {
            console.warn('[SW] Pre-cache failed for:', url, e.message);
          }
        })
      );
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
          return new Response(
            '<html><head><meta charset="utf-8"/><title>离线模式 - 禅宗知识库</title></head><body style="background:#0F172A;color:#fff;font-family:sans-serif;text-align:center;padding:50px 20px;"><h2>🙏 禅宗知识库 · 离线模式</h2><p style="color:#cbd5e1;">当前处于无网络连接状态，但已缓存的典籍与概念仍可继续离线阅读。</p><a href="/" style="color:#fbbf24;text-decoration:none;font-weight:bold;">返回首页</a></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      })
  );
});
