const config = {
  apiKey: 'AIzaSyDNhB8EMckVFlh3r2hSJr9KRZv6Pjlv65w',
  authDomain: 'denis-komarov---aviation.firebaseapp.com',
  projectId: 'denis-komarov---aviation',
  appId: '1:700960122590:web:6dd66719232e8aaa35c44f',
};
const $ = (s) => document.querySelector(s);
function readLanguage() {
  try {
    return (localStorage.getItem('dk-aviation-lang') ||
      localStorage.getItem('requests-language')) === 'en'
      ? 'en'
      : 'ru';
  } catch (_) {
    return 'ru';
  }
}
let language = readLanguage(),
  user = null,
  unsubscribe = null,
  lastNotice = null,
  lastListNotice = null,
  authReady = false,
  serviceFailed = false,
  phase = '';
let db,
  auth,
  authSdk,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc;
const text = (ru, en) => (language === 'en' ? en : ru);
const notice = (ru, en, location = 'form', kind = '') => {
  if (location === 'list') {
    lastListNotice = [ru, en];
    $('#list-notice').textContent = text(ru, en);
    $('#list-notice').dataset.kind = kind;
  } else {
    lastNotice = [ru, en];
    $('#notice').textContent = text(ru, en);
    $('#notice').dataset.kind = kind;
  }
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
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  });
  document.title =
    language === 'en' ? 'Flight requests — Denis Aviation' : 'Заявки на полёт — Denis Aviation';
  if (lastNotice) $('#notice').textContent = text(...lastNotice);
  if (lastListNotice) $('#list-notice').textContent = text(...lastListNotice);
  $('#list-title').textContent = isAdmin(user)
    ? text('Все заявки', 'All requests')
    : text('Мои заявки', 'My requests');
  renderControls();
}
function renderControls() {
  $('#send').disabled = !authReady || !!phase;
  $('#login').disabled = !authReady || !!phase;
  $('#logout').disabled = !authReady || !!phase;
  $('#form-auth-hint').hidden = !!user;
  $('#send-label').textContent = serviceFailed
    ? text('Сервис недоступен', 'Service unavailable')
    : !authReady
      ? text('Подключение...', 'Connecting...')
      : phase === 'signing-in'
        ? text('Вход через Google...', 'Signing in with Google...')
        : phase === 'sending'
          ? text('Отправляем заявку...', 'Sending request...')
          : user
            ? text('Отправить заявку', 'Send request')
            : text('Войти через Google и отправить', 'Sign in with Google and send');
}
document.querySelectorAll('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.lang === language) return;
    language = button.dataset.lang === 'en' ? 'en' : 'ru';
    try {
      localStorage.setItem('dk-aviation-lang', language);
    } catch (_) {}
    translate();
    if (user) subscribe();
  });
});
$('#form').elements.timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
if (typeof window !== 'undefined') {
  const requestedType = new URLSearchParams(window.location.search).get('type');
  if (requestedType === 'flight' || requestedType === 'atc')
    $('#form').elements.type.value = requestedType;
}
translate();
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
        card.dataset.status = Object.hasOwn(statuses, d.status) ? d.status : 'unknown';
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
            const selectedStatus = select.value;
            card.dataset.status = selectedStatus;
            select.disabled = true;
            try {
              await updateDoc(doc(db, 'flightRequests', item.id), { status: selectedStatus });
              notice('Статус сохранён.', 'Status saved.', 'list', 'success');
            } catch (_) {
              select.value = d.status;
              card.dataset.status = Object.hasOwn(statuses, d.status) ? d.status : 'unknown';
              notice(
                'Не удалось изменить статус. Проверь соединение и правила базы.',
                'Could not change status. Check your connection and database rules.',
                'list',
              );
            } finally {
              select.disabled = false;
            }
          });
          label.append(span, select);
          card.append(label);
        } else {
          const status = document.createElement('p');
          status.className = 'request-status';
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
        'list',
      ),
  );
}
function signInError(error) {
  if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error?.code)) {
    notice(
      'Вход отменён. Данные заявки сохранены в форме — попробуй ещё раз.',
      'Sign-in was cancelled. Your details are still in the form; please try again.',
    );
  } else {
    notice(
      'Не удалось войти. Проверь соединение и разреши всплывающие окна, затем попробуй снова.',
      'Could not sign in. Check your connection and allow pop-ups, then try again.',
    );
  }
}

