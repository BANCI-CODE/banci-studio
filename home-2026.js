const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealGroups = [
  ['.hero-meta', 'left'],
  ['.hero h1 .line', 'up'],
  ['.hero-statement', 'up'],
  ['.hero-role', 'right'],
  ['.scroll-cue', 'up'],
  ['.section-kicker', 'left'],
  ['.capability-heading h2', 'up'],
  ['.capability-heading p', 'right'],
  ['.capability-grid article', 'up'],
  ['.evidence-heading h2', 'up'],
  ['.evidence-heading p', 'right'],
  ['.evidence-grid article', 'up'],
  ['.selected-intro h2', 'up'],
  ['.selected-intro p', 'right'],
  ['.featured-card__meta', 'left'],
  ['.featured-card__media', 'scale'],
  ['.featured-card__body', 'right'],
  ['.process-heading h2', 'up'],
  ['.process-heading p', 'right'],
  ['.process-list li', 'up'],
  ['.glass-button', 'up'],
  ['.home-about h2', 'up'],
  ['.about-copy', 'right'],
  ['.contact-strip h2', 'up']
];

let revealIndex = 0;
revealGroups.forEach(([selector, direction]) => {
  document.querySelectorAll(selector).forEach(element => {
    element.classList.add('reveal-item');
    if (direction !== 'up') element.dataset.reveal = direction;
    element.style.setProperty('--reveal-delay', `${Math.min(revealIndex % 4, 3) * 70}ms`);
    revealIndex += 1;
  });
});

if (reduceMotion) {
  document.querySelectorAll('.reveal-item').forEach(element => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal-item').forEach(element => observer.observe(element));
}

document.querySelectorAll('.featured-card,.glass-button').forEach(element => {
  element.addEventListener('pointermove', event => {
    const bounds = element.getBoundingClientRect();
    element.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
    element.style.setProperty('--my', `${event.clientY - bounds.top}px`);
  });
});

const header = document.querySelector('.site-header');
const toneSections = document.querySelectorAll('[data-header-tone]');
if (header && toneSections.length) {
  const toneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      header.dataset.tone = entry.target.dataset.headerTone || 'light';
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
