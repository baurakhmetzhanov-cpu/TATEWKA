// Татешка — сайт продукта.

// Контакты для блока «Обсудим пилот» и формы заявки.
// Форма отправляет заявку в WhatsApp, если он указан, иначе — письмом на email.
// Пустые поля на странице не показываются.
const CONTACT = {
  email: '',                  // например: 'sales@example.kz'
  phone: '+7 747 333 05 33',
  whatsapp: '77473330533',    // номер только цифрами
};

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- меню ----------
  const toggle = $('.nav-toggle');
  const nav = $('#nav');
  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
  };
  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('#nav a').forEach((a) => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });

  // ---------- путь заказа на первом экране ----------
  // Без JS и при «уменьшить движение» накладная сразу показана целиком.
  const slip = $('#slip');
  const steps = $$('#track li');
  const replay = $('#replay');
  let timers = [];

  const playTrack = () => {
    timers.forEach(clearTimeout);
    timers = [];
    replay.hidden = true;
    slip.classList.remove('is-playing');
    steps.forEach((li, i) => li.classList.toggle('is-done', i === 0));
    slip.classList.add('is-waiting');
    void slip.offsetWidth; // перезапуск CSS-анимации
    slip.classList.add('is-playing');

    steps.slice(1).forEach((li, i) => {
      timers.push(setTimeout(() => li.classList.add('is-done'), 700 * (i + 1) + 300));
    });
    const end = 700 * steps.length + 300;
    timers.push(setTimeout(() => slip.classList.remove('is-waiting'), end));
    timers.push(setTimeout(() => { replay.hidden = false; }, end + 600));
  };

  if (!reducedMotion) {
    playTrack();
    replay.addEventListener('click', playTrack);
  }

  // ---------- вкладки «Кому полезно» ----------
  const tabs = $$('.tab');
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab, false));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // ---------- калькулятор ----------
  const fmtInt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const fmt1 = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const money = (v) => {
    if (v >= 1e9) return fmt1.format(v / 1e9) + ' млрд ₸';
    if (v >= 1e6) return fmt1.format(v / 1e6) + ' млн ₸';
    return fmtInt.format(Math.round(v / 1000)) + ' тыс. ₸';
  };

  const inputs = {
    stores: $('#c-stores'),
    share: $('#c-share'),
    per: $('#c-per'),
    cost: $('#c-cost'),
  };

  const paintTrack = (el) => {
    const p = ((el.value - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty('--p', p + '%');
  };

  const calc = () => {
    const stores = +inputs.stores.value;
    const share = +inputs.share.value;
    const per = +inputs.per.value;
    const cost = +inputs.cost.value;

    const selfStores = Math.round(stores * share / 100);
    const reps = selfStores / per;
    const month = reps * cost;

    $('#o-stores').textContent = fmtInt.format(stores);
    $('#o-share').textContent = share + '%';
    $('#o-per').textContent = fmtInt.format(per);
    $('#o-cost').textContent = fmtInt.format(cost);

    $('#r-stores').textContent = fmtInt.format(selfStores);
    $('#r-reps').textContent = fmt1.format(reps);
    $('#r-month').textContent = money(month);
    $('#r-year').textContent = money(month * 12);

    Object.values(inputs).forEach(paintTrack);
  };

  Object.values(inputs).forEach((el) => el.addEventListener('input', calc));
  calc();

  // ---------- контакты ----------
  const list = $('#contact-list');
  const items = [];
  if (CONTACT.phone) items.push(`Телефон: <a href="tel:${CONTACT.phone.replace(/[^\d+]/g, '')}">${CONTACT.phone}</a>`);
  if (CONTACT.whatsapp) items.push(`WhatsApp: <a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener">написать</a>`);
  if (CONTACT.email) items.push(`Почта: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>`);
  list.innerHTML = items.map((t) => `<li>${t}</li>`).join('');
  list.hidden = items.length === 0;

  // ---------- форма заявки ----------
  const form = $('#lead-form');
  const note = $('#form-note');
  const submit = $('.form__submit', form);
  const channel = CONTACT.whatsapp ? 'whatsapp' : CONTACT.email ? 'email' : null;

  if (channel === 'whatsapp') {
    submit.textContent = 'Отправить заявку в WhatsApp';
    note.textContent = 'Откроется WhatsApp с готовым сообщением — останется нажать «Отправить».';
  } else if (channel === 'email') {
    note.textContent = 'Нажимая кнопку, вы откроете почтовую программу с готовым письмом.';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = $$('[required]', form);
    let ok = true;
    required.forEach((el) => {
      const bad = !el.value.trim();
      el.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!ok) {
      note.textContent = 'Заполните имя, компанию и телефон.';
      note.classList.add('is-error');
      required.find((el) => !el.value.trim()).focus();
      return;
    }

    if (!channel) {
      note.textContent = 'Приём заявок ещё не настроен.';
      note.classList.add('is-error');
      return;
    }

    const data = new FormData(form);
    const subject = `Заявка на пилот — ${data.get('company')}`;
    const body = [
      `Имя: ${data.get('name')}`,
      `Компания: ${data.get('company')}`,
      `Телефон: ${data.get('phone')}`,
      `Кто: ${data.get('role')}`,
      `Точек: ${data.get('stores') || '—'}`,
      data.get('message') ? `\n${data.get('message')}` : '',
    ].join('\n').trim();

    note.classList.remove('is-error');
    if (channel === 'whatsapp') {
      const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(subject + '\n\n' + body)}`;
      const win = window.open(url, '_blank');
      if (win) win.opener = null;
      else window.location.href = url;
      note.textContent = 'Открываем WhatsApp…';
    } else {
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      note.textContent = 'Открываем почтовую программу…';
    }
  });

  $$('[required]', form).forEach((el) => el.addEventListener('input', () => el.classList.remove('is-invalid')));

  // ---------- год в подвале ----------
  $('#year').textContent = new Date().getFullYear();
})();
