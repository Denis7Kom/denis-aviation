const config = {
  apiKey: 'AIzaSyDNhB8EMckVFlh3r2hSJr9KRZv6Pjlv65w',
  authDomain: 'denis-komarov---aviation.firebaseapp.com',
  projectId: 'denis-komarov---aviation',
  appId: '1:700960122590:web:6dd66719232e8aaa35c44f',
  messagingSenderId: '700960122590',
};
const $ = (s) => document.querySelector(s);
function readLanguage() {
  try {
    const saved =
      localStorage.getItem('dk-aviation-lang') || localStorage.getItem('requests-language');
    return ['ru', 'en', 'it'].includes(saved) ? saved : 'ru';
  } catch (_) {
    return 'ru';
  }
}
let language = readLanguage(),
  user = null,
  quotaUnsubscribe = null,
  unsubscribe = null,
  lastNotice = null,
  lastListNotice = null,
  authReady = false,
  serviceFailed = false,
  phase = '',
  lastSubmitted = null,
  lastSnapshot = null,
  adminKnownIds = null,
  adminKnownStatuses = null,
  adminCancellations = [],
  adminAlertProblem = false,
  visitorKnownStatuses = null,
  visitorUpdates = [];
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
  runTransaction,
  orderBy,
  limitToLast,
  limit,
  Timestamp,
  getDocs,
  getDoc,
  endBefore,
  startAfter,
  getCountFromServer;
let serviceConfig = {},
  secureCall = null,
  firebaseApp = null;
let pushSdk = null,
  pushMessaging = null,
  pushToken = null,
  pushOwner = null,
  pushProblem = '';
const REQUEST_PAGE_SIZE = 20;
let requestPageCursor = null,
  requestPageStack = [],
  requestPageNext = null,
  pageGeneration = 0,
  requestDirectId = null;
