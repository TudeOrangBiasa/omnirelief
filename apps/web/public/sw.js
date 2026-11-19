const VERSI = "omnirelief-v1";
const ASET_AWAL = ["/", "/transparansi", "/manifest.webmanifest"];

function publik(url) {
  return (
    url.pathname === "/" ||
    url.pathname === "/transparansi" ||
    url.pathname.startsWith("/m/") ||
    url.pathname.startsWith("/s/") ||
    url.pathname.startsWith("/api/publik/")
  );
}

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSI)
      .then((c) => c.addAll(ASET_AWAL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((semua) =>
        Promise.all(semua.filter((k) => k !== VERSI).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (!publik(url) && !url.pathname.startsWith("/_next/")) return;
  e.respondWith(
    caches.match(request).then((cocok) => {
      const ambil = fetch(request).then((res) => {
        if (res.ok) {
          const salin = res.clone();
          caches.open(VERSI).then((c) => c.put(request, salin));
        }
        return res;
      });
      return ambil.catch(() => cocok);
    })
  );
});
