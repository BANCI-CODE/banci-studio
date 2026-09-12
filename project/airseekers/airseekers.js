(() => {
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold: .12, rootMargin: '0px 0px -7%'});
    reveals.forEach(item => revealObserver.observe(item));
  } else {
    reveals.forEach(item => item.classList.add('is-visible'));
  }

  const header = document.querySelector('.air-header');
  const toneSections = [...document.querySelectorAll('[data-header-tone]')];
  if (header && 'IntersectionObserver' in window) {
    const toneObserver = new IntersectionObserver(entries => {
      const active = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (active) header.dataset.tone = active.target.dataset.headerTone;
    }, {rootMargin: '-12% 0px -76% 0px', threshold: [0, .01, .2]});
    toneSections.forEach(section => toneObserver.observe(section));
  }

  const backTop = document.querySelector('.back-top');
  if (backTop) {
    const update = () => backTop.classList.toggle('is-visible', scrollY > innerHeight * .75);
    addEventListener('scroll', update, {passive: true});
    update();
    backTop.addEventListener('click', () => scrollTo({top: 0, behavior: 'smooth'}));
  }
})();
