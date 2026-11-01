// Limpiar TODO para el dominio actual
Promise.all([
  caches.keys().then(k => Promise.all(k.map(c => caches.delete(c)))),
  indexedDB.databases().then(dbs => Promise.all(dbs.map(d => indexedDB.deleteDatabase(d.name)))),
]).then(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(';').forEach(c => { document.cookie = c.replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`) });
}).then(() => location.reload());