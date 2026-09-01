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
    data.observeImages(root, { rootMargin: '180px 0px' });
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
    const items = await data.loadCollection('pins');
    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const placement = pinPlacement(index);
      const figure = document.createElement('figure');
      figure.className = 'aku-pin-item';
      figure.style.setProperty('--pin-x', placement.x);
      figure.style.setProperty('--pin-y', placement.y);
      figure.style.setProperty('--pin-r', placement.rotation);
      figure.style.setProperty('--pin-size', placement.size);
      const image = document.createElement('img');
      image.dataset.src = item.thumb;
      image.width = item.thumbWidth;
      image.height = item.thumbHeight;
      image.alt = item.title;
      const caption = document.createElement('figcaption');
      const number = document.createElement('span');
      const title = document.createElement('span');
      number.textContent = String(index + 1).padStart(3, '0');
      title.textContent = item.title;
      caption.append(number, title);
      figure.append(image, caption);
      fragment.append(figure);
    });

    root.replaceChildren(fragment);
    observeLazyImages(root);
  }

  const initializers = { world: initWorld, daily: initDaily, calendar: initCalendar, pins: initPins };
  initializers[view]?.().catch(error => {
    console.warn(`AKU ${view} could not be initialized.`, error);
    document.body.classList.add('aku-data-error');
  });
})();
