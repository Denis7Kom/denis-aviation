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
  phase = '',
  lastSubmitted = null,
  lastSnapshot = null,
  adminKnownIds = null,
  adminAlertProblem = false;
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
  doc,
  runTransaction;
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
  cancelled: ['Отменена', 'Cancelled'],
};
function browserAlertsSupported() {
  return typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function';
}
function formatRequestDetails(data) {
  const value = (field) => String(field || '—');
  const type = data.type === 'atc'
    ? text('Диспетчерский контроль', 'ATC control')
    : text('Совместный полёт', 'Fly together');
  return [
    `${text('Тип', 'Type')}: ${type}`,
    `${text('Сеть', 'Network')}: ${value(data.network)}`,
    `${text('Дата и время', 'Date and time')}: ${value(data.date)} ${value(data.time)} (${value(data.timezone)})`,
    `${text('Позывной', 'Callsign')}: ${value(data.callsign)}`,
    `${text('Маршрут или аэропорт', 'Route or airport')}: ${value(data.route)}`,
    `${text('Контакт', 'Contact')}: ${value(data.contact)}`,
    `${text('Детали', 'Details')}: ${value(data.notes)}`,
  ].join('\n');
}
function openRequestFromAlert(id) {
  window.focus();
  if (!isAdmin(user) || !lastSnapshot) return;
  $('#status-filter').value = 'all';
  $('#request-search').value = '';
  renderList(lastSnapshot);
  const card = Array.from($('#list').children).find((element) => element.dataset.requestId === id);
  if (card) {
    card.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    card.focus?.({ preventScroll: true });
  } else {
    $('#list').scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}
function renderAdminAlerts() {
  const button = $('#enable-browser-alerts');
  const status = $('#browser-alert-status');
  const preview = $('#admin-alert-preview');
  const details = $('#admin-alert-details');
  preview.hidden = true;
  details.textContent = '';
  document.title = text('Заявки на полёт — Denis Aviation', 'Flight requests — Denis Aviation');
  button.disabled = false;
  status.textContent = '';
  if (!browserAlertsSupported()) {
    button.disabled = true;
    button.textContent = text('Уведомления браузера недоступны', 'Browser notifications unavailable');
  } else if (Notification.permission === 'granted') {
    button.disabled = true;
    button.textContent = text('Уведомления браузера включены', 'Browser notifications enabled');
  } else if (Notification.permission === 'denied') {
    button.disabled = true;
    button.textContent = text('Уведомления браузера заблокированы', 'Browser notifications blocked');
    status.textContent = text('Разрешите уведомления для сайта в настройках браузера.', 'Allow notifications for this site in your browser settings.');
  } else {
    button.textContent = text('Включить уведомления браузера', 'Enable browser notifications');
  }
  if (!isAdmin(user)) {
    $('#admin-alert-count').textContent = '';
    return;
  }
  if (adminAlertProblem || !lastSnapshot) {
    $('#admin-alert-count').textContent = adminAlertProblem
      ? text('Не удалось загрузить заявки.', 'Could not load requests.')
      : text('Проверяем заявки...', 'Checking requests...');
    return;
  }
  const newRequests = lastSnapshot.docs.filter((item) => item.data().status === 'new');
  const count = newRequests.length;
  $('#admin-alert-count').textContent = lastSnapshot.metadata?.fromCache
    ? text(`Новых заявок: ${count} · соединение восстанавливается`, `New requests: ${count} · reconnecting`)
    : text(`Новых заявок: ${count}`, `New requests: ${count}`);
  if (count) document.title = `(${count}) ${document.title}`;
  if (count) {
    const newest = newRequests.slice().sort((a, b) => {
      const left = a.data().createdAt;
      const right = b.data().createdAt;
      return (right?.seconds ?? -Infinity) - (left?.seconds ?? -Infinity)
        || (right?.nanoseconds ?? 0) - (left?.nanoseconds ?? 0)
        || a.id.localeCompare(b.id);
    })[0];
    details.textContent = formatRequestDetails(newest.data());
    preview.hidden = false;
  }
}
function announceNewRequests(snapshot) {
  if (!isAdmin(user) || snapshot.metadata?.fromCache) return;
  const confirmed = snapshot.docs.filter((item) => !item.metadata?.hasPendingWrites);
  const currentIds = new Set(adminKnownIds || []);
  if (adminKnownIds) {
    const newRequests = confirmed.filter((item) => !adminKnownIds.has(item.id) && item.data().status === 'new');
    if (newRequests.length && browserAlertsSupported() && Notification.permission === 'granted') {
      for (const item of newRequests) try {
        const alert = new Notification(text('Новая заявка на сайте', 'New request on the site'), {
          body: formatRequestDetails(item.data()),
          icon: 'favicon.svg',
        });
        alert.onclick = () => { alert.close(); openRequestFromAlert(item.id); };
      } catch (_) {
        // Browser or OS notifications may be unavailable; the in-page alert still works.
      }
    }
  }
  for (const item of confirmed) currentIds.add(item.id);
  adminKnownIds = currentIds;
}
function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-ru]').forEach((el) => {
    el.textContent = el.dataset[language];
  });
  document.querySelectorAll('[data-placeholder-ru]').forEach((el) => {
    el.placeholder = el.dataset[language === 'en' ? 'placeholderEn' : 'placeholderRu'];
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
  renderConfirmation();
  renderTimezoneOptions();
  renderAdminAlerts();
}
function renderConfirmation() {
  if (!lastSubmitted) return;
  const d = lastSubmitted;
  $('#confirmation-summary').textContent =
    `${d.type === 'atc' ? text('Диспетчерский контроль', 'ATC control') : text('Совместный полёт', 'Fly together')} · ${d.network}\n${d.date} ${d.time} (${d.timezone})\n${d.callsign} · ${d.route}`;
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
    if (user && lastSnapshot) renderList(lastSnapshot);
  });
});
const commonZones = [
  'UTC',
  'Europe/Moscow',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/London',
  'Europe/Paris',
  'Europe/Malta',
  'Europe/Vienna',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Mexico_City',
  'America/Cancun',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Australia/Sydney',
  'Australia/Canberra',
];
const zoneNames = {
  UTC: ['UTC', 'UTC'],
  'Europe/Moscow': ['Москва', 'Moscow'],
  'Europe/Rome': ['Рим', 'Rome'],
  'Europe/Madrid': ['Мадрид', 'Madrid'],
  'Europe/London': ['Лондон', 'London'],
  'Europe/Paris': ['Париж', 'Paris'],
  'Europe/Malta': ['Мальта', 'Malta'],
  'Europe/Vienna': ['Вена', 'Vienna'],
  'America/New_York': ['Нью-Йорк', 'New York'],
  'America/Chicago': ['Чикаго', 'Chicago'],
  'America/Denver': ['Денвер', 'Denver'],
  'America/Los_Angeles': ['Лос-Анджелес', 'Los Angeles'],
  'America/Anchorage': ['Анкоридж', 'Anchorage'],
  'Pacific/Honolulu': ['Гонолулу', 'Honolulu'],
  'America/Mexico_City': ['Мехико', 'Mexico City'],
  'America/Cancun': ['Канкун', 'Cancun'],
  'Asia/Tokyo': ['Токио', 'Tokyo'],
  'Asia/Hong_Kong': ['Гонконг', 'Hong Kong'],
  'Asia/Singapore': ['Сингапур', 'Singapore'],
  'Australia/Sydney': ['Сидней', 'Sydney'],
  'Australia/Canberra': ['Канберра', 'Canberra'],
};
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
let availableZones = [];
try {
  availableZones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
} catch (_) {}
function timezoneLabel(zone) {
  const name =
    zoneNames[zone]?.[language === 'en' ? 1 : 0] || zone.split('/').pop().replaceAll('_', ' ');
  let offset = '';
  try {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: zone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    offset = (parts.find((part) => part.type === 'timeZoneName')?.value || '').replace(
      /^GMT/,
      'UTC',
    );
  } catch (_) {}
  return `${name}${offset && offset !== name ? ` · ${offset}` : ''}${zone === 'UTC' ? '' : ` · ${zone}`}`;
}
function renderTimezoneOptions() {
  const select = $('#form').elements.timezone;
  const previous = select.value || detectedTimezone;
  const zones = [...new Set([...commonZones, detectedTimezone, previous, ...availableZones])];
  select.replaceChildren();
  for (const zone of zones) {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent = timezoneLabel(zone);
    select.append(option);
  }
  select.value = previous;
}
renderTimezoneOptions();
$('#form').elements.timezone.value = detectedTimezone;
if (typeof window !== 'undefined') {
  const requestedType = new URLSearchParams(window.location.search).get('type');
  if (requestedType === 'flight' || requestedType === 'atc')
    $('#form').elements.type.value = requestedType;
}
// Drafts are stored only after the visitor explicitly opts in.
const draftKey = 'dk-flight-request-draft-v1';
const draftFields = [
  'type',
  'network',
  'date',
  'time',
  'timezone',
  'callsign',
  'route',
  'contact',
  'notes',
];
try {
  const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
  if (saved && typeof saved === 'object') {
    for (const key of draftFields) {
      if (typeof saved[key] === 'string' && $('#form').elements[key]) {
        if (
          key === 'timezone' &&
          ![...$('#form').elements.timezone.options].some((option) => option.value === saved[key])
        ) {
          const option = document.createElement('option');
          option.value = saved[key];
          option.textContent = timezoneLabel(saved[key]);
          $('#form').elements.timezone.append(option);
        }
        $('#form').elements[key].value = saved[key];
      }
    }
    if (saved.notes) $('.more-details').open = true;
    $('#save-draft').checked = true;
  }
} catch (_) {}
function saveDraft() {
  try {
    if (!$('#save-draft').checked) {
      localStorage.removeItem(draftKey);
      return;
    }
    const data = Object.fromEntries(new FormData($('#form')).entries());
    localStorage.setItem(
      draftKey,
      JSON.stringify(Object.fromEntries(draftFields.map((key) => [key, data[key] || '']))),
    );
  } catch (_) {
    notice(
      'Не удалось сохранить черновик на этом устройстве.',
      'Could not save a draft on this device.',
    );
  }
}
$('#form').addEventListener('input', saveDraft);
$('#form').addEventListener('change', saveDraft);
$('#new-form').addEventListener('click', () => {
  $('#confirmation').hidden = true;
  $('#form').hidden = false;
  lastSubmitted = null;
  notice('', '');
});
$('#status-filter').addEventListener('change', () => {
  if (isAdmin(user) && lastSnapshot) renderList(lastSnapshot);
});
$('#request-search').addEventListener('input', () => {
  if (isAdmin(user) && lastSnapshot) renderList(lastSnapshot);
});
$('#show-new-requests').addEventListener('click', () => {
  if (!isAdmin(user) || !lastSnapshot) return;
  $('#status-filter').value = 'new';
  $('#request-search').value = '';
  renderList(lastSnapshot);
  $('#list').scrollIntoView?.({ behavior: 'smooth', block: 'start' });
});
$('#enable-browser-alerts').addEventListener('click', async () => {
  if (!isAdmin(user) || !browserAlertsSupported() || Notification.permission !== 'default') return;
  try {
    await Notification.requestPermission();
  } catch (_) {
    $('#browser-alert-status').textContent = text('Не удалось включить уведомления браузера.', 'Could not enable browser notifications.');
    return;
  }
  renderAdminAlerts();
});
translate();
function subscribe() {
  if (unsubscribe) unsubscribe();
  const list = $('#list');
  list.replaceChildren();
  const ref = collection(db, 'flightRequests');
  const q = isAdmin(user) ? ref : query(ref, where('owner', '==', user.uid));
  unsubscribe = onSnapshot(
    q,
    { includeMetadataChanges: true },
    (snapshot) => {
      announceNewRequests(snapshot);
      lastSnapshot = snapshot;
      adminAlertProblem = false;
      renderList(snapshot);
      // Rebuild the title before adding the current count.
      document.title = text('Заявки на полёт — Denis Aviation', 'Flight requests — Denis Aviation');
      renderAdminAlerts();
    },
    () => {
      adminAlertProblem = true;
      lastSnapshot = null;
      document.title = text('Заявки на полёт — Denis Aviation', 'Flight requests — Denis Aviation');
      renderAdminAlerts();
      notice(
        'Не удалось загрузить заявки. Проверь соединение и правила Firestore.',
        'Could not load requests. Check your connection and Firestore rules.',
        'list',
      );
    },
  );
}
function renderList(snapshot) {
  const list = $('#list');
  list.replaceChildren();
  const counts = { new: 0, review: 0, confirmed: 0 };
  for (const item of snapshot.docs)
    if (Object.hasOwn(counts, item.data().status)) counts[item.data().status]++;
  if (isAdmin(user))
    for (const [status, count] of Object.entries(counts))
      $(`#count-${status}`).textContent = String(count);
  if (snapshot.empty) {
    const p = document.createElement('p');
    p.textContent = text('Заявок пока нет.', 'No requests yet.');
    list.append(p);
    return;
  }
  const filter = isAdmin(user) ? $('#status-filter').value : 'all';
  const search = isAdmin(user) ? $('#request-search').value.trim().toLocaleLowerCase() : '';
  const entries = snapshot.docs
    .filter((item) => {
      const data = item.data();
      return (
        (!filter || filter === 'all' || data.status === filter) &&
        (!search ||
          [data.callsign, data.route, data.contact].some((value) =>
            String(value || '')
              .toLocaleLowerCase()
              .includes(search),
          ))
      );
    })
    .slice()
    .sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
  if (!entries.length) {
    const p = document.createElement('p');
    p.textContent = text(
      'Заявок по выбранным условиям нет.',
      'No requests match the selected filters.',
    );
    list.append(p);
  }
  for (const item of entries) {
    const d = item.data(),
      card = document.createElement('article');
    card.className = 'entry';
    card.dataset.requestId = item.id;
    card.tabIndex = -1;
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
        if (value === 'cancelled' && d.status !== 'cancelled') continue;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = labels[language === 'en' ? 1 : 0];
        select.append(option);
      }
      select.value = d.status;
      if (d.status === 'cancelled') select.disabled = true;
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
    if (user && d.owner === user.uid && ['new', 'review', 'confirmed'].includes(d.status)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cancel-request';
      button.textContent = text('Отменить заявку', 'Cancel request');
      button.addEventListener('click', async () => {
        if (!window.confirm(text('Отменить эту заявку?', 'Cancel this request?'))) return;
        button.disabled = true;
        const uid = user?.uid;
        try {
          await runTransaction(db, async (transaction) => {
            const ref = doc(db, 'flightRequests', item.id);
            const current = await transaction.get(ref);
            if (!current.exists() || current.data().owner !== uid ||
                !['new', 'review', 'confirmed'].includes(current.data().status))
              throw new Error('Request is no longer cancellable');
            transaction.update(ref, { status: 'cancelled' });
          });
          notice('Заявка отменена.', 'Request cancelled.', 'list', 'success');
        } catch (_) {
          notice('Не удалось отменить заявку. Возможно, её статус изменился. Обнови страницу и попробуй снова.',
            'Could not cancel the request. Its status may have changed. Refresh the page and try again.', 'list');
          button.disabled = false;
        }
      });
      card.append(button);
    }
    list.append(card);
  }
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

  // Compare against the current date and time in the time zone selected by the visitor.
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: data.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const now = `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}`;
    if (`${data.date} ${data.time}` < now) {
      notice(
        'Выбранное время уже прошло в указанном часовом поясе. Проверь дату и время.',
        'The selected time has already passed in the specified time zone. Check the date and time.',
      );
      return;
    }
  } catch (_) {
    notice(
      'Укажи часовой пояс в формате IANA, например Europe/Rome или UTC.',
      'Enter an IANA time zone, such as Europe/Rome or UTC.',
    );
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
    lastSubmitted = data;
    renderConfirmation();
    $('#confirmation').hidden = false;
    form.hidden = true;
    try {
      localStorage.removeItem(draftKey);
    } catch (_) {}
    $('#save-draft').checked = false;
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
    ({ collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, runTransaction } = fs);
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
      lastSnapshot = null;
      adminKnownIds = null;
      adminAlertProblem = false;
      $('#request-search').value = '';
      $('#status-filter').value = 'all';
      lastListNotice = null;
      $('#list-notice').textContent = '';
      $('#list-panel').hidden = !u;
      $('#filter-label').hidden = !isAdmin(u);
      $('#admin-tools').hidden = !isAdmin(u);
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
