(() => {
  'use strict';

  const defaults = Object.freeze({ totalDays: 365, currentDay: 206 });
  const dataSource = window.AKUContent;

  const panel = document.querySelector('#aku-evolution-board');
  const stage = document.querySelector('#aku-board-stage');
  const matrix = document.querySelector('#aku-matrix');
  const preview = document.querySelector('#aku-preview');
  const previewImage = document.querySelector('#aku-preview-image');
  const previewPlaceholder = document.querySelector('#aku-preview-placeholder');
  const previewDay = document.querySelector('#aku-preview-day');
  const previewTitle = document.querySelector('#aku-preview-title');
  const previewMeta = document.querySelector('#aku-preview-meta');
  const previewLock = document.querySelector('#aku-preview-lock');
  const coarseOrMobile = window.matchMedia('(max-width: 760px), (hover: none)');

  if (!panel || !stage || !matrix || !preview) return;

  let itemsByDay = new Map();
  let settings = { totalDays: defaults.totalDays, currentDay: defaults.currentDay };
  let activeDay = settings.currentDay;
  let lockedDay = null;
  let imageRequest = 0;

  const padDay = day => String(day).padStart(3, '0');
  const fallbackItem = day => ({
    day,
    title: day <= settings.currentDay ? '作品整理中' : '尚未开始',
    week: Math.ceil(day / 7),
    thumb: '',
    detail: ''
  });
  const getItem = day => itemsByDay.get(day) || fallbackItem(day);
  const getDot = day => matrix.querySelector(`[data-day="${day}"]`);

  function buildMatrix() {
    const fragment = document.createDocumentFragment();

    for (let day = 1; day <= settings.totalDays; day += 1) {
      const item = getItem(day);
      const isCurrent = day === settings.currentDay;
      const isUpcoming = day > settings.currentDay;
      const button = document.createElement('button');
      const status = isUpcoming ? 'upcoming' : isCurrent ? 'current' : 'done';

      button.type = 'button';
      button.className = `aku-dot aku-dot--${status}`;
      button.dataset.day = String(day);
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', `Day ${day} — ${item.title}${isUpcoming ? '，未开始' : ''}`);

      if (isUpcoming) {
        button.disabled = true;
        button.tabIndex = -1;
      } else {
        button.tabIndex = isCurrent ? 0 : -1;
        button.setAttribute('aria-pressed', 'false');
      }

      if (isCurrent) button.setAttribute('aria-current', 'date');
      fragment.append(button);
    }

    matrix.replaceChildren(fragment);
  }

  function updateActiveState(day) {
    matrix.querySelector('.aku-dot.is-active')?.classList.remove('is-active');
    matrix.querySelector('.aku-dot[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
    const dot = getDot(day);
    if (!dot || dot.disabled) return;
    dot.classList.add('is-active');
    dot.setAttribute('aria-pressed', 'true');
  }

  function updatePreview(day) {
    const request = ++imageRequest;
    const item = getItem(day);
    const isCurrent = day === settings.currentDay;

    activeDay = day;
    updateActiveState(day);
    previewDay.textContent = `DAY ${padDay(day)}`;
    previewTitle.textContent = item.title;
    previewMeta.textContent = `WEEK ${item.week} / ${isCurrent ? 'CURRENT WORK' : 'DAILY WORK'}`;
    previewLock.textContent = lockedDay ? 'LOCKED' : isCurrent ? 'CURRENT' : 'PREVIEW';

    const previewSrc = item.thumb || '';
    if (previewSrc) {
      previewImage.alt = `Day ${day} ${item.title}`;
      if (previewImage.getAttribute('src') === previewSrc) {
        previewImage.hidden = false;
        previewPlaceholder.hidden = true;
        queueAdjacentPreload(day);
      } else {
        const preload = new Image();
        preload.decoding = 'async';
        preload.onload = () => {
          if (request !== imageRequest) return;
          previewImage.src = previewSrc;
          previewImage.hidden = false;
          previewPlaceholder.hidden = true;
          queueAdjacentPreload(day);
        };
        preload.onerror = () => {
          if (request !== imageRequest) return;
          previewImage.hidden = true;
          previewPlaceholder.hidden = false;
        };
        preload.src = previewSrc;
      }
    } else {
      previewImage.hidden = true;
      previewPlaceholder.hidden = false;
    }

    panel.querySelector('[data-step="-1"]').disabled = day <= 1;
    panel.querySelector('[data-step="1"]').disabled = day >= settings.currentDay;
  }

  function preloadAdjacent(day) {
    dataSource?.preloadAdjacent([...itemsByDay.values()], day, { key: 'day', field: 'thumb', radius: 1 });
  }

  function queueAdjacentPreload(day) {
    const schedule = window.requestIdleCallback || (callback => window.setTimeout(callback, 120));
    schedule(() => preloadAdjacent(day), { timeout: 800 });
  }

  function positionPreview(dot) {
    if (coarseOrMobile.matches || !dot) return;

    const stageRect = stage.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    const cardWidth = preview.offsetWidth;
    const cardHeight = preview.offsetHeight;
    const margin = 12;
    const dotX = dotRect.left - stageRect.left + dotRect.width / 2;
    const dotTop = dotRect.top - stageRect.top;
    const dotBottom = dotRect.bottom - stageRect.top;
    let x = dotX - cardWidth / 2;
    let y = dotTop - cardHeight - 14;

    x = Math.max(margin, Math.min(x, stageRect.width - cardWidth - margin));
    if (y < margin) y = dotBottom + 14;
    y = Math.max(margin, Math.min(y, stageRect.height - cardHeight - margin));

    preview.style.setProperty('--preview-x', `${Math.round(x)}px`);
    preview.style.setProperty('--preview-y', `${Math.round(y)}px`);
    preview.classList.add('is-visible');
  }

  function showDay(day, dot = getDot(day)) {
    if (day < 1 || day > settings.currentDay) return;
    updatePreview(day);
    positionPreview(dot);
  }

  function resetToCurrent() {
    lockedDay = null;
    showDay(settings.currentDay, getDot(settings.currentDay));
  }

  function setRovingFocus(day, focus = false) {
    matrix.querySelector('.aku-dot[tabindex="0"]')?.setAttribute('tabindex', '-1');
    const dot = getDot(day);
    if (!dot || dot.disabled) return;
    dot.tabIndex = 0;
    if (focus) dot.focus({ preventScroll: true });
  }

  matrix.addEventListener('pointerover', event => {
    if (coarseOrMobile.matches || lockedDay) return;
    const dot = event.target.closest('.aku-dot:not(:disabled)');
    if (dot) showDay(Number(dot.dataset.day), dot);
  });

  stage.addEventListener('pointerleave', () => {
    if (!coarseOrMobile.matches && !lockedDay) resetToCurrent();
  });

  matrix.addEventListener('click', event => {
    const dot = event.target.closest('.aku-dot:not(:disabled)');
    if (!dot) return;
    event.stopPropagation();
    const day = Number(dot.dataset.day);
    lockedDay = day;
    setRovingFocus(day);
    showDay(day, dot);
  });

  stage.addEventListener('click', event => {
    if (!event.target.closest('.aku-preview') && !event.target.closest('.aku-dot')) resetToCurrent();
  });

  panel.addEventListener('click', event => {
    const stepButton = event.target.closest('[data-step]');
    if (!stepButton || stepButton.disabled) return;
    const nextDay = Math.max(1, Math.min(settings.currentDay, activeDay + Number(stepButton.dataset.step)));
    lockedDay = coarseOrMobile.matches ? nextDay : lockedDay;
    setRovingFocus(nextDay);
    showDay(nextDay, getDot(nextDay));
  });

  matrix.addEventListener('keydown', event => {
    const dot = event.target.closest('.aku-dot:not(:disabled)');
    if (!dot) return;
    const columns = Number(getComputedStyle(document.documentElement).getPropertyValue('--aku-columns')) || 21;
    const movement = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
    if (!movement) return;
    event.preventDefault();
    const nextDay = Math.max(1, Math.min(settings.currentDay, Number(dot.dataset.day) + movement));
    setRovingFocus(nextDay, true);
    showDay(nextDay, getDot(nextDay));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') resetToCurrent();
  });

  coarseOrMobile.addEventListener?.('change', () => {
    showDay(lockedDay || activeDay || settings.currentDay, getDot(lockedDay || activeDay || settings.currentDay));
  });

  async function init() {
    try {
      if (!dataSource) throw new Error('AKU data layer unavailable');
      const [archiveConfig, dailyItems] = await Promise.all([
        dataSource.loadConfig(),
        dataSource.loadCollection('daily')
      ]);
      settings = {
        totalDays: Number(archiveConfig.totalDays) || defaults.totalDays,
        currentDay: Number(archiveConfig.currentDay) || defaults.currentDay
      };
      activeDay = settings.currentDay;
      itemsByDay = new Map((dailyItems || []).map(item => [Number(item.day), item]));
    } catch (error) {
      console.warn('AKU archive data unavailable; showing board with lightweight fallbacks.', error);
    }

    buildMatrix();
    requestAnimationFrame(() => showDay(settings.currentDay, getDot(settings.currentDay)));
  }

  init();
})();
