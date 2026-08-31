const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
if (header && toneSections.length) {
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

const hero = document.querySelector('.hero');
const signalCursor = hero?.querySelector('.signal-cursor');
const probes = signalCursor ? [...signalCursor.querySelectorAll('.signal-probe')] : [];
const finePointer = matchMedia('(pointer: fine) and (min-width: 761px)').matches;
if (hero && signalCursor && probes.length && finePointer && !reduceMotion) {
  const target = { x: innerWidth * .5, y: innerHeight * .5 };
  const current = probes.map(() => ({ x: target.x, y: target.y }));
  const offsets = [[18, -120], [210, 32], [-158, 140], [-86, -42], [98, 178]];
  const speeds = [.24, .15, .11, .19, .09];
  const updateCodes = () => probes.forEach(probe => {
    const code = probe.querySelector('b');
    if (code) code.textContent = String(Math.floor(1000 + Math.random() * 8999));
  });
  let frame;
  const animate = () => {
    probes.forEach((probe, index) => {
      current[index].x += (target.x + offsets[index][0] - current[index].x) * speeds[index];
      current[index].y += (target.y + offsets[index][1] - current[index].y) * speeds[index];
      probe.style.setProperty('--probe-x', `${current[index].x}px`);
      probe.style.setProperty('--probe-y', `${current[index].y}px`);
    });
    frame = requestAnimationFrame(animate);
  };
  hero.addEventListener('pointerenter', event => {
    target.x = event.clientX;
    target.y = event.clientY;
    signalCursor.classList.add('is-active');
    updateCodes();
    if (!frame) animate();
  });
  hero.addEventListener('pointermove', event => {
    target.x = event.clientX;
    target.y = event.clientY;
  });
  hero.addEventListener('pointerleave', () => signalCursor.classList.remove('is-active'));
  setInterval(() => signalCursor.classList.contains('is-active') && updateCodes(), 1400);
}
