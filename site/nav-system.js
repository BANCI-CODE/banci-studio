const navIcons = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M5.5 10v9h13v-9M9.5 19v-5h5v5"/></svg>',
  brand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 7 5-7 13L5 8l7-5Z"/><path d="m5 8 7 3 7-3M12 11v10"/></svg>',
  product: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></svg>',
  ai: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.2"/><circle cx="5" cy="7" r="1.5"/><circle cx="19" cy="7" r="1.5"/><circle cx="5" cy="17" r="1.5"/><circle cx="19" cy="17" r="1.5"/><path d="m10.2 10.7-4-2.8m7.6 2.8 4-2.8m-7.6 5.4-4 2.8m7.6-2.8 4 2.8"/></svg>',
  journal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h10a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z"/><path d="M8 20a3 3 0 0 1 3-3h7M9 8h5M9 11h5"/></svg>',
  lab: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v5l-5.5 9.2A2.5 2.5 0 0 0 6.7 21h10.6a2.5 2.5 0 0 0 2.2-3.8L14 8V3"/><path d="M7.2 15h9.6"/></svg>',
  notes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  contact: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v12H8l-4 3V5Z"/><path d="m5 7 7 5 7-5"/></svg>'
};

const navItems = [
  { number: '00', label: '首页', href: '/', icon: 'home', active: ({ path }) => path === '/' },
  { number: '01', label: '品牌设计', href: '/work/?category=brand', icon: 'brand', active: ({ path, category }) => category === 'brand' || /\/(forktech|shanbenqing|kamingo|fantawild)(?:\/|\.html)/.test(path) },
  { number: '02', label: '产品设计', href: '/work/?category=product', icon: 'product', active: ({ path, category }) => category === 'product' || /\/(airseekers|mova|interface)(?:\/|\.html)/.test(path) },
  { number: '03', label: 'AI工作流', href: '/work/?category=ai', icon: 'ai', active: ({ path, category }) => category === 'ai' || path.includes('/ai-workflow/') },
  { number: '04', label: 'AKU日记', href: '/projects/aku.html', icon: 'journal', active: ({ path }) => path.includes('/projects/aku') },
  { number: '05', label: '个人创作', href: '/lab/', icon: 'lab', active: ({ path }) => path.startsWith('/lab/') },
  { number: '06', label: '迟早更新', href: '/notes/', icon: 'notes', active: ({ path }) => path.startsWith('/notes/') },
  { number: '07', label: '多多联系', href: '/contact/', icon: 'contact', active: ({ path }) => path.startsWith('/contact/') }
];

const primaryNavItems = [
  {
    number: '01',
    label: 'WORK',
    href: '/work/',
    active: ({ path }) => path.startsWith('/work/') || path.startsWith('/project/') || (path.startsWith('/projects/') && !path.includes('/projects/aku'))
  },
  { number: '02', label: 'ABOUT', href: '/about/', active: ({ path }) => path.startsWith('/about/') },
  { number: '03', label: 'AKU JOURNAL', href: '/projects/aku.html', active: ({ path }) => path.includes('/projects/aku') },
  { number: '04', label: 'CONTACT', href: '/contact/', active: ({ path }) => path.startsWith('/contact/') }
];

const disciplineNavItems = [
  { label: 'BRAND DESIGN', href: '/work/?category=brand', category: 'brand' },
  { label: 'PRODUCT EXPERIENCE', href: '/work/?category=product', category: 'product' },
  { label: 'UI / INTERACTION', href: '/work/?category=ui', category: 'ui' },
  { label: 'AI WORKFLOW', href: '/work/?category=ai', category: 'ai' }
];

const navContext = {
  path: location.pathname.toLowerCase(),
  category: new URLSearchParams(location.search).get('category')
};

const navigationHeaders = [...document.querySelectorAll('.site-header, .aku-nav, .project-nav')];

