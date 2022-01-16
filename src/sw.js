const Chat_App = "My Chat Site";
const assets = [
    "/",
    "/src/views/index.html",
    "/src/views/directMessage.html",
    "/src/views/login.html",
    "/src/views/users.html",
    "/src/public/css/login.css",
    "/src/public/css/styles.css",
    "/src/public/js/login.js",
    "/src/public/js/app.js",
    "/src/public/js/dm.js"
]

self.addEventListener("install", installEvent =>{
    installEvent.waitUntil(
        caches.open(Chat_App).then(cache=> {
            cache.addAll(assets);
        })
    );
    installEvent.registerForeignFetch({
        scopes: ['*'], // or some sub-scope
        origins: ['*'] // or ['https://example.com']
      });
});

self.addEventListener("fetch", fetchEvent =>{
    if (fetchEvent.request.mode === 'same-origin') {
        fetchEvent.respondWith(localRequestLogic(fetchEvent.request));
    }
    fetchEvent.respondwith(
        caches.match(fetchEvent.request).then(res =>{
            return res || fetch(fetchEvent, request);
        })
    )
})

self.addEventListener('foreignfetch', event => {
    // The new Request will have credentials omitted by default.
    const noCredentialsRequest = new Request(event.request.url);
    event.respondWith(
      // Replace with your own request logic as appropriate.
      fetch(noCredentialsRequest)
        .catch(() => caches.match(noCredentialsRequest))
        .then(response => ({response}))
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
          .then((keyList) => {
            return Promise.all(keyList.map((key) => {
              if (key !== CACHE_NAME) {
                console.log('[ServiceWorker] Removing old cache', key)
                return caches.delete(key)
              }
            }))
          })
          .then(() => self.clients.claim())
    )
})