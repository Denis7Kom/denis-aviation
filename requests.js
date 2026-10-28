const config = {
  apiKey: 'AIzaSyDNhB8EMckVFlh3r2hSJr9KRZv6Pjlv65w',
  authDomain: 'denis-komarov---aviation.firebaseapp.com',
  projectId: 'denis-komarov---aviation',
  appId: '1:700960122590:web:6dd66719232e8aaa35c44f',
};
const $ = (s) => document.querySelector(s);
let language = localStorage.getItem('requests-language') || 'ru',
  user = null,
  unsubscribe = null;
const text = (ru, en) => (language === 'en' ? en : ru);
const notice = (ru, en) => {
  $('#notice').textContent = text(ru, en);
};
const isAdmin = (u) =>
  u &&
  u.email === 'deniska7best@gmail.com' &&
  u.emailVerified &&
  u.providerData.some((p) => p.providerId === 'google.com');
const statuses = {
  new: ['Новая', 'New'],
  review: ['Рассматривается', 'In review'],
  confirmed: ['Подтверждена', 'Confirmed'],
  declined: ['Отклонена', 'Declined'],
  completed: ['Завершена', 'Completed'],
};
function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-ru]').forEach((el) => {
    el.textContent = el.dataset[language];
  });
  $('#language').textContent = language === 'ru' ? 'EN' : 'RU';
  $('#list-title').textContent = isAdmin(user)
    ? text('Все заявки', 'All requests')
    : text('Мои заявки', 'My requests');
}
$('#language').addEventListener('click', () => {
  language = language === 'ru' ? 'en' : 'ru';
  localStorage.setItem('requests-language', language);
  translate();
  if (user) subscribe();
});
$('#form').elements.timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
translate();
let db, auth, collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc;
function subscribe() {
  if (unsubscribe) unsubscribe();
  const list = $('#list');
  list.replaceChildren();
  const ref = collection(db, 'flightRequests');
  const q = isAdmin(user) ? ref : query(ref, where('owner', '==', user.uid));
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      list.replaceChildren();
      if (snapshot.empty) {
        const p = document.createElement('p');
        p.textContent = text('Заявок пока нет.', 'No requests yet.');
        list.append(p);
        return;
      }
      const entries = snapshot.docs
        .slice()
        .sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
      for (const item of entries) {
        const d = item.data(),
          card = document.createElement('article');
        card.className = 'entry';
        const title = document.createElement('strong');
        title.textContent = `${d.type === 'flight' ? text('Совместный полёт', 'Fly together') : 'ATC'} · ${d.network}`;
        const details = document.createElement('p');
        details.textContent = `${d.date} ${d.time} (${d.timezone})\n${d.callsign} · ${d.route}\n${text('Контакт', 'Contact')}: ${d.contact}${d.notes ? '\n' + d.notes : ''}`;
        card.append(title, details);
        if (isAdmin(user)) {
          const label = document.createElement('label'),
            span = document.createElement('span'),
            select = document.createElement('select');
          span.textContent = text('Статус', 'Status');
          for (const [value, labels] of Object.entries(statuses)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = labels[language === 'en' ? 1 : 0];
            select.append(option);
          }
          select.value = d.status;
          select.addEventListener('change', async () => {
            select.disabled = true;
            try {
              await updateDoc(doc(db, 'flightRequests', item.id), { status: select.value });
              notice('Статус сохранён.', 'Status saved.');
            } catch (_) {
              select.value = d.status;
              notice(
                'Не удалось изменить статус. Проверь соединение и правила базы.',
                'Could not change status. Check your connection and database rules.',
              );
            } finally {
              select.disabled = false;
            }
          });
          label.append(span, select);
          card.append(label);
        } else {
          const status = document.createElement('p');
          status.textContent = `${text('Статус', 'Status')}: ${(statuses[d.status] || [d.status, d.status])[language === 'en' ? 1 : 0]}`;
          card.append(status);
        }
        list.append(card);
      }
    },
    () =>
      notice(
        'Не удалось загрузить заявки. Проверь соединение и правила Firestore.',
        'Could not load requests. Check your connection and Firestore rules.',
      ),
  );
}
async function start() {
  try {
    const [appSdk, authSdk, fs] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js'),
    ]);
    const app = appSdk.initializeApp(config);
    auth = authSdk.getAuth(app);
    db = fs.getFirestore(app);
    ({ collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } = fs);
    $('#login').addEventListener('click', async () => {
      try {
        await authSdk.signInWithPopup(auth, new authSdk.GoogleAuthProvider());
      } catch (_) {
        notice(
          'Не удалось войти. Проверь соединение и разрешения браузера.',
          'Sign-in failed. Check your connection and browser permissions.',
        );
      }
    });
    $('#logout').addEventListener('click', () => authSdk.signOut(auth));
    authSdk.onAuthStateChanged(auth, (u) => {
      user = u;
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      $('#list').replaceChildren();
      $('#area').hidden = !u;
      $('#login').hidden = !!u;
      $('#logout').hidden = !u;
      $('#identity').textContent = u?.email || '';
      translate();
      if (u) subscribe();
    });
    $('#form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!user || !e.currentTarget.reportValidity()) return;
      const f = new FormData(e.currentTarget);
      const data = Object.fromEntries(f.entries());
      for (const k of ['timezone', 'callsign', 'route', 'contact', 'notes'])
        data[k] = data[k].trim();
      if (!data.timezone || !data.callsign || !data.route || !data.contact) {
        notice('Заполни обязательные поля.', 'Fill in the required fields.');
        return;
      }
      $('#send').disabled = true;
      try {
        await addDoc(collection(db, 'flightRequests'), {
          ...data,
          owner: user.uid,
          status: 'new',
          createdAt: serverTimestamp(),
        });
        e.currentTarget.reset();
        e.currentTarget.elements.timezone.value =
          Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        notice(
          'Заявка сохранена. Её статус появится в списке.',
          'Request saved. Its status will appear in the list.',
        );
      } catch (_) {
        notice(
          'Заявка не отправлена. Проверь интернет и попробуй снова.',
          'Request was not sent. Check your connection and try again.',
        );
      } finally {
        $('#send').disabled = false;
      }
    });
  } catch (_) {
    $('#login').disabled = true;
    notice(
      'Не удалось загрузить сервис заявок. Проверь подключение к интернету.',
      'Could not load the request service. Check your internet connection.',
    );
  }
}
start();
