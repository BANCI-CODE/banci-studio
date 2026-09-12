(() => {
  const pending = new WeakSet();
  const reveal = image => {
    if (!image?.dataset.src) return;
    image.src = image.dataset.src;
    delete image.dataset.src;
    image.addEventListener('load', () => image.classList.add('is-image-loaded'), { once: true });
  };
  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      reveal(entry.target);
    }), { rootMargin: '240px 0px' })
    : null;
  const watch = root => root.querySelectorAll?.('img[data-src]').forEach(image => {
    if (pending.has(image)) return;
    pending.add(image);
    if (observer) observer.observe(image); else reveal(image);
  });
  watch(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType !== 1) return;
    if (node.matches?.('img[data-src]')) observer ? observer.observe(node) : reveal(node);
    watch(node);
  }))).observe(document.documentElement, { childList: true, subtree: true });
})();