navigationHeaders.forEach(header => {
  if (header.classList.contains('aku-nav')) {
    header.classList.add('site-header');
    const akuBrand = header.querySelector('.aku-brand');
    if (akuBrand) akuBrand.classList.add('logo');
  }
  if (header.classList.contains('project-nav')) {
    header.classList.add('site-header');
    const projectBrand = header.querySelector(':scope > a:first-child');
    if (projectBrand) {
      projectBrand.classList.add('logo');
      const projectLogo = projectBrand.querySelector('img');
      projectBrand.replaceChildren(projectLogo || document.createTextNode(''), Object.assign(document.createElement('b'), { textContent: 'BANCI' }));
    }
    [...header.children].forEach(child => {
      if (child !== projectBrand) child.remove();
    });
  }
  header.classList.add('nav-system-shell');
  const nav = header.querySelector('nav') || document.createElement('nav');
  nav.className = 'nav-system';
  nav.setAttribute('aria-label', '主导航');
  nav.innerHTML = navItems.map(item => {
    const current = item.active(navContext) ? ' aria-current="page"' : '';
    return `<a class="nav-system__item" href="${item.href}"${current}><span class="nav-system__label">${item.label}</span></a>`;
  }).join('');
  if (!nav.parentNode) {
    const utility = header.querySelector('.view-switch');
    utility ? header.insertBefore(nav, utility) : header.appendChild(nav);
  }

  const logo = header.querySelector('.logo');
  if (logo) {
    logo.setAttribute('href', '/');
    if (!logo.getAttribute('aria-label')) logo.setAttribute('aria-label', 'BANCI home');
  }
});

function renderPrimaryNavigation() {
  return primaryNavItems.map((item, index) => {
    const current = item.active(navContext);
    return `
      <a class="mobile-navigation__primary-item" href="${item.href}"${current ? ' aria-current="page"' : ''} style="--mobile-nav-index:${index}">
        <span class="mobile-navigation__number">${item.number}</span>
        <span class="mobile-navigation__title">${item.label}</span>
        ${current ? '<span class="mobile-navigation__active-dot" aria-hidden="true"></span>' : '<span aria-hidden="true"></span>'}
      </a>`;
  }).join('');
}

function renderDisciplines() {
  return disciplineNavItems.map((item, index) => {
    const current = navContext.path.startsWith('/work/') && navContext.category === item.category;
    return `
      <a class="mobile-navigation__discipline-item" href="${item.href}"${current ? ' aria-current="page"' : ''} style="--mobile-nav-index:${index + primaryNavItems.length}">
        <span>${item.label}</span><span aria-hidden="true">↗</span>
        ${current ? '<span class="mobile-navigation__active-dot" aria-hidden="true"></span>' : ''}
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
        <div class="mobile-navigation__primary">${renderPrimaryNavigation()}</div>
      </section>
      <section class="mobile-navigation__section mobile-navigation__section--disciplines" aria-labelledby="mobile-disciplines-title">
        <p class="mobile-navigation__eyebrow" id="mobile-disciplines-title">SELECTED DISCIPLINES</p>
        <div class="mobile-navigation__disciplines">${renderDisciplines()}</div>
      </section>
      <footer class="mobile-navigation__footer">
        <strong>BANCI / ZHANG SHIWEI</strong>
        <span>BRAND × PRODUCT × AI</span>
        <span>2026</span>
      </footer>
    </div>`;
  document.body.appendChild(overlay);

  const mobileQuery = window.matchMedia('(max-width: 860px)');
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let previousTone = null;
  let isOpen = false;

  function setHeaderForMenu(open) {
    navigationHeaders.forEach(item => {
      if (open) {
        if (item.hasAttribute('data-tone')) item.dataset.navPreviousTone = item.dataset.tone;
        item.dataset.tone = 'light';
      } else {
        const savedTone = item.dataset.navPreviousTone;
        if (savedTone) item.dataset.tone = savedTone;
        else if (previousTone === null) item.removeAttribute('data-tone');
        delete item.dataset.navPreviousTone;
      }
    });
  }

  function openMenu() {
    if (isOpen || !mobileQuery.matches) return;
    isOpen = true;
    previousTone = header.getAttribute('data-tone');
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.classList.add('nav-open');
    toggle.textContent = 'CLOSE';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close mobile navigation');
    setHeaderForMenu(true);
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
    setHeaderForMenu(false);
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

  const resetForDesktop = event => {
    if (!event.matches) closeMenu({ restoreFocus: false });
  };
  mobileQuery.addEventListener?.('change', resetForDesktop);
  window.addEventListener('pageshow', () => {
    if (!mobileQuery.matches) closeMenu({ restoreFocus: false });
  });
}

setupMobileNavigation();

document.querySelectorAll('.nav-system__item').forEach(item => {
  item.addEventListener('pointermove', event => {
    const rect = item.getBoundingClientRect();
    item.style.setProperty('--nav-light-x', `${event.clientX - rect.left}px`);
  });
  item.addEventListener('pointerleave', () => {
    item.style.setProperty('--nav-light-x', '50%');
  });
});
