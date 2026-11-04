// Only the signed-in owner's newest request is observed; no request data is stored locally.
const config = {
  apiKey: 'AIzaSyDNhB8EMckVFlh3r2hSJr9KRZv6Pjlv65w',
  authDomain: 'denis-komarov---aviation.firebaseapp.com',
  projectId: 'denis-komarov---aviation',
  appId: '1:700960122590:web:6dd66719232e8aaa35c44f',
};
const labels = {
  none: ['Нет заявки', 'No request', 'Nessuna richiesta'],
  new: ['Новая', 'New', 'Nuova'],
  review: ['Рассматривается', 'In review', 'In esame'],
  confirmed: ['Подтверждена', 'Confirmed', 'Confermata'],
  declined: ['Отклонена', 'Declined', 'Rifiutata'],
  completed: ['Завершена', 'Completed', 'Completata'],
  cancelled: ['Отменена', 'Cancelled', 'Annullata'],
  unavailable: ['Статус недоступен', 'Status unavailable', 'Stato non disponibile'],
};
const dot = document.querySelector('#request-status-dot');
let current = 'none';
function renderStatus(status) {
  current = Object.hasOwn(labels, status) ? status : 'unavailable';
  dot.dataset.status = current;
  const lang = document.documentElement.lang;
  const label = labels[current][lang === 'it' ? 2 : lang === 'en' ? 1 : 0];
  dot.setAttribute('aria-label', label);
  dot.title = label;
}
if (dot) {
  renderStatus('none');
  new MutationObserver(() => renderStatus(current)).observe(document.documentElement, {
    attributes: true, attributeFilter: ['lang'],
  });
  (async () => {
    try {
      const [appSdk, authSdk, fs] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js'),
      ]);
      const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(config);
      const db = fs.getFirestore(app);
      let stop = null;
      let accountId = null;
      authSdk.onAuthStateChanged(authSdk.getAuth(app), (user) => {
        if (stop) stop();
        stop = null;
        accountId = user?.uid || null;
        renderStatus('none');
        if (!user) return;
        const uid = user.uid;
        stop = fs.onSnapshot(fs.query(fs.collection(db, 'flightRequests'), fs.where('owner', '==', uid)), (snapshot) => {
          if (accountId !== uid) return;
          const documents = snapshot.docs.filter((item) => {
            const data = item.data();
            const created = data.createdAt?.toMillis?.();
            return Number.isFinite(created);
          }).sort((a, b) => {
            const left = a.data().createdAt, right = b.data().createdAt;
            return right.seconds - left.seconds || right.nanoseconds - left.nanoseconds || b.id.localeCompare(a.id);
          });
          renderStatus(documents.length ? documents[0].data().status : 'none');
        }, () => { if (accountId === uid) renderStatus('unavailable'); });
      });
    } catch (_) { renderStatus('unavailable'); }
  })();
}