const requestCounts = {};
const italian = {
  Automatic: 'Automatico',
  'Filter by status': 'Filtra per stato',
  'Status on this page': 'Stato in questa pagina',
  'Request from notification': 'Richiesta dalla notifica',
  'Background delivery is not configured yet. Browser notifications work while this page is open.':
    'La ricezione in background non è ancora configurata. Le notifiche del browser funzionano quando la pagina è aperta.',
  'Show previous messages': 'Mostra i messaggi precedenti',
  Retry: 'Riprova',
  'Could not load messages.': 'Impossibile caricare i messaggi.',
  'Could not check the administrator reply.':
    'Impossibile verificare la risposta dell’amministratore.',
  'Too many messages. Wait and try again.': 'Troppi messaggi. Attendi e riprova.',
  Page: 'Pagina',
  'search within this page': 'ricerca in questa pagina',
  'Background notifications enabled': 'Notifiche in background attivate',
  'Enable background notifications': 'Attiva le notifiche in background',
  'Background notifications are not configured yet':
    'Le notifiche in background non sono ancora configurate',
  'Could not enable background notifications. Check browser permission and try again.':
    'Impossibile attivare le notifiche in background. Controlla le autorizzazioni del browser e riprova.',
  'Background delivery is disconnected. Enable notifications again.':
    'La ricezione in background è disconnessa. Riattiva le notifiche.',
  Comments: 'Commenti',
  'Reply to client': 'Rispondi al cliente',
  'Reply to administrator': 'Rispondi all’amministratore',
  'Write a short reply…': 'Scrivi una breve risposta…',
  Collapse: 'Comprimi',
  Reply: 'Rispondi',
  'New message': 'Nuovo messaggio',
  'Open message': 'Apri messaggio',
  'Could not connect message alerts. Refresh the page.':
    'Impossibile attivare gli avvisi dei messaggi. Ricarica la pagina.',
  Conversation: 'Conversazione',
  'Close conversation': 'Chiudi conversazione',
  Message: 'Messaggio',
  Send: 'Invia',
  You: 'Tu',
  Administrator: 'Amministratore',
  Client: 'Cliente',
  'No messages yet.': 'Nessun messaggio.',
  'Loading messages…': 'Caricamento messaggi…',
  'Could not load messages. Refresh the page.':
    'Impossibile caricare i messaggi. Ricarica la pagina.',
  'Could not send the message. Try again.': 'Impossibile inviare il messaggio. Riprova.',
  'Daily activity': 'Attività giornaliera',
  'Sending is temporarily unavailable. Try tomorrow.':
    'Invio temporaneamente non disponibile. Riprova domani.',
  'Details must be no longer than 500 characters.':
    'I dettagli non possono superare 500 caratteri.',
  'Add comment': 'Aggiungi commento',
  'Edit comment': 'Modifica commento',
  'Administrator comment': 'Commento dell’amministratore',
  'Save comment': 'Salva commento',
  'Comment saved.': 'Commento salvato.',
  'Could not save comment. Check your connection and try again.':
    'Impossibile salvare il commento. Controlla la connessione e riprova.',
  'Flight requests — Denis Aviation': 'Richieste di volo — Denis Aviation',
  'ATC control': 'Controllo ATC',
  'Fly together': 'Volo insieme',
  'Account email': 'Email dell’account',
  'All requests': 'Tutte le richieste',
  'My requests': 'Le mie richieste',
  Status: 'Stato',
  'Date and time': 'Data e ora',
  'Route or airport': 'Rotta o aeroporto',
  Contact: 'Contatto',
  Details: 'Dettagli',
  Network: 'Rete',
  Type: 'Tipo',
  Callsign: 'Nominativo',
  'Username / callsign': 'Nome utente / nominativo',
  unavailable: 'non disponibile',
  'New request on the site': 'Nuova richiesta sul sito',
  'Request cancelled': 'Richiesta annullata',
  'Request cancelled.': 'Richiesta annullata.',
  'Request status changed': 'Stato della richiesta modificato',
  'Cancel request': 'Annulla richiesta',
  'Cancel this request?': 'Annullare questa richiesta?',
  'Request is no longer cancellable': 'La richiesta non può più essere annullata',
  'Checking requests...': 'Verifica delle richieste...',
  'Connecting...': 'Connessione...',
  'Choose a valid date.': 'Scegli una data valida.',
  'Choose hours and minutes.': 'Scegli ore e minuti.',
  'Fill in the required fields.': 'Compila i campi obbligatori.',
  'No requests yet.': 'Nessuna richiesta.',
  'No requests match the selected filters.':
    'Nessuna richiesta corrisponde ai filtri selezionati.',
  'Status saved.': 'Stato salvato.',
  'Send request': 'Invia richiesta',
  'Sending request...': 'Invio della richiesta...',
  'Service unavailable': 'Servizio non disponibile',
  'Sign in with Google and send': 'Accedi con Google e invia',
  'Signing in with Google...': 'Accesso con Google...',
  'Request saved. Its status will appear in the list.':
    'Richiesta salvata. Lo stato apparirà nell’elenco.',
  'Request was not sent. Check your connection and try again.':
    'Richiesta non inviata. Controlla la connessione e riprova.',
  'Could not sign in. Check your connection and allow pop-ups, then try again.':
    'Accesso non riuscito. Controlla la connessione, consenti i popup e riprova.',
  'Could not sign out. Please try again.': 'Impossibile uscire. Riprova.',
  'Could not load the request service. Check your internet connection.':
    'Impossibile caricare il servizio. Controlla la connessione.',
  'Could not load requests.': 'Impossibile caricare le richieste.',
  'Could not load requests. Check your connection and Firestore rules.':
    'Impossibile caricare le richieste. Controlla la connessione e le regole Firestore.',
  'Could not save a draft on this device.':
    'Impossibile salvare una bozza su questo dispositivo.',
  'Could not change status. Check your connection and database rules.':
    'Impossibile cambiare lo stato. Controlla la connessione e le regole del database.',
  'Could not cancel the request. Its status may have changed. Refresh the page and try again.':
    'Impossibile annullare la richiesta. Lo stato potrebbe essere cambiato. Aggiorna la pagina e riprova.',
  'The selected time has already passed in the specified time zone. Check the date and time.':
    'L’orario scelto è già passato nel fuso orario indicato. Controlla data e ora.',
  'Enter an IANA time zone, such as Europe/Rome or UTC.':
    'Inserisci un fuso orario IANA, per esempio Europe/Rome o UTC.',
  'The account changed. Check your sign-in and send the request again.':
    'L’account è cambiato. Controlla l’accesso e invia di nuovo la richiesta.',
  'Sign-in was cancelled. Your details are still in the form; please try again.':
    'Accesso annullato. I dati sono ancora nel modulo; riprova.',
  'Allow notifications for this site in your browser settings.':
    'Consenti le notifiche per questo sito nelle impostazioni del browser.',
  'Browser notifications blocked': 'Notifiche del browser bloccate',
  'Browser notifications enabled': 'Notifiche del browser attivate',
  'Browser notifications unavailable': 'Notifiche del browser non disponibili',
  'Could not enable browser notifications.': 'Impossibile attivare le notifiche del browser.',
  'Enable browser notifications': 'Attiva le notifiche del browser',
};
const text = (ru, en) => (language === 'it' ? italian[en] || en : language === 'en' ? en : ru);
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
  new: ['Новая', 'New', 'Nuova'],
  review: ['Рассматривается', 'In review', 'In esame'],
  confirmed: ['Подтверждена', 'Confirmed', 'Confermata'],
  declined: ['Отклонена', 'Declined', 'Rifiutata'],
  completed: ['Завершена', 'Completed', 'Completata'],
  cancelled: ['Отменена', 'Cancelled', 'Annullata'],
};
function displayDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  return match ? `${match[3]}-${match[2]}-${match[1]}` : String(value || '');
}
function parseDate(value) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(value || '').trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const iso = `${year}-${month}-${day}`;
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso : null;
}
function formatVisitorUpdate(data) {
  const value = (field) => String(field || '—');
  const status = (statuses[data.status] || [data.status, data.status, data.status])[
    language === 'it' ? 2 : language === 'en' ? 1 : 0
  ];
  const type =
    data.type === 'atc'
      ? text('Диспетчерский контроль', 'ATC control')
      : text('Совместный полёт', 'Fly together');
  return [
    `${text('Статус', 'Status')}: ${status}`,
    `${text('Тип', 'Type')}: ${type}`,
    `${text('Сеть', 'Network')}: ${value(data.network)}`,
    `${text('Дата и время', 'Date and time')}: ${displayDate(data.date)} ${value(data.time)} (${value(data.timezone)})`,
    `${text('Позывной', 'Callsign')}: ${value(data.callsign)}`,
    `${text('Маршрут или аэропорт', 'Route or airport')}: ${value(data.route)}`,
  ].join('\n');
}
function renderVisitorAlerts() {
  const button = $('#enable-visitor-alerts');
  const info = $('#visitor-alert-status');
  if (!browserAlertsSupported()) {
    button.disabled = true;
    button.textContent = text(
      'Уведомления браузера недоступны',
      'Browser notifications unavailable',
    );
  } else if (Notification.permission === 'granted') {
    button.disabled = true;
    button.textContent = text('Уведомления браузера включены', 'Browser notifications enabled');
  } else if (Notification.permission === 'denied') {
    button.disabled = true;
    button.textContent = text(
      'Уведомления браузера заблокированы',
      'Browser notifications blocked',
    );
  } else {
    button.disabled = false;
    button.textContent = text('Включить уведомления браузера', 'Enable browser notifications');
  }
  info.textContent = visitorUpdates.map(formatVisitorUpdate).join('\n\n');
  renderPushStatus();
}
function announceVisitorChanges(snapshot) {
  if (!user || isAdmin(user) || snapshot.metadata?.fromCache) return;
  const key = `dk-request-statuses-v1:${user.uid}`;
  if (visitorKnownStatuses === null) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      visitorKnownStatuses =
        saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch (_) {
      visitorKnownStatuses = {};
    }
  }
  const next = { ...visitorKnownStatuses };
  for (const item of snapshot.docs) {
    if (item.metadata?.hasPendingWrites) continue;
    const data = item.data();
    if (!Object.hasOwn(statuses, data.status)) continue;
    if (
      Object.hasOwn(visitorKnownStatuses, item.id) &&
      visitorKnownStatuses[item.id] !== data.status
    ) {
      const update = {
        status: data.status,
        type: data.type,
        network: data.network,
        date: data.date,
        time: data.time,
        timezone: data.timezone,
        callsign: data.callsign,
        route: data.route,
      };
      visitorUpdates = [update];
      if (browserAlertsSupported() && Notification.permission === 'granted') {
        try {
          const alert = new Notification(
            text('Статус заявки изменён', 'Request status changed'),
            {
              body: formatVisitorUpdate(update),
              icon: 'favicon.svg',
            },
          );
          alert.onclick = () => {
            alert.close();
            openRequestFromAlert(item.id);
          };
        } catch (_) {}
      }
    }
    next[item.id] = data.status;
  }
  visitorKnownStatuses = next;
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch (_) {}
  renderVisitorAlerts();
}
function browserAlertsSupported() {
  return (
    typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function'
  );
}
function formatRequestDetails(data) {
  const value = (field) => String(field || '—');
  const type =
    data.type === 'atc'
      ? text('Диспетчерский контроль', 'ATC control')
      : text('Совместный полёт', 'Fly together');
  return [
    `${text('Тип', 'Type')}: ${type}`,
    `${text('Сеть', 'Network')}: ${value(data.network)}`,
    `${text('Дата и время', 'Date and time')}: ${displayDate(data.date)} ${value(data.time)} (${value(data.timezone)})`,
    `${text('Позывной', 'Callsign')}: ${value(data.callsign)}`,
    `${text('Маршрут или аэропорт', 'Route or airport')}: ${value(data.route)}`,
    `${text('Контакт', 'Contact')}: ${value(data.contact)}`,
    `${text('Детали', 'Details')}: ${value(data.notes)}`,
  ].join('\n');
}
function openRequestFromAlert(id) {
  window.focus();
  if (!user || !lastSnapshot) return;
  $('#status-filter').value = 'all';
  $('#request-search').value = '';
  renderList(lastSnapshot);
  const card = Array.from($('#list').children).find(
    (element) => element.dataset.requestId === id,
  );
  if (card) {
    card.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    card.focus?.({ preventScroll: true });
  } else {
    resetRequestPage();
    requestDirectId = id;
    subscribe();
    $('#list').scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }
}
function renderAdminAlerts() {
  const button = $('#enable-browser-alerts');
  const status = $('#browser-alert-status');
  const preview = $('#admin-alert-preview');
  const details = $('#admin-alert-details');
  const cancellations = $('#admin-cancellation-alert');
  cancellations.hidden = !isAdmin(user) || !adminCancellations.length;
  cancellations.textContent = isAdmin(user)
    ? adminCancellations
        .map(
          (data) =>
            `${text('Заявка отменена', 'Request cancelled')}\n${formatRequestDetails(data)}`,
        )
        .join('\n\n')
    : '';
  preview.hidden = true;
  details.textContent = '';
  document.title = text('Заявки на полёт — Denis Aviation', 'Flight requests — Denis Aviation');
  button.disabled = false;
  status.textContent = '';
  if (!browserAlertsSupported()) {
    button.disabled = true;
    button.textContent = text(
      'Уведомления браузера недоступны',
      'Browser notifications unavailable',
    );
  } else if (Notification.permission === 'granted') {
    button.disabled = true;
    button.textContent = text('Уведомления браузера включены', 'Browser notifications enabled');
  } else if (Notification.permission === 'denied') {
    button.disabled = true;
    button.textContent = text(
      'Уведомления браузера заблокированы',
      'Browser notifications blocked',
    );
    status.textContent = text(
      'Разрешите уведомления для сайта в настройках браузера.',
      'Allow notifications for this site in your browser settings.',
    );
  } else {
    button.textContent = text('Включить уведомления браузера', 'Enable browser notifications');
  }
  renderPushStatus();
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
  const count = Number.isFinite(requestCounts.new) ? requestCounts.new : newRequests.length;
  $('#admin-alert-count').textContent = lastSnapshot.metadata?.fromCache
    ? text(
        `Новых заявок: ${count} · соединение восстанавливается`,
        `New requests: ${count} · reconnecting`,
      )
    : text(`Новых заявок: ${count}`, `New requests: ${count}`);
  if (count) document.title = `(${count}) ${document.title}`;
  if (newRequests.length) {
    const newest = newRequests.slice().sort((a, b) => {
      const left = a.data().createdAt;
      const right = b.data().createdAt;
      return (
        (right?.seconds ?? -Infinity) - (left?.seconds ?? -Infinity) ||
        (right?.nanoseconds ?? 0) - (left?.nanoseconds ?? 0) ||
        a.id.localeCompare(b.id)
      );
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
    const newRequests = confirmed.filter(
      (item) => !adminKnownIds.has(item.id) && item.data().status === 'new',
    );
    if (
      newRequests.length &&
      browserAlertsSupported() &&
      Notification.permission === 'granted'
    ) {
      for (const item of newRequests)
        try {
          const alert = new Notification(
            text('Новая заявка на сайте', 'New request on the site'),
            {
              body: formatRequestDetails(item.data()),
              icon: 'favicon.svg',
            },
          );
          alert.onclick = () => {
            alert.close();
            openRequestFromAlert(item.id);
          };
        } catch (_) {
          // Browser or OS notifications may be unavailable; the in-page alert still works.
        }
    }
  }
  if (adminKnownStatuses) {
    for (const item of confirmed) {
      const data = item.data();
      if (
        adminKnownStatuses.has(item.id) &&
        adminKnownStatuses.get(item.id) !== 'cancelled' &&
        data.status === 'cancelled'
      ) {
        adminCancellations.push(data);
        if (adminCancellations.length > 10) adminCancellations.shift();
        if (browserAlertsSupported() && Notification.permission === 'granted') {
          try {
            const alert = new Notification(text('Заявка отменена', 'Request cancelled'), {
              body: formatRequestDetails(data),
              icon: 'favicon.svg',
            });
            alert.onclick = () => {
              alert.close();
              openRequestFromAlert(item.id);
            };
          } catch (_) {}
        }
      }
    }
  }
  if (!adminKnownStatuses) adminKnownStatuses = new Map();
  for (const item of confirmed) adminKnownStatuses.set(item.id, item.data().status);
  for (const item of confirmed) currentIds.add(item.id);
  adminKnownIds = currentIds;
}
function translate() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-ru]').forEach((el) => {
    el.textContent = el.dataset[language] || el.dataset.en || el.dataset.ru;
  });
  document.querySelectorAll('[data-placeholder-ru]').forEach((el) => {
    el.placeholder =
      el.dataset[
        language === 'it'
          ? 'placeholderIt'
          : language === 'en'
            ? 'placeholderEn'
            : 'placeholderRu'
      ];
  });
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  });
  document.title =
    language === 'it'
      ? 'Richieste di volo — Denis Aviation'
      : language === 'en'
        ? 'Flight requests — Denis Aviation'
        : 'Заявки на полёт — Denis Aviation';
  if (lastNotice) $('#notice').textContent = text(...lastNotice);
  if (lastListNotice) $('#list-notice').textContent = text(...lastListNotice);
  $('#list-title').textContent = isAdmin(user)
    ? text('Все заявки', 'All requests')
    : text('Мои заявки', 'My requests');
  renderControls();
  renderConfirmation();
  renderTimezoneOptions();
  renderAdminAlerts();
  renderVisitorAlerts();
  renderQuota();
  renderMessageAlerts();
  renderPagination();
  renderPushStatus();
  if (lastSnapshot) renderList(lastSnapshot);
}
function renderConfirmation() {
  if (!lastSubmitted) return;
  const d = lastSubmitted;
  $('#confirmation-summary').textContent =
    `${d.type === 'atc' ? text('Диспетчерский контроль', 'ATC control') : text('Совместный полёт', 'Fly together')} · ${d.network}\n${displayDate(d.date)} ${d.time} (${d.timezone})\n${d.callsign} · ${d.route}`;
}
function renderControls() {
  for (const view of chatViews.values()) view.refreshComposer?.();
  $('#send').disabled = !authReady || !!phase;
  $('#login').disabled = !authReady || !!phase;
  $('#logout').disabled = !authReady || !!phase;
  $('#switch-account').disabled =
    !authReady || !!phase || [...chatStates.values()].some((state) => state.sending);
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
    language = ['ru', 'en', 'it'].includes(button.dataset.lang) ? button.dataset.lang : 'ru';
    try {
      localStorage.setItem('dk-aviation-lang', language);
    } catch (_) {}
    translate();
  });
});
const zoneNames = {
  UTC: ['UTC', 'UTC'],
  'Europe/Moscow': ['Москва', 'Moscow', 'Mosca'],
  'Europe/Rome': ['Рим', 'Rome', 'Roma'],
  'Europe/Madrid': ['Мадрид', 'Madrid'],
  'Europe/London': ['Лондон', 'London', 'Londra'],
  'Europe/Paris': ['Париж', 'Paris', 'Parigi'],
  'Europe/Malta': ['Мальта', 'Malta'],
  'Europe/Vienna': ['Вена', 'Vienna', 'Vienna'],
  'America/New_York': ['Нью-Йорк', 'New York'],
  'America/Chicago': ['Чикаго', 'Chicago'],
  'America/Denver': ['Денвер', 'Denver'],
  'America/Los_Angeles': ['Лос-Анджелес', 'Los Angeles'],
  'America/Anchorage': ['Анкоридж', 'Anchorage'],
  'Pacific/Honolulu': ['Гонолулу', 'Honolulu'],
  'America/Mexico_City': ['Мехико', 'Mexico City', 'Città del Messico'],
  'America/Cancun': ['Канкун', 'Cancun'],
  'Asia/Tokyo': ['Токио', 'Tokyo', 'Tokyo'],
  'Asia/Hong_Kong': ['Гонконг', 'Hong Kong'],
  'Asia/Singapore': ['Сингапур', 'Singapore', 'Singapore'],
  'Australia/Sydney': ['Сидней', 'Sydney'],
  'Australia/Canberra': ['Канберра', 'Canberra'],
};
const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
function timezoneLabel(zone) {
  const names = zoneNames[zone];
  const name =
    (language === 'it' ? names?.[2] || names?.[1] : names?.[language === 'ru' ? 0 : 1]) ||
    zone.split('/').pop().replaceAll('_', ' ');
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
  const zones = [...new Set([detectedTimezone, 'Zulu'])];
  const previous = zones.includes(select.value) ? select.value : detectedTimezone;
  select.replaceChildren();
  for (const zone of zones) {
    const option = document.createElement('option');
    option.value = zone;
    option.textContent =
      zone === 'Zulu' ? 'ZULU (UTC+0)' : `${text('Автоматически', 'Automatic')} · ${timezoneLabel(zone)}`;
    select.append(option);
  }
  select.value = previous;
}
renderTimezoneOptions();
$('#form').elements.timezone.value = detectedTimezone;
if (typeof window !== 'undefined') {
  const requestedId = new URLSearchParams(window.location.search).get('request');
  requestDirectId = /^[A-Za-z0-9_-]{1,128}$/.test(requestedId || '') ? requestedId : null;
  const requestedType = new URLSearchParams(window.location.search).get('type');
  if (requestedType === 'flight' || requestedType === 'atc')
    $('#form').elements.type.value = requestedType;
}
let quotaData = null;
const chatStates = new Map();
const chatSubscriptions = new Map();
const chatPreviews = new Map();
const chatViews = new Map();
const messageWatchers = new Map();
const messageAlerts = new Map();
const messageReadMarkers = new Map();
function messageReadKey(id) {
  return `dk-message-read-v1:${user?.uid}:${id}`;
}
function readMessageMarker(id) {
  const key = messageReadKey(id);
  try {
    return localStorage.getItem(key) || messageReadMarkers.get(key) || null;
  } catch (_) {
    return messageReadMarkers.get(key) || null;
  }
}
function markMessagesRead(id) {
  const marker = messageWatchers.get(id)?.lastId;
  if (marker && user) {
    messageReadMarkers.set(messageReadKey(id), marker);
    try {
      localStorage.setItem(messageReadKey(id), marker);
    } catch (_) {}
  }
  messageAlerts.delete(id);
  renderMessageAlerts();
  chatViews.get(id)?.refresh();
}
function renderMessageAlerts() {
  const banner = $('#message-alert');
  if (!banner) return;
  banner.hidden = !user || !messageAlerts.size;
  $('#message-alert-title').textContent = text('Новое сообщение', 'New message');
  $('#message-alert-open').textContent = text('Открыть сообщение', 'Open message');
  $('#message-alert-body').textContent = Array.from(messageAlerts.values())
    .map(
      (entry) =>
        `${entry.request.callsign || '—'} · ${entry.request.route || '—'}\n${entry.body}`,
    )
    .join('\n\n');
}
function clearMessageWatchers() {
  for (const entry of messageWatchers.values()) entry.stop();
  messageWatchers.clear();
  chatPreviews.clear();
  chatViews.clear();
  messageAlerts.clear();
  renderMessageAlerts();
}
function syncMessageWatchers(snapshot) {
  // Test helpers and failed SDK loads must not start partially initialised subscriptions.
  if (!user || !orderBy || !limitToLast) return;
  const uid = user.uid;
  const ids = new Set(snapshot.docs.map((item) => item.id));
  for (const [id, entry] of messageWatchers) {
    if (!ids.has(id)) {
      entry.stop();
      messageWatchers.delete(id);
      chatPreviews.delete(id);
      messageAlerts.delete(id);
    }
  }
  for (const item of snapshot.docs) {
    const existing = messageWatchers.get(item.id);
    if (existing) {
      existing.request = item.data();
      continue;
    }
    const entry = { request: item.data(), ready: false, lastId: null, stop: () => {} };
    messageWatchers.set(item.id, entry);
    entry.stop = onSnapshot(
      query(
        collection(db, 'flightRequests', item.id, 'messages'),
        orderBy('createdAt'),
        limitToLast(1),
      ),
      { includeMetadataChanges: true },
      (messages) => {
        if (
          user?.uid !== uid ||
          messageWatchers.get(item.id) !== entry ||
          messages.metadata?.fromCache
        )
          return;
        const latest = messages.docs.at(-1);
        if (latest?.metadata?.hasPendingWrites) return;
        const data = latest?.data();
        if (data) chatPreviews.set(item.id, data);
        else chatPreviews.delete(item.id);
        const unread =
          latest && data.authorUid !== uid && readMessageMarker(item.id) !== latest.id;
        if (unread) {
          messageAlerts.delete(item.id);
          messageAlerts.set(item.id, { request: entry.request, body: data.body });
          renderMessageAlerts();
          if (
            entry.ready &&
            latest.id !== entry.lastId &&
            browserAlertsSupported() &&
            Notification.permission === 'granted'
          ) {
            try {
              const alert = new Notification(text('Новое сообщение', 'New message'), {
                body: `${data.body}\n${formatVisitorUpdate(entry.request)}`,
                icon: 'favicon.svg',
                tag: `request-message-${item.id}`,
              });
              alert.onclick = () => {
                alert.close();
                openMessageFromAlert(item.id);
              };
            } catch (_) {}
          }
        }
        if (!unread) messageAlerts.delete(item.id);
        renderMessageAlerts();
        entry.ready = true;
        entry.lastId = latest?.id || null;
        chatViews.get(item.id)?.refresh();
      },
      () => {
        if (user?.uid !== uid || messageWatchers.get(item.id) !== entry) return;
        notice(
          'Не удалось подключить уведомления о сообщениях. Обнови страницу.',
          'Could not connect message alerts. Refresh the page.',
          'list',
        );
      },
    );
  }
  renderMessageAlerts();
}
function openMessageFromAlert(id) {
  const state = chatStates.get(id) || { draft: '', sending: false };
  chatStates.set(id, state);
  markMessagesRead(id);
  openRequestFromAlert(id);
}
$('#message-alert-open')?.addEventListener('click', () => {
  const latest = Array.from(messageAlerts.keys()).at(-1);
  if (latest) openMessageFromAlert(latest);
});
function utcDay(milliseconds) {
  return new Date(milliseconds).toISOString().slice(0, 10);
}
function quotaCount(data, now = Date.now()) {
  const stamp = data?.updatedAt?.toMillis?.();
  return Number.isFinite(stamp) && utcDay(stamp) === utcDay(now)
    ? Math.min(5, Math.max(0, Number(data.count) || 0))
    : 0;
}
function renderQuota() {
  const bar = $('#daily-usage');
  if (!bar) return;
  const count = quotaCount(quotaData);
  bar.hidden = !user;
  bar.setAttribute('aria-label', text('Активность за день', 'Daily activity'));
  bar.setAttribute('aria-valuenow', String(count));
  for (const [index, segment] of Array.from(bar.children || []).entries()) {
    segment.dataset.filled = String(index < count);
  }
}
function subscribeQuota() {
  const uid = user.uid;
  quotaUnsubscribe = onSnapshot(
    doc(db, 'requestQuotas', uid),
    (snapshot) => {
      if (user?.uid !== uid) return;
      quotaData = snapshot.exists() ? snapshot.data() : null;
      renderQuota();
    },
    () => {
      if (user?.uid === uid) {
        quotaData = null;
        renderQuota();
      }
    },
  );
}
if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
  const refreshDay = () => {
    renderQuota();
    const now = new Date();
    const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
    window.setTimeout(refreshDay, midnight - now.getTime() + 100);
  };
  refreshDay();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) renderQuota();
  });
}
async function createRequest(account, data) {
  if (serviceConfig.secureApi === true) {
    if (!secureCall) throw new Error('Secure request service unavailable');
    try {
      await secureCall('createFlightRequest', data);
    } catch (error) {
      if (error?.code === 'functions/resource-exhausted') error.code = 'daily-limit';
      throw error;
    }
    return;
  }
  const requestRef = doc(collection(db, 'flightRequests'));
  const quotaRef = doc(db, 'requestQuotas', account.uid);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(quotaRef);
    const count = snapshot.exists() ? quotaCount(snapshot.data()) : 0;
    if (count >= 5) {
      const error = new Error('Daily activity exhausted');
      error.code = 'daily-limit';
      throw error;
    }
    transaction.set(quotaRef, {
      count: count + 1,
      updatedAt: serverTimestamp(),
      requestId: requestRef.id,
    });
    transaction.set(requestRef, {
      ...data,
      owner: account.uid,
      ownerEmail: account.email,
      status: 'new',
      createdAt: serverTimestamp(),
    });
  });
}
function updateNotesCounter() {
  const input = $('#form').elements.notes;
  if (!input) return;
  const length = (input.value || '').length;
  $('#notes-counter').textContent = `${length} / 500`;
  $('#notes-counter').dataset.full = String(length >= 500);
}
function closeChatSubscriptions() {
  for (const unsubscribeChat of chatSubscriptions.values()) unsubscribeChat();
  chatSubscriptions.clear();
}
function attachChat(card, item) {
  const state = chatStates.get(item.id) || { draft: '', sending: false };
  chatStates.set(item.id, state);
  const shell = document.createElement('section');
  shell.className = 'request-chat';
  const heading = document.createElement('h4');
  heading.textContent = text('Комментарии', 'Comments');
  shell.append(heading);
  const oldComment = item.data().adminComment;
  state.canReply = !!(
    state.canReply ||
    isAdmin(user) ||
    (typeof oldComment === 'string' && oldComment.trim())
  );
  shell.hidden = !state.canReply;
  if (typeof oldComment === 'string' && oldComment.trim()) {
    const legacy = document.createElement('p');
    legacy.className = 'admin-comment';
    legacy.textContent = `${text('Комментарий администратора', 'Administrator comment')}: ${oldComment}`;
    shell.append(legacy);
  }
  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.id = `chat-${item.id}`;
  const history = document.createElement('div');
  history.className = 'chat-history';
  history.setAttribute('role', 'log');
  history.setAttribute('aria-label', text('Обсуждение', 'Conversation'));
  history.setAttribute('aria-live', 'polite');
  const composer = document.createElement('form');
  composer.className = 'chat-composer';
  const label = document.createElement('label');
  const title = document.createElement('span');
  title.textContent = isAdmin(user)
    ? text('Ответить клиенту', 'Reply to client')
    : text('Ответить администратору', 'Reply to administrator');
  const input = document.createElement('textarea');
  input.maxLength = 150;
  input.rows = 2;
  input.placeholder = text('Напиши короткий ответ…', 'Write a short reply…');
  input.required = true;
  input.value = state.draft;
  input.disabled = state.sending;
  label.append(title, input);
  const actions = document.createElement('div');
  actions.className = 'chat-actions';
  const counter = document.createElement('small');
  const send = document.createElement('button');
  send.type = 'submit';
  send.className = 'chat-send';
  send.textContent = text('Отправить', 'Send');
  const feedback = document.createElement('p');
  feedback.className = 'chat-feedback';
  feedback.setAttribute('role', 'status');
  function updateComposer() {
    input.disabled = state.sending;
    input.value = state.draft;
    feedback.textContent = state.error || '';
    counter.textContent = `${input.value.length} / 150`;
    send.disabled =
      !state.canReply ||
      state.sending ||
      !!phase ||
      !input.value.trim() ||
      input.value.length > 150;
  }
  input.addEventListener('input', () => {
    state.draft = input.value;
    updateComposer();
  });
  updateComposer();
  actions.append(counter, send);
  composer.append(label, actions, feedback);
  const earlier = document.createElement('button');
  earlier.type = 'button';
  earlier.className = 'chat-earlier';
  earlier.textContent = text('Показать предыдущие', 'Show previous messages');
  earlier.hidden = true;
  const problem = document.createElement('p');
  problem.className = 'chat-feedback';
  problem.setAttribute('role', 'alert');
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = text('Повторить', 'Retry');
  retry.hidden = true;
  panel.append(history, composer, earlier, problem, retry);
  composer.hidden = !state.canReply;
  function chatError(message, action) {
    shell.hidden = false;
    problem.textContent = message;
    retry.hidden = false;
    retry.onclick = action;
  }
  function clearChatError() {
    problem.textContent = '';
    retry.hidden = true;
  }

  shell.append(panel);
  card.append(shell);
  function refreshPreview() {
    shell.dataset.unread = String(messageAlerts.has(item.id));
  }
  chatViews.set(item.id, {
    refresh: refreshPreview,
    refreshComposer: updateComposer,
    refreshHistory: renderHistory,
    history,
  });
  refreshPreview();
  state.messages ||= new Map();
  function renderHistory() {
    const atBottom = history.scrollHeight - history.scrollTop - history.clientHeight < 40;
    const firstLoad = !history.children.length;
    history.replaceChildren();
    const docs = [...state.messages.values()].sort(
      (a, b) =>
        (a.data().createdAt?.seconds || 0) - (b.data().createdAt?.seconds || 0) ||
        (a.data().createdAt?.nanoseconds || 0) - (b.data().createdAt?.nanoseconds || 0) ||
        (String(a.id || '') < String(b.id || '')
          ? -1
          : String(a.id || '') > String(b.id || '')
            ? 1
            : 0),
    );
    if (!docs.length) history.textContent = text('Сообщений пока нет.', 'No messages yet.');
    for (const message of docs) {
      const data = message.data();
      const bubble = document.createElement('div');
      bubble.className = 'chat-message';
      bubble.dataset.own = String(data.authorUid === user.uid);
      bubble.dataset.role = data.authorRole;
      const meta = document.createElement('span');
      meta.className = 'chat-meta';
      const author =
        data.authorUid === user.uid
          ? text('Вы', 'You')
          : data.authorRole === 'admin'
            ? text('Администратор', 'Administrator')
            : text('Клиент', 'Client');
      const date = data.createdAt?.toDate?.();
      const stamp = date
        ? new Intl.DateTimeFormat(language, { dateStyle: 'short', timeStyle: 'short' }).format(
            date,
          )
        : '…';
      meta.textContent = `${author} · ${stamp}`;
      const body = document.createElement('p');
      body.textContent = data.body;
      bubble.append(meta, body);
      history.append(bubble);
    }
    state.oldest = docs[0] || null;
    earlier.hidden = !state.hasOlder;
    earlier.disabled = !!state.loadingOlder;
    if (firstLoad || atBottom) history.scrollTop = history.scrollHeight;
  }
  function loadMessages() {
    if (chatSubscriptions.has(item.id)) return;
    clearChatError();
    if (!state.messages.size)
      history.textContent = text('Загружаем сообщения…', 'Loading messages…');
    const uid = user.uid;
    const messages = query(
      collection(db, 'flightRequests', item.id, 'messages'),
      orderBy('createdAt'),
      limitToLast(10),
    );
    const stop = onSnapshot(
      messages,
      (snapshot) => {
        if (user?.uid !== uid || chatViews.get(item.id)?.history !== history) return;
        clearChatError();
        if (state.hasOlder === undefined) state.hasOlder = snapshot.docs.length === 10;
        for (const message of snapshot.docs) state.messages.set(message.id, message);
        renderHistory();
      },
      () => {
        if (user?.uid !== uid || chatViews.get(item.id)?.history !== history) return;
        chatSubscriptions.get(item.id)?.();
        chatSubscriptions.delete(item.id);
        chatError(
          text('Не удалось загрузить сообщения.', 'Could not load messages.'),
          loadMessages,
        );
      },
    );
    chatSubscriptions.set(item.id, stop);
  }
  earlier.addEventListener('click', async () => {
    if (state.loadingOlder || !state.oldest || !user) return;
    const uid = user.uid,
      oldest = state.oldest;
    state.loadingOlder = true;
    earlier.disabled = true;
    clearChatError();
    try {
      const page = await getDocs(
        query(
          collection(db, 'flightRequests', item.id, 'messages'),
          orderBy('createdAt'),
          endBefore(oldest),
          limitToLast(10),
        ),
      );
      if (user?.uid !== uid || chatStates.get(item.id) !== state) return;
      for (const message of page.docs) state.messages.set(message.id, message);
      state.hasOlder = page.docs.length === 10;
      if (chatViews.get(item.id)?.history === history) {
        const top = history.scrollTop,
          height = history.scrollHeight;
        renderHistory();
        history.scrollTop = top + history.scrollHeight - height;
      }
    } catch (_) {
      if (user?.uid === uid && chatViews.get(item.id)?.history === history)
        chatError(text('Не удалось загрузить сообщения.', 'Could not load messages.'), () =>
          earlier.click(),
        );
    } finally {
      state.loadingOlder = false;
      earlier.disabled = false;
      if (user?.uid === uid && chatStates.get(item.id) === state)
        chatViews.get(item.id)?.refreshHistory?.();
    }
  });
  input.addEventListener('focus', () => {
    markMessagesRead(item.id);
  });
  composer.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = input.value.trim();
    if (!state.canReply || state.sending || phase || !body || body.length > 150 || !user)
      return;
    const account = user;
    state.draft = input.value;
    state.sending = true;
    renderControls();
    input.disabled = true;
    updateComposer();
    state.error = '';
    feedback.textContent = '';
    try {
      if (serviceConfig.secureApi === true) {
        if (!secureCall) throw new Error('Secure messaging unavailable');
        await secureCall('sendRequestMessage', { requestId: item.id, body });
      } else
        await addDoc(collection(db, 'flightRequests', item.id, 'messages'), {
          authorUid: account.uid,
          authorRole: isAdmin(account) ? 'admin' : 'client',
          body,
          createdAt: serverTimestamp(),
        });
      if (user?.uid !== account.uid || chatStates.get(item.id) !== state) return;
      state.draft = '';
      state.error = '';
      input.value = '';
      messageAlerts.delete(item.id);
      renderMessageAlerts();
      refreshPreview();
    } catch (error) {
      state.error =
        error?.code === 'functions/resource-exhausted'
          ? text(
              'Слишком частая отправка. Подожди и попробуй ещё раз.',
              'Too many messages. Wait and try again.',
            )
          : text(
              'Не удалось отправить сообщение. Попробуйте ещё раз.',
              'Could not send the message. Try again.',
            );
      feedback.textContent = state.error;
    } finally {
      state.sending = false;
      renderControls();
      if (user?.uid === account.uid && chatStates.get(item.id) === state)
        chatViews.get(item.id)?.refreshComposer?.();
    }
  });
  function checkFirstAdminReply() {
    const uid = user.uid,
      key = `${item.id}:admin`;
    chatSubscriptions.get(key)?.();
    chatSubscriptions.delete(key);
    clearChatError();
    const firstAdminReply = query(
      collection(db, 'flightRequests', item.id, 'messages'),
      where('authorRole', '==', 'admin'),
      limit(1),
    );
    const stop = onSnapshot(
      firstAdminReply,
      (snapshot) => {
        if (user?.uid !== uid || chatViews.get(item.id)?.history !== history) return;
        clearChatError();
        if (snapshot.empty) {
          shell.hidden = true;
          return;
        }
        state.canReply = true;
        shell.hidden = false;
        composer.hidden = false;
        updateComposer();
        loadMessages();
      },
      () => {
        if (user?.uid !== uid || chatViews.get(item.id)?.history !== history) return;
        composer.hidden = true;
        chatError(
          text(
            'Не удалось проверить ответ администратора.',
            'Could not check the administrator reply.',
          ),
          checkFirstAdminReply,
        );
      },
    );
    chatSubscriptions.set(key, stop);
  }
  if (state.canReply) loadMessages();
  else checkFirstAdminReply();
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
        $('#form').elements[key].value =
          key === 'date'
            ? parseDate(saved[key]) || parseDate(displayDate(saved[key])) || ''
            : key === 'timezone'
              ? saved[key] === 'UTC' && detectedTimezone !== 'UTC'
                ? 'Zulu'
                : [detectedTimezone, 'Zulu'].includes(saved[key])
                  ? saved[key]
                  : detectedTimezone
              : saved[key];
      }
    }
    if (saved.notes) $('.more-details').open = true;
    $('#save-draft').checked = true;
  }
} catch (_) {}
const timeHours = $('#time-hours');
const timeMinutes = $('#time-minutes');
const timeInput = $('#form').elements.time;
for (const [select, count] of [
  [timeHours, 24],
  [timeMinutes, 60],
]) {
  for (let number = 0; number < count; number++) {
    const option = document.createElement('option');
    option.value = String(number).padStart(2, '0');
    option.textContent = option.value;
    select.append(option);
  }
}
if (timeInput && /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput.value)) {
  [timeHours.value, timeMinutes.value] = timeInput.value.split(':');
}
function syncTime() {
  if (!timeInput) return;
  timeInput.value =
    timeHours.value && timeMinutes.value ? `${timeHours.value}:${timeMinutes.value}` : '';
  saveDraft();
}
timeHours.addEventListener('change', syncTime);
timeMinutes.addEventListener('change', syncTime);
function saveDraft() {
  updateNotesCounter();
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
updateNotesCounter();
$('#form').addEventListener('input', saveDraft);
$('#form').addEventListener('change', saveDraft);
$('#new-form').addEventListener('click', () => {
  $('#confirmation').hidden = true;
  $('#form').hidden = false;
  lastSubmitted = null;
  notice('', '');
});
$('#status-filter').addEventListener('change', () => {
  if (!isAdmin(user)) return;
  if (serviceConfig.secureApi === true) {
    requestDirectId = null;
    resetRequestPage();
    subscribe();
  } else if (lastSnapshot) renderList(lastSnapshot);
});
$('#request-search').addEventListener('input', () => {
  if (isAdmin(user) && lastSnapshot) renderList(lastSnapshot);
});
$('#show-new-requests').addEventListener('click', () => {
  if (!isAdmin(user) || !lastSnapshot) return;
  $('#status-filter').value = 'new';
  $('#request-search').value = '';
  requestDirectId = null;
  resetRequestPage();
  subscribe();
  $('#list').scrollIntoView?.({ behavior: 'smooth', block: 'start' });
});
$('#enable-browser-alerts').addEventListener('click', () => enablePush());
$('#enable-visitor-alerts').addEventListener('click', () => enablePush());
translate();
async function getPushMessaging() {
  if (!serviceConfig.vapidKey || serviceConfig.secureApi !== true || !secureCall)
    throw new Error('Push service is not configured');
  if (!('serviceWorker' in navigator)) throw new Error('Service worker unavailable');
  pushSdk ||= await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js');
  if (!(await pushSdk.isSupported())) throw new Error('Push unavailable');
  if (!pushMessaging) {
    pushMessaging = pushSdk.getMessaging(firebaseApp);
  }
  return pushMessaging;
}
function renderPushStatus() {
  const active = !!user && pushOwner === user.uid && !!pushToken;
  const configured = serviceConfig.secureApi === true && !!serviceConfig.vapidKey;
  if (!configured) {
    if ($('#push-status'))
      $('#push-status').textContent = text(
        'Фоновая доставка ещё не настроена. Уведомления браузера работают при открытой странице.',
        'Background delivery is not configured yet. Browser notifications work while this page is open.',
      );
    return;
  }
  for (const id of ['#enable-browser-alerts', '#enable-visitor-alerts']) {
    const button = $(id);
    if (!button) continue;
    button.disabled =
      active ||
      !configured ||
      !browserAlertsSupported() ||
      Notification.permission === 'denied';
    button.textContent =
      browserAlertsSupported() && Notification.permission === 'denied'
        ? text('Уведомления браузера заблокированы', 'Browser notifications blocked')
        : active
          ? text('Фоновые уведомления включены', 'Background notifications enabled')
          : configured
            ? text('Включить фоновые уведомления', 'Enable background notifications')
            : text(
                'Фоновые уведомления ещё не настроены',
                'Background notifications are not configured yet',
              );
  }
  if ($('#push-status')) $('#push-status').textContent = pushProblem;
}
async function registerPush() {
  const uid = user?.uid;
  if (!uid) return;
  await getPushMessaging();
  const registration = await navigator.serviceWorker.register('./sw.js');
  await navigator.serviceWorker.ready;
  const token = await pushSdk.getToken(pushMessaging, {
    vapidKey: serviceConfig.vapidKey,
    serviceWorkerRegistration: registration,
  });
  if (!token || user?.uid !== uid) return;
  await secureCall('registerRequestPush', { token, language });
  if (user?.uid !== uid) {
    await pushSdk.deleteToken(pushMessaging);
    return;
  }
  pushToken = token;
  pushOwner = uid;
  pushProblem = '';
  renderPushStatus();
}
async function enablePush() {
  if (!user || !browserAlertsSupported()) return;
  try {
    // Permission request stays directly inside the visitor's click gesture.
    const permission =
      Notification.permission === 'default'
        ? await Notification.requestPermission()
        : Notification.permission;
    if (permission === 'granted') {
      if (serviceConfig.secureApi === true && serviceConfig.vapidKey) await registerPush();
    } else throw new Error('Notifications blocked');
  } catch (_) {
    pushProblem = text(
      'Не удалось включить фоновые уведомления. Проверь разрешение браузера и попробуй снова.',
      'Could not enable background notifications. Check browser permission and try again.',
    );
  }
  renderAdminAlerts();
  renderVisitorAlerts();
  renderPushStatus();
}
async function restorePush() {
  if (
    serviceConfig.secureApi !== true ||
    !serviceConfig.vapidKey ||
    !browserAlertsSupported() ||
    Notification.permission !== 'granted'
  )
    return;
  try {
    await registerPush();
  } catch (_) {
    pushProblem = text(
      'Фоновая доставка не подключена. Включи уведомления повторно.',
      'Background delivery is disconnected. Enable notifications again.',
    );
  }
  renderPushStatus();
}
async function disconnectPush() {
  // Delete the browser subscription on sign-out/account change. The server binds a
  // token to only one UID and deletes stale/invalid registrations on delivery.
  pushToken = null;
  pushOwner = null;
  try {
    if (pushMessaging && pushSdk) await pushSdk.deleteToken(pushMessaging);
  } catch (_) {}
  renderPushStatus();
}
function resetRequestPage() {
  requestPageCursor = null;
  requestPageStack = [];
  requestPageNext = null;
  adminKnownIds = null;
  adminKnownStatuses = null;
}
function renderPagination() {
  const controls = $('#request-pagination');
  if (!controls) return;
  controls.hidden = !user || (!isAdmin(user) && !requestDirectId);
  if ($('#status-filter-title'))
    $('#status-filter-title').textContent =
      serviceConfig.secureApi === true
        ? text('Фильтр по статусу', 'Filter by status')
        : text('Статус на текущей странице', 'Status on this page');
  $('#requests-previous').disabled = !requestPageStack.length;
  $('#requests-next').disabled = !requestPageNext;
  $('#requests-page').textContent = requestDirectId
    ? text('Заявка из уведомления', 'Request from notification')
    : `${text('Страница', 'Page')} ${requestPageStack.length + 1} · ${text('поиск на этой странице', 'search within this page')}`;
}
$('#requests-latest')?.addEventListener('click', () => {
  if (!user) return;
  requestDirectId = null;
  resetRequestPage();
  subscribe();
});
$('#requests-next')?.addEventListener('click', () => {
  if (!requestPageNext || !isAdmin(user)) return;
  requestPageStack.push(requestPageCursor);
  requestPageCursor = requestPageNext;
  adminKnownIds = null;
  adminKnownStatuses = null;
  subscribe();
});
$('#requests-previous')?.addEventListener('click', () => {
  if (!requestPageStack.length || !isAdmin(user)) return;
  requestPageCursor = requestPageStack.pop();
  adminKnownIds = null;
  adminKnownStatuses = null;
  subscribe();
});
async function refreshRequestCounts(uid, generation) {
  if (!getCountFromServer || !isAdmin(user)) return;
  try {
    const counts = await Promise.all(
      ['new', 'review', 'confirmed'].map(async (status) => {
        const result = await getCountFromServer(
          query(collection(db, 'flightRequests'), where('status', '==', status)),
        );
        return [status, result.data().count];
      }),
    );
    if (user?.uid !== uid || pageGeneration !== generation) return;
    for (const [status, count] of counts) {
      requestCounts[status] = count;
      $(`#count-${status}`).textContent = String(count);
    }
    renderAdminAlerts();
  } catch (_) {
    if (user?.uid === uid && pageGeneration === generation)
      for (const status of ['new', 'review', 'confirmed'])
        $(`#count-${status}`).textContent = '—';
  }
}
function subscribe() {
  const generation = ++pageGeneration,
    uid = user.uid;
  requestPageNext = null;
  renderPagination();
  closeChatSubscriptions();
  clearMessageWatchers();
  if (unsubscribe) unsubscribe();
  const list = $('#list');
  list.replaceChildren();
  const ref = collection(db, 'flightRequests');
  const constraints = [];
  if (requestDirectId) {
    constraints.push(where('__name__', '==', requestDirectId));
    if (!isAdmin(user)) constraints.push(where('owner', '==', user.uid));
    constraints.push(limit(1));
  } else if (isAdmin(user)) {
    const status = $('#status-filter').value;
    if (serviceConfig.secureApi === true && status && status !== 'all')
      constraints.push(where('status', '==', status));
    constraints.push(orderBy('createdAt', 'desc'));
    if (requestPageCursor) constraints.push(startAfter(requestPageCursor));
    constraints.push(limit(REQUEST_PAGE_SIZE + 1));
  } else constraints.push(where('owner', '==', user.uid));
  const q = query(ref, ...constraints);
  unsubscribe = onSnapshot(
    q,
    { includeMetadataChanges: true },
    (rawSnapshot) => {
      if (user?.uid !== uid || pageGeneration !== generation) return;
      const docs = isAdmin(user)
        ? rawSnapshot.docs.slice(0, REQUEST_PAGE_SIZE)
        : rawSnapshot.docs;
      const snapshot = { docs, empty: !docs.length, metadata: rawSnapshot.metadata };
      requestPageNext =
        isAdmin(user) && rawSnapshot.docs.length > REQUEST_PAGE_SIZE ? docs.at(-1) : null;
      renderPagination();
      announceNewRequests(snapshot);
      void refreshRequestCounts(uid, generation);
      announceVisitorChanges(snapshot);
      lastSnapshot = snapshot;
      syncMessageWatchers(snapshot);
      adminAlertProblem = false;
      renderList(snapshot);
      // Rebuild the title before adding the current count.
      document.title = text(
        'Заявки на полёт — Denis Aviation',
        'Flight requests — Denis Aviation',
      );
      renderAdminAlerts();
    },
    () => {
      if (user?.uid !== uid || pageGeneration !== generation) return;
      adminAlertProblem = true;
      clearMessageWatchers();
      lastSnapshot = null;
      document.title = text(
        'Заявки на полёт — Denis Aviation',
        'Flight requests — Denis Aviation',
      );
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
  closeChatSubscriptions();
  chatViews.clear();
  const list = $('#list');
  list.replaceChildren();
  const counts = { new: 0, review: 0, confirmed: 0 };
  for (const item of snapshot.docs)
    if (Object.hasOwn(counts, item.data().status)) counts[item.data().status]++;
  if (isAdmin(user)) renderPagination();
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
          [data.callsign, data.route, data.contact, data.ownerEmail].some((value) =>
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
    details.textContent = `${displayDate(d.date)} ${d.time} (${d.timezone})\n${d.callsign} · ${d.route}\n${text('Контакт', 'Contact')}: ${d.contact || '—'}${d.notes ? '\n' + d.notes : ''}`;
    if (isAdmin(user)) {
      details.textContent += `\n${text('Почта аккаунта', 'Account email')}: ${d.ownerEmail || text('нет данных', 'unavailable')}`;
    }
    card.append(title, details);

    if (isAdmin(user)) {
      const label = document.createElement('label'),
        span = document.createElement('span'),
        select = document.createElement('select');
      label.className = 'request-status-control';
      span.textContent = text('Статус', 'Status');
      for (const [value, labels] of Object.entries(statuses)) {
        if (value === 'cancelled' && d.status !== 'cancelled') continue;
        const option = document.createElement('option');
        option.value = value;
        option.textContent = labels[language === 'it' ? 2 : language === 'en' ? 1 : 0];
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
      status.textContent = `${text('Статус', 'Status')}: ${(statuses[d.status] || [d.status, d.status, d.status])[language === 'it' ? 2 : language === 'en' ? 1 : 0]}`;
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
            if (
              !current.exists() ||
              current.data().owner !== uid ||
              !['new', 'review', 'confirmed'].includes(current.data().status)
            )
              throw new Error('Request is no longer cancellable');
            transaction.update(ref, { status: 'cancelled' });
          });
          notice('Заявка отменена.', 'Request cancelled.', 'list', 'success');
        } catch (_) {
          notice(
            'Не удалось отменить заявку. Возможно, её статус изменился. Обнови страницу и попробуй снова.',
            'Could not cancel the request. Its status may have changed. Refresh the page and try again.',
            'list',
          );
          button.disabled = false;
        }
      });
      card.append(button);
    }
    attachChat(card, item);
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
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(data.time || '')) {
    notice('Выбери часы и минуты.', 'Choose hours and minutes.');
    return;
  }
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(data.date || '')
    ? parseDate(displayDate(data.date))
    : null;
  if (!parsedDate) {
    notice('Выбери существующую дату.', 'Choose a valid date.');
    return;
  }
  data.date = parsedDate;
  for (const key of ['timezone', 'callsign', 'route', 'contact', 'notes'])
    data[key] = data[key].trim();
  // Zulu is the aviation name for UTC, not a separate time offset.
  if (data.timezone === 'Zulu') data.timezone = 'UTC';
  if (!data.timezone || !data.callsign || !data.route) {
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
  if (data.notes.length > 500) {
    notice(
      'Детали должны содержать не более 500 символов.',
      'Details must be no longer than 500 characters.',
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
    await createRequest(submittingUser, data);
    lastSubmitted = data;
    renderConfirmation();
    $('#confirmation').hidden = false;
    form.hidden = true;
    try {
      localStorage.removeItem(draftKey);
    } catch (_) {}
    $('#save-draft').checked = false;
    form.reset();
    updateNotesCounter();
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
    } else if (error?.code === 'daily-limit') {
      notice(
        'Отправка временно недоступна. Попробуйте завтра.',
        'Sending is temporarily unavailable. Try tomorrow.',
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
async function switchAccount() {
  if (!authReady || phase || [...chatStates.values()].some((state) => state.sending)) return;
  phase = 'signing-in';
  renderControls();
  notice('', '');
  try {
    const provider = new authSdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await authSdk.signInWithPopup(auth, provider);
  } catch (error) {
    signInError(error);
  } finally {
    phase = '';
    renderControls();
  }
}
async function start() {
  try {
    const [appSdk, loadedAuthSdk, fs] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js'),
    ]);
    authSdk = loadedAuthSdk;
    const app = appSdk.initializeApp(config);
    firebaseApp = app;
    auth = authSdk.getAuth(app);
    db = fs.getFirestore(app);
    ({
      collection,
      query,
      where,
      onSnapshot,
      addDoc,
      serverTimestamp,
      updateDoc,
      doc,
      runTransaction,
      orderBy,
      limitToLast,
      limit,
      Timestamp,
      getDocs,
      getDoc,
      endBefore,
      startAfter,
      getCountFromServer,
    } = fs);
    // An absent/old rules deployment keeps the existing request flow operational.
    // When secureApi is enabled, failures never fall back to direct writes.
    try {
      const settings = await getDoc(doc(db, 'requestService', 'config'));
      serviceConfig = settings.exists() ? settings.data() : {};
    } catch (_) {
      serviceConfig = {};
    }
    if (serviceConfig.secureApi === true) {
      const functionsSdk = await import(
        'https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js'
      );
      const functions = functionsSdk.getFunctions(app, 'europe-west1');
      secureCall = async (name, data) =>
        (await functionsSdk.httpsCallable(functions, name)(data)).data;
    }
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
    $('#switch-account').addEventListener('click', switchAccount);
    $('#logout').addEventListener('click', async () => {
      if (!authReady || phase) return;
      try {
        await authSdk.signOut(auth);
      } catch (_) {
        notice('Не удалось выйти. Попробуй ещё раз.', 'Could not sign out. Please try again.');
      }
    });
    authSdk.onAuthStateChanged(auth, (u) => {
      closeChatSubscriptions();
      clearMessageWatchers();
      chatStates.clear();
      if (quotaUnsubscribe) quotaUnsubscribe();
      quotaUnsubscribe = null;
      quotaData = null;
      const previousUser = user;
      user = u;
      resetRequestPage();
      const pushReset = previousUser?.uid !== u?.uid ? disconnectPush() : Promise.resolve();
      authReady = true;
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      $('#list').replaceChildren();
      lastSnapshot = null;
      adminKnownIds = null;
      adminKnownStatuses = null;
      adminCancellations = [];
      visitorKnownStatuses = null;
      visitorUpdates = [];
      $('#visitor-tools').hidden = !u || !!isAdmin(u);
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
      $('#switch-account').hidden = !u;
      $('#identity').textContent = u?.email || '';
      $('#account-info').hidden = !u;
      $('#auth-hint').hidden = !!u;
      translate();
      if (u) {
        subscribe();
        subscribeQuota();
        void pushReset.then(() => {
          if (user?.uid === u.uid) return restorePush();
        });
      }
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
