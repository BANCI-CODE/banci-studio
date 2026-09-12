const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
const revealObserver = reduceMotion ? null : new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

let revealIndex = 0;
const prepareReveal = (element, direction = 'up') => {
  if (!element || element.classList.contains('reveal-item')) return;
  element.classList.add('reveal-item');
  if (direction !== 'up') element.dataset.reveal = direction;
  element.style.setProperty('--reveal-delay', `${Math.min(revealIndex % 4, 3) * 70}ms`);
  revealIndex += 1;
  if (reduceMotion) element.classList.add('is-visible');
  else revealObserver.observe(element);
};

document.querySelectorAll('.hero-label,.hero h1,.hero-bottom,.practice-heading > *,.practice-grid article,.selected-head,.proof-strip article,.home-about > *,.personal-practice__header > *,.practice-item__media,.practice-item__content > *,.contact-strip > *').forEach(element => prepareReveal(element));

const evidence = document.querySelector('#homepage-evidence');
if (evidence) {
  const prepareEvidence = () => evidence.querySelectorAll('.feature-proof').forEach(element => prepareReveal(element));
  prepareEvidence();
  new MutationObserver(prepareEvidence).observe(evidence, { childList: true });
}

const featured = document.querySelector('#featured');
if (featured) {
  const prepareFeatured = () => featured.querySelectorAll('.featured-case').forEach(element => prepareReveal(element));
  prepareFeatured();
  new MutationObserver(prepareFeatured).observe(featured, { childList: true });
}

const header = document.querySelector('.site-header');
const toneSections = document.querySelectorAll('[data-header-tone]');
if (header && toneSections.length && 'IntersectionObserver' in window) {
  const toneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) header.dataset.tone = entry.target.dataset.headerTone || 'light';
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
  toneSections.forEach(section => toneObserver.observe(section));
}

const backTop = document.querySelector('.back-top');
if (backTop) {
  const updateBackTop = () => backTop.classList.toggle('is-visible', scrollY > innerHeight * 0.7);
  addEventListener('scroll', updateBackTop, { passive: true });
  updateBackTop();
  backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
}
