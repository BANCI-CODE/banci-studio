(() => {
  'use strict';

  const data = window.AKUContent;
  const view = document.body.dataset.akuView;
  if (!data || !view) return;

  const pad = value => String(value).padStart(2, '0');

  function observeLazyImages(root) {
    root.querySelectorAll('img[data-src]').forEach(image => {
      image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
    });
    return data.observeImages(root, { rootMargin: '180px 0px' });
  }

  async function initWorld() {
    const config = await data.loadConfig();
    const progress = document.querySelector('#aku-world-progress');
    if (progress) progress.textContent = `${config.currentDay} / ${config.totalDays}`;
  }

  async function initDaily() {
    const [config, items] = await Promise.all([data.loadConfig(), data.loadCollection('daily')]);
    const item = items.find(entry => Number(entry.day) === Number(config.currentDay));
    if (!item) throw new Error(`AKU Day ${config.currentDay} is unavailable`);

    const image = document.querySelector('#aku-daily-image');
    const loading = document.querySelector('#aku-daily-loading');
    image.alt = `Day ${item.day} ${item.title}`;
    image.addEventListener('load', () => { loading.hidden = true; }, { once: true });
    image.src = item.thumb;
    document.querySelector('#aku-daily-day').textContent = `DAY ${String(item.day).padStart(3, '0')} / ${config.totalDays}`;
    document.querySelector('#aku-daily-title').textContent = item.title;
    document.querySelector('#aku-daily-story').textContent = item.story || `今天，AKU 正在经历「${item.title}」。`;
    document.querySelector('#aku-daily-date').textContent = item.date || 'ONGOING';
    document.querySelector('#aku-daily-week').textContent = `WEEK ${item.week}`;
  }

  async function initCalendar() {
    const root = document.querySelector('#aku-calendar-grid');
    const items = await data.loadCollection('calendar');
    const fragment = document.createDocumentFragment();

    items.forEach(item => {
      const figure = document.createElement('figure');
      figure.className = 'aku-calendar-card';
      const media = document.createElement('div');
      media.className = 'aku-calendar-card__image';
      const image = document.createElement('img');
      image.dataset.src = item.thumb;
      image.width = item.thumbWidth;
      image.height = item.thumbHeight;
      image.alt = `${item.year} 年 ${item.month} 月 AKU 月历插画`;
      const caption = document.createElement('figcaption');
      caption.innerHTML = `<span>MONTH ${pad(item.month)}</span><span>${item.year}</span>`;
      media.append(image);
      figure.append(media, caption);
      fragment.append(figure);
    });

    root.replaceChildren(fragment);
    observeLazyImages(root);
  }

  function pinPlacement(index) {
    const column = index % 5;
    const row = Math.floor(index / 5);
    const x = 4 + column * 19 + ((row % 2) * 5);
    const y = 40 + row * 158 + ((column % 2) * 34);
    const rotation = ((index * 17) % 15) - 7;
    const size = 9 + ((index * 7) % 8);
    return { x: `${Math.min(x, 82)}%`, y: `${y}px`, rotation: `${rotation}deg`, size: `${size}vw` };
  }

  async function initPins() {
    const root = document.querySelector('#aku-pin-field');
    const featured = document.querySelector('#aku-pocket-featured');
    const sentinel = document.querySelector('#aku-pin-sentinel');
    const sheet = document.querySelector('#aku-pin-sheet');
    const items = await data.loadCollection('pins');
    const mobileQuery = window.matchMedia('(max-width: 860px)');
    const initialCount = 16;
    const batchSize = 12;
    let renderedCount = 0;
    let batchObserver;
    let lastTrigger;

    function archiveNumber(index) {
      return String(index + 1).padStart(3, '0');
    }

    function createPin(item, index, desktop = false) {
      const placement = pinPlacement(index);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'aku-pin-item';
      button.dataset.pinIndex = index;
      button.setAttribute('aria-label', `查看 PIN ${archiveNumber(index)}：${item.title}`);
      if (desktop) {
        button.style.setProperty('--pin-x', placement.x);
        button.style.setProperty('--pin-y', placement.y);
        button.style.setProperty('--pin-r', placement.rotation);
        button.style.setProperty('--pin-size', placement.size);
      }
      const image = document.createElement('img');
      image.dataset.src = item.thumb;
      image.width = item.thumbWidth;
      image.height = item.thumbHeight;
      image.alt = item.title;
      image.loading = 'lazy';
      image.decoding = 'async';
      const caption = document.createElement('span');
      caption.className = 'aku-pin-caption';
      const number = document.createElement('span');
      const title = document.createElement('span');
      number.textContent = archiveNumber(index);
      title.textContent = item.title;
      caption.append(number, title);
      button.append(image, caption);
      return button;
    }

    function openSheet(item, index, trigger) {
      if (!mobileQuery.matches || !sheet) return;
      lastTrigger = trigger;
      const image = sheet.querySelector('#aku-pin-sheet-image');
      image.src = item.detail || item.thumb;
      image.alt = item.title;
      sheet.querySelector('#aku-pin-sheet-day').textContent = item.day
        ? `DAY ${String(item.day).padStart(3, '0')}`
        : `DAY — / ARCHIVE ${archiveNumber(index)}`;
      sheet.querySelector('#aku-pin-sheet-title').textContent = item.title;
      sheet.querySelector('#aku-pin-sheet-description').textContent = item.description || `AKU WORLD OBJECT ARCHIVE · PIN ${archiveNumber(index)}`;
      sheet.hidden = false;
      document.body.classList.add('pin-sheet-open');
      sheet.querySelector('.aku-pin-sheet__close')?.focus({ preventScroll: true });
    }

    function closeSheet() {
      if (!sheet || sheet.hidden) return;
      sheet.hidden = true;
      document.body.classList.remove('pin-sheet-open');
      const image = sheet.querySelector('#aku-pin-sheet-image');
      image.removeAttribute('src');
      lastTrigger?.focus({ preventScroll: true });
    }

    function renderFeatured() {
      if (!featured || !items.length) return;
      const item = items[0];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'aku-pocket-featured__button';
      button.setAttribute('aria-label', `查看精选 PIN：${item.title}`);
      const media = document.createElement('span');
      media.className = 'aku-pocket-featured__media';
      const image = document.createElement('img');
      image.src = item.thumb;
      image.width = item.thumbWidth;
      image.height = item.thumbHeight;
      image.alt = item.title;
      image.decoding = 'async';
      const copy = document.createElement('span');
      copy.className = 'aku-pocket-featured__copy';
      const label = document.createElement('span');
      label.textContent = 'FEATURED PIN / 001';
      const title = document.createElement('strong');
      title.textContent = item.title;
      copy.append(label, title);
      button.append(media, copy);
      media.append(image);
      button.addEventListener('click', () => openSheet(item, 0, button));
      featured.replaceChildren(button);
    }

    function appendMobileBatch(limit = batchSize) {
      const end = Math.min(renderedCount + limit, items.length);
      const fragment = document.createDocumentFragment();
      for (let index = renderedCount; index < end; index += 1) {
        fragment.append(createPin(items[index], index));
      }
      root.append(fragment);
      renderedCount = end;
      observeLazyImages(root);
      if (renderedCount >= items.length && batchObserver) batchObserver.disconnect();
    }

    function renderDesktop() {
      batchObserver?.disconnect();
      root.replaceChildren();
      const fragment = document.createDocumentFragment();
      items.forEach((item, index) => fragment.append(createPin(item, index, true)));
      root.append(fragment);
      observeLazyImages(root);
      if (featured) featured.replaceChildren();
      if (sentinel) sentinel.hidden = true;
    }

    function renderMobile() {
      root.replaceChildren();
      renderedCount = 0;
      renderFeatured();
      appendMobileBatch(initialCount);
      if (!sentinel) return;
      sentinel.hidden = false;
      batchObserver?.disconnect();
      batchObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) appendMobileBatch();
      }, { rootMargin: '360px 0px' });
      batchObserver.observe(sentinel);
    }

    root.addEventListener('click', event => {
      const button = event.target.closest('.aku-pin-item');
      if (!button || !mobileQuery.matches) return;
      const index = Number(button.dataset.pinIndex);
      openSheet(items[index], index, button);
    });

    sheet?.querySelectorAll('[data-sheet-close]').forEach(button => button.addEventListener('click', closeSheet));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeSheet();
    });

    const renderForViewport = () => {
      closeSheet();
      if (mobileQuery.matches) renderMobile();
      else renderDesktop();
    };

    renderForViewport();
    mobileQuery.addEventListener('change', renderForViewport);
  }

  const initializers = { world: initWorld, daily: initDaily, calendar: initCalendar, pins: initPins };
  initializers[view]?.().catch(error => {
    console.warn(`AKU ${view} could not be initialized.`, error);
    document.body.classList.add('aku-data-error');
  });
})();
