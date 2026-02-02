self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open("finanzas").then(cache=>{
      return cache.addAll([
        "./",
        "./index.html",
        "./styles.css",
        "./app.js"
      ]);
    })
  );
});
