const primaryNavItems = Object.freeze([
  {
    label: 'WORK',
    href: '/work/',
    active: ({ path }) =>
      path.startsWith('/work/') ||
      path.startsWith('/project/') ||
      (path.startsWith('/projects/') && !path.includes('/projects/aku'))
  },
  { label: 'ABOUT', href: '/about/', active: ({ path }) => path.startsWith('/about/') },
  {
    label: 'JOURNAL',
    href: '/projects/aku.html',
    active: ({ path }) =>
      path.includes('/projects/aku') ||
      path.startsWith('/aku-archive/') ||
      path.startsWith('/aku-experience/') ||
      path.startsWith('/aku-gallery/') ||
      path.startsWith('/aku-spiral/')
  },
  { label: 'CONTACT', href: '/contact/', active: ({ path }) => path.startsWith('/contact/') }
]);

const disciplineNavItems = Object.freeze([
  { label: 'BRAND DESIGN', href: '/work/?category=brand', category: 'brand' },
  { label: 'PRODUCT EXPERIENCE', href: '/work/?category=product', category: 'product' },
  { label: 'UI / INTERACTION', href: '/work/?category=ui', category: 'ui' },
  { label: 'AI WORKFLOW', href: '/work/?category=ai', category: 'ai' }
]);

const navContext = {
  path: location.pathname.toLowerCase(),
  category: new URLSearchParams(location.search).get('category')
};

const navigationHeaders = [...document.querySelectorAll('.site-header, .aku-nav, .project-nav')];

function createLogo() {
  const logo = document.createElement('a');
  logo.className = 'logo';
  logo.innerHTML = '<img src="/banci.svg" alt=""><b>BANCI</b>';
  return logo;
}

function normalizeLogo(header) {
  let logo = header.querySelector(':scope > .logo, :scope > .aku-brand, :scope > a:first-child');
  if (!logo) {
    logo = createLogo();
    header.prepend(logo);
  }

  logo.classList.add('logo');
  logo.setAttribute('href', '/');
  logo.setAttribute('aria-label', 'BANCI home');

  let image = logo.querySelector('img');
  if (!image) {
    image = document.createElement('img');
    image.src = '/banci.svg';
  }
  image.alt = '';

  let wordmark = logo.querySelector('b');
  if (!wordmark) wordmark = document.createElement('b');
  wordmark.textContent = 'BANCI';
  logo.replaceChildren(image, wordmark);
  return logo;
}

function renderPrimaryLink(item, className = 'nav-system__item') {
  const current = item.active(navContext);
  return `<a class="${className}" data-primary-nav href="${item.href}"${current ? ' aria-current="page"' : ''}><span>${item.label}</span></a>`;
}

function normalizeHeader(header) {
  if (header.classList.contains('aku-nav')) header.classList.add('site-header');
  if (header.classList.contains('project-nav')) header.classList.add('site-header');
  header.classList.add('nav-system-shell');

  const logo = normalizeLogo(header);
  const existingNav = header.querySelector(':scope > nav');
  const nav = existingNav || document.createElement('nav');
  nav.className = 'nav-system';
  nav.setAttribute('aria-label', 'Primary navigation');
  nav.innerHTML = primaryNavItems.map(item => renderPrimaryLink(item)).join('');
  header.insertBefore(nav, logo.nextSibling);

  header.querySelectorAll(':scope > .phase').forEach(element => element.remove());

  if (header.classList.contains('aku-nav')) {
    const viewSwitch = header.querySelector(':scope > .view-switch');
    if (viewSwitch) {
      viewSwitch.classList.add('aku-view-switch');
      header.after(viewSwitch);
    }
  }
}

navigationHeaders.forEach(normalizeHeader);

function renderMobilePrimaryNavigation() {
  return primaryNavItems.map((item, index) => {
    const current = item.active(navContext);
    return `
      <a class="mobile-navigation__primary-item" data-primary-nav href="${item.href}"${current ? ' aria-current="page"' : ''} style="--mobile-nav-index:${index}">
        <span class="mobile-navigation__title">${item.label}</span>
      </a>`;
  }).join('');
}

function renderDisciplines() {
  return disciplineNavItems.map((item, index) => {
    const current = navContext.path.startsWith('/work/') && navContext.category === item.category;
    return `
      <a class="mobile-navigation__discipline-item" href="${item.href}"${current ? ' aria-current="page"' : ''} style="--mobile-nav-index:${index + primaryNavItems.length}">
        <span>${item.label}</span><span aria-hidden="true">↗</span>
      </a>`;
  }).join('');
}

function setupMobileNavigation() {
  const header = navigationHeaders[0];
  if (!header || document.getElementById('mobile-navigation')) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'mobile-nav-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mobile-navigation');
  toggle.setAttribute('aria-label', 'Open mobile navigation');
  toggle.textContent = 'MENU';
  header.appendChild(toggle);

  const overlay = document.createElement('nav');
  overlay.id = 'mobile-navigation';
  overlay.className = 'mobile-navigation';
  overlay.setAttribute('aria-label', 'Mobile navigation');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.inert = true;
  overlay.innerHTML = `
    <div class="mobile-navigation__inner">
      <section class="mobile-navigation__section" aria-labelledby="mobile-primary-title">
        <p class="mobile-navigation__eyebrow" id="mobile-primary-title">PRIMARY NAVIGATION</p>
        <div class="mobile-navigation__primary">${renderMobilePrimaryNavigation()}</div>
      </section>
      <section class="mobile-navigation__section mobile-navigation__section--disciplines" aria-labelledby="mobile-disciplines-title">
        <p class="mobile-navigation__eyebrow" id="mobile-disciplines-title">SELECTED DISCIPLINES</p>
        <div class="mobile-navigation__disciplines">${renderDisciplines()}</div>
      </section>
      <footer class="mobile-navigation__footer">
        <strong>BANCI / ZHANG SHIWEI</strong>
        <span>BRAND × PRODUCT × AI</span>
      </footer>
    </div>`;
  document.body.appendChild(overlay);

  const mobileQuery = window.matchMedia('(max-width: 860px)');
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let isOpen = false;

  function openMenu() {
    if (isOpen || !mobileQuery.matches) return;
    isOpen = true;
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.classList.add('nav-open');
    toggle.textContent = 'CLOSE';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close mobile navigation');
    requestAnimationFrame(() => overlay.querySelector('a[href]')?.focus());
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (!isOpen) {
      document.body.classList.remove('nav-open');
      return;
    }
    isOpen = false;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    document.body.classList.remove('nav-open');
    toggle.textContent = 'MENU';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open mobile navigation');
    if (restoreFocus && document.contains(toggle)) toggle.focus();
  }

  toggle.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  overlay.addEventListener('click', event => {
    if (event.target.closest('a[href]')) closeMenu({ restoreFocus: false });
  });

  document.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [toggle, ...overlay.querySelectorAll(focusableSelector)].filter(element => !element.inert);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  mobileQuery.addEventListener?.('change', event => {
    if (!event.matches) closeMenu({ restoreFocus: false });
  });
  window.addEventListener('pageshow', () => {
    if (!mobileQuery.matches) closeMenu({ restoreFocus: false });
  });
}

function syncScrolledState() {
  navigationHeaders.forEach(header => header.classList.toggle('is-scrolled', window.scrollY > 32));
}

setupMobileNavigation();
syncScrolledState();
window.addEventListener('scroll', syncScrolledState, { passive: true });
window.BanciNavigation = { primaryNavItems, disciplineNavItems };
