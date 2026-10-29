/* Lista de Lugares — guarda o guia no celular quando ele é aberto pelo link (https).
   Página e arquivos: tenta a rede primeiro (para receber atualizações) e cai no
   que está guardado quando a internet falha. Blocos do mapa já vistos também
   ficam guardados, então o mapa funciona offline nas áreas que ela já abriu. */
const GUIA = 'lista-lugares-guia-v1';
const MAPA = 'lista-lugares-mapa-v1';
const ESPERA_REDE = 4000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

/* a página manda a lista do que precisa guardar (ela mesma + scripts, fontes, estilos) */
self.addEventListener('message', e => {
  const urls = e.data && e.data.cachear;
  if (!urls) return;
  e.waitUntil(caches.open(GUIA).then(async c => {
    await Promise.all(urls.map(u => c.add(new Request(u, { mode: u.startsWith(self.location.origin) ? 'same-origin' : 'cors' })).catch(() => {})));
    (await self.clients.matchAll()).forEach(cl => cl.postMessage({ guardado: true }));
  }));
});

const comTempo = (p, ms) => Promise.race([p, new Promise((_, nao) => setTimeout(() => nao(new Error('lento')), ms))]);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/basemaps\.cartocdn\.com|tile\.openstreetmap/.test(url.hostname)) {
    e.respondWith(caches.open(MAPA).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(GUIA);
    try {
      const r = await comTempo(fetch(req), ESPERA_REDE);
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (erro) {
      return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' && (await c.match(url.pathname, { ignoreSearch: true }))) || Response.error();
    }
  })());
});
