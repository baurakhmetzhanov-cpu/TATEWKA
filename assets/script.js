// Татешка — сайт продукта.

// Контакты для блока «Обсудим пилот» и формы заявки.
// Пока поля пустые, контакты на странице не показываются, а форма
// подсказывает, что адрес не настроен.
const CONTACT = {
  email: '',     // например: 'sales@example.kz' — сюда придут заявки из формы
  phone: '',     // например: '+7 700 000 00 00'
  whatsapp: '',  // номер только цифрами, например: '77000000000'
};

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- header ----------
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

  // ---------- reveal on scroll ----------
  const revealTargets = $$('.section__head, .pain, .flow, .card, .role, .exchange__row, .feature, .calc, .timeline li, .target, .faq, .contact > *');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealTargets.forEach((el) => io.observe(el));
  }

  // ---------- calculator ----------
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

  // ---------- contacts ----------
  const list = $('#contact-list');
  const items = [];
  if (CONTACT.phone) items.push(`Телефон: <a href="tel:${CONTACT.phone.replace(/[^\d+]/g, '')}">${CONTACT.phone}</a>`);
  if (CONTACT.whatsapp) items.push(`WhatsApp: <a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener">написать</a>`);
  if (CONTACT.email) items.push(`Почта: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>`);
  list.innerHTML = items.map((t) => `<li>${t}</li>`).join('');
  list.hidden = items.length === 0;

  // ---------- lead form ----------
  const form = $('#lead-form');
  const note = $('#form-note');

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

    if (!CONTACT.email) {
      note.textContent = 'Приём заявок ещё не настроен.';
      note.classList.add('is-error');
      return;
    }

    const data = new FormData(form);
    const body = [
      `Имя: ${data.get('name')}`,
      `Компания: ${data.get('company')}`,
      `Телефон: ${data.get('phone')}`,
      `Кто: ${data.get('role')}`,
      `Точек: ${data.get('stores') || '—'}`,
      '',
      `${data.get('message') || ''}`,
    ].join('\n');
    const subject = `Заявка на пилот — ${data.get('company')}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Открываем почтовую программу…';
    note.classList.remove('is-error');
  });

  $$('[required]', form).forEach((el) => el.addEventListener('input', () => el.classList.remove('is-invalid')));

  // ---------- footer year ----------
  $('#year').textContent = new Date().getFullYear();
})();