// Register before loading Firebase so the form can never fall through to a GET submission.
$('#form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!authReady || phase || !form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());
  for (const key of ['timezone', 'callsign', 'route', 'contact', 'notes'])
    data[key] = data[key].trim();
  if (!data.timezone || !data.callsign || !data.route || !data.contact) {
    notice('Заполни обязательные поля.', 'Fill in the required fields.');
    return;
  }

  phase = user ? 'sending' : 'signing-in';
  renderControls();
  notice('', '');
  try {
    // Invoke the pop-up directly from the submit event, before the first await.
    const submittingUser =
      user || (await authSdk.signInWithPopup(auth, new authSdk.GoogleAuthProvider())).user;
    if (!submittingUser || auth.currentUser?.uid !== submittingUser.uid) {
      const error = new Error('The signed-in account changed.');
      error.code = 'auth/session-changed';
      throw error;
    }
    phase = 'sending';
    renderControls();
    await addDoc(collection(db, 'flightRequests'), {
      ...data,
      owner: submittingUser.uid,
      status: 'new',
      createdAt: serverTimestamp(),
    });
    form.reset();
    form.elements.timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    notice(
      'Заявка сохранена. Её статус появится в списке.',
      'Request saved. Its status will appear in the list.',
      'form',
      'success',
    );
  } catch (error) {
    if (error?.code === 'auth/session-changed') {
      notice(
        'Аккаунт изменился. Проверь вход и отправь заявку ещё раз.',
        'The account changed. Check your sign-in and send the request again.',
      );
    } else if (phase === 'signing-in') signInError(error);
    else
      notice(
        'Заявка не отправлена. Проверь интернет и попробуй снова.',
        'Request was not sent. Check your connection and try again.',
      );
  } finally {
    phase = '';
    renderControls();
  }
});
async function start() {
  try {
    const [appSdk, loadedAuthSdk, fs] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js'),
    ]);
    authSdk = loadedAuthSdk;
    const app = appSdk.initializeApp(config);
    auth = authSdk.getAuth(app);
    db = fs.getFirestore(app);
    ({ collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } = fs);
    $('#login').addEventListener('click', async () => {
      if (!authReady || phase) return;
      phase = 'signing-in';
      renderControls();
      notice('', '');
      try {
        await authSdk.signInWithPopup(auth, new authSdk.GoogleAuthProvider());
      } catch (error) {
        signInError(error);
      } finally {
        phase = '';
        renderControls();
      }
    });
    $('#logout').addEventListener('click', async () => {
      if (!authReady || phase) return;
      try {
        await authSdk.signOut(auth);
      } catch (_) {
        notice('Не удалось выйти. Попробуй ещё раз.', 'Could not sign out. Please try again.');
      }
    });
    authSdk.onAuthStateChanged(auth, (u) => {
      user = u;
      authReady = true;
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      $('#list').replaceChildren();
      lastListNotice = null;
      $('#list-notice').textContent = '';
      $('#list-panel').hidden = !u;
      $('.grid').classList.toggle('is-guest', !u);
      $('#login').hidden = !!u;
      $('#logout').hidden = !u;
      $('#identity').textContent = u?.email || '';
      $('#account-info').hidden = !u;
      $('#auth-hint').hidden = !!u;
      translate();
      if (u) subscribe();
    });
  } catch (_) {
    serviceFailed = true;
    renderControls();
    notice(
      'Не удалось загрузить сервис заявок. Проверь подключение к интернету.',
      'Could not load the request service. Check your internet connection.',
    );
  }
}
start();
