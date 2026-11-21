// ============================================================================
// SERVICE WORKER — FAROL CIDADÃO DE SÃO PAULO (PWA)
// Versão do Cache: farol-sp-v1.4.1
// Recursos:
// - Modo Offline Resiliente com Cache-First para assets e Stale-While-Revalidate para rotas
// - Detecção e ciclo de vida de atualizações com SKIP_WAITING
// - Suporte a Notificações Nativas e Push do Sistema Operacional
// ============================================================================

const CACHE_NAME = "farol-cidadao-v1.4.1";

const PRECACHE_RESOURCES = [
  "/",
  "/offline",
  "/licitacoes",
  "/empresas",
  "/obras-atrasadas",
  "/contratacoes-atencao",
  "/como-funciona",
  "/sobre",
  "/conta",
  "/icon.svg",
];

// 1. Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_RESOURCES);
    })
  );
});

// 2. Ativação e Limpeza de Caches Antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interceptação de Requisições (Fetch)
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Não intercepta chamadas de API administrativa sensíveis ou mutações (POST/PUT/DELETE)
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/admin") ||
    url.pathname.startsWith("/api/sync")
  ) {
    return;
  }

  // Requisições de Navegação (Páginas HTML): Network-First com Fallback de Cache e tela /offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Salva página visitada no cache
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offlinePage = await caches.match("/offline");
          if (offlinePage) return offlinePage;
          return caches.match("/");
        })
    );
    return;
  }

  // Arquivos estáticos (JS, CSS, Imagens, Fontes): Cache-First com atualização em segundo plano
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Demais requisições GET (dados públicos): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Recebimento de Mensagens do Cliente (Atualização instantânea)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 5. Suporte a Notificações Nativas e Push
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Farol Cidadão • Alerta da Transparência";
  const options = {
    body: data.body || "Nova movimentação cívica registrada em São Paulo.",
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
