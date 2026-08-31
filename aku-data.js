(() => {
  'use strict';

  const CONFIG_URL = '/content/aku/aku-config.json';
  const manifestCache = new Map();
  const prefetchedImages = new Set();
  let configPromise = null;

  async function fetchJSON(url) {
    if (!manifestCache.has(url)) {
      manifestCache.set(url, fetch(url).then(response => {
        if (!response.ok) throw new Error(`AKU data request failed: ${response.status} ${url}`);
        return response.json();
      }));
    }
    return manifestCache.get(url);
  }

  function loadConfig() {
    if (!configPromise) configPromise = fetchJSON(CONFIG_URL);
    return configPromise;
  }

  async function loadCollection(name) {
    const config = await loadConfig();
    const url = config.manifests?.[name];
    if (!url) throw new Error(`Unknown AKU collection: ${name}`);
    return fetchJSON(url);
  }

  function preloadAdjacent(items, currentValue, options = {}) {
    const key = options.key || 'day';
    const field = options.field || 'thumb';
    const radius = Number(options.radius) || 1;
    const index = items.findIndex(item => Number(item[key]) === Number(currentValue));
    if (index < 0) return;

    for (let offset = -radius; offset <= radius; offset += 1) {
      if (offset === 0) continue;
      const src = items[index + offset]?.[field];
      if (!src || prefetchedImages.has(src)) continue;
      prefetchedImages.add(src);
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
    }
  }

  function observeImages(root = document, options = {}) {
    const selector = options.selector || 'img[data-src]';
    const images = [...root.querySelectorAll(selector)];
    const load = image => {
      const src = image.dataset.src;
      if (!src) return;
      image.loading = 'lazy';
      image.src = src;
      image.removeAttribute('data-src');
    };

    if (!('IntersectionObserver' in window)) {
      images.forEach(load);
      return { disconnect() {} };
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: options.rootMargin || '240px 0px' });

    images.forEach(image => observer.observe(image));
    return observer;
  }

  window.AKUContent = Object.freeze({
    loadConfig,
    loadCollection,
    observeImages,
    preloadAdjacent
  });
})();
