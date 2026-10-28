// A relative URL keeps the worker inside the GitHub Pages project scope.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.warn('Offline support could not be started:', error);
    });
  });
}
