(() => {
  const key = 'denis-aviation-guide-v1';
  const dialog = document.getElementById('site-guide');
  const open = document.getElementById('guide-open');
  if (!dialog || !open || typeof dialog.showModal !== 'function') return;
  const ui = {
    ru: {label:'ПУТЕВОДИТЕЛЬ', previous:'Назад', next:'Далее', finish:'Готово', skip:'Пропустить', visit:'Перейти к разделу', close:'Закрыть путеводитель', step:'Шаг'},
    en: {label:'SITE GUIDE', previous:'Back', next:'Next', finish:'Done', skip:'Skip', visit:'Explore this section', close:'Close guide', step:'Step'},
    it: {label:'GUIDA AL SITO', previous:'Indietro', next:'Avanti', finish:'Fine', skip:'Salta', visit:'Vai alla sezione', close:'Chiudi la guida', step:'Passo'},
  };
  const steps = [
    {target:'flying', ru:['Виртуальный ангар','Выбери самолёт, вращай модель и меняй ракурс. Попробуй выпустить шасси и закрылки или включить огни.'], en:['Virtual hangar','Choose an aircraft, rotate the model and change the view. Try the landing gear, flaps and lights.'], it:['Hangar virtuale','Scegli un aereo, ruota il modello e cambia visuale. Prova carrello, flap e luci.']},
    {target:'logbook', ru:['Журнал полётов','Изучи записи Volanta и выбери «Показать маршрут», чтобы воспроизвести один из полётов.'], en:['Flight logbook','Explore Volanta records and select “Show route” to replay a flight.'], it:['Diario di volo','Esplora i voli registrati su Volanta e seleziona «Mostra rotta» per riprodurre un volo.']},
    {target:'airports', ru:['География полётов','Выбери аэропорт на глобусе или найди его в списке. Линии показывают географию, а не историю рейсов.'], en:['Flight geography','Choose an airport on the globe or find it in the list. The lines show geography, not flight history.'], it:['Geografia dei voli','Scegli un aeroporto sul globo o cercalo nell’elenco. Le linee mostrano la geografia, non lo storico dei voli.']},
    {target:'atc', ru:['Тренировочный полёт','Попробуй управлять самолётом, выполни задание и наблюдай за демонстрационным трафиком на радаре.'], en:['Flight challenge','Try flying the aircraft, complete the challenge and watch simulated traffic on the radar.'], it:['Sfida di volo','Prova a pilotare, completa la sfida e osserva il traffico simulato sul radar.']},
    {target:'booking', ru:['Полёт вместе','Оставь заявку на совместный полёт или диспетчерское сопровождение и следи за её статусом на сайте.'], en:['Fly together','Send a request for a shared flight or ATC service and check its status on the site.'], it:['Voliamo insieme','Invia una richiesta per volare insieme o ricevere assistenza ATC e controllane lo stato sul sito.']},
    {target:'contact', ru:['Остаёмся на связи','Напиши мне или загляни в другие проекты. Этот путеводитель всегда можно открыть снова кнопкой внизу экрана.'], en:['Keep in touch','Send me a message or explore my other projects. You can reopen this guide with the button at the bottom of the screen.'], it:['Restiamo in contatto','Scrivimi o scopri gli altri progetti. Puoi riaprire questa guida con il pulsante in fondo allo schermo.']},
  ];
  const $ = (selector) => dialog.querySelector(selector);
  let index = 0;
  let opener = open;
  const language = () => ui[document.documentElement.lang] ? document.documentElement.lang : 'ru';
  function render() {
    const lang = language(), copy = ui[lang], step = steps[index];
    $('[data-guide-label]').textContent = copy.label;
    $('[data-guide-progress]').textContent = `${copy.step} ${index + 1} / ${steps.length}`;
    $('[data-guide-title]').textContent = step[lang][0];
    $('[data-guide-description]').textContent = step[lang][1];
    $('[data-guide-previous]').textContent = copy.previous;
    $('[data-guide-previous]').disabled = index === 0;
    $('[data-guide-next]').textContent = index === steps.length - 1 ? copy.finish : copy.next;
    $('[data-guide-skip]').textContent = copy.skip;
    $('[data-guide-visit]').textContent = copy.visit;
    $('[data-guide-visit]').href = `#${step.target}`;
    $('[data-guide-close]').setAttribute('aria-label', copy.close);
    open.setAttribute('aria-label', copy.label);
    open.querySelector('span').textContent = copy.label;
  }
  function remember() { try { localStorage.setItem(key, 'seen'); } catch (_) {} }
  function launch() { if (dialog.open) return; opener = document.activeElement; index = 0; render(); dialog.showModal(); }
  function close() { remember(); dialog.close(); }
  open.hidden = false;
  open.addEventListener('click', launch);
  $('[data-guide-close]').addEventListener('click', close);
  $('[data-guide-skip]').addEventListener('click', close);
  $('[data-guide-previous]').addEventListener('click', () => { if (index > 0) { index--; render(); } });
  $('[data-guide-next]').addEventListener('click', () => { if (index < steps.length - 1) { index++; render(); } else close(); });
  $('[data-guide-visit]').addEventListener('click', () => { remember(); dialog.close(); });
  dialog.addEventListener('cancel', remember);
  dialog.addEventListener('close', () => { if (opener && typeof opener.focus === 'function') opener.focus({preventScroll:true}); });
  new MutationObserver(render).observe(document.documentElement, {attributes:true, attributeFilter:['lang']});
  render();
  let seen = false;
  try { seen = localStorage.getItem(key) === 'seen'; } catch (_) { seen = true; }
  if (!seen) launch();
})();
