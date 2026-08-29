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
  { number: '01', label: '品牌设计', href: '/work/?category=brand', icon: 'brand', active: ({ path, category }) => category === 'brand' || /\/(forktech|shanbenqing|kamingo|fantawild)\//.test(path) },
  { number: '02', label: '产品设计', href: '/work/?category=product', icon: 'product', active: ({ path, category }) => category === 'product' || /\/(airseekers|mova)\//.test(path) },
  { number: '03', label: 'AI工作流', href: '/work/?category=ai', icon: 'ai', active: ({ path, category }) => category === 'ai' || path.includes('/ai-workflow/') },
  { number: '04', label: 'AKU日记', href: '/projects/aku.html', icon: 'journal', active: ({ path }) => path.includes('/projects/aku') },
  { number: '05', label: '个人创作', href: '/lab/', icon: 'lab', active: ({ path }) => path.startsWith('/lab/') },
  { number: '06', label: '迟早更新', href: '/notes/', icon: 'notes', active: ({ path }) => path.startsWith('/notes/') },
  { number: '07', label: '多多联系', href: '/contact/', icon: 'contact', active: ({ path }) => path.startsWith('/contact/') }
];

const navContext = {
  path: location.pathname.toLowerCase(),
  category: new URLSearchParams(location.search).get('category')
};

document.querySelectorAll('.site-header, .aku-nav').forEach(header => {
  if (header.classList.contains('aku-nav')) {
    header.classList.add('site-header');
    const akuBrand = header.querySelector('.aku-brand');
    if (akuBrand) akuBrand.classList.add('logo');
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
});

document.querySelectorAll('.nav-system__item').forEach(item => {
  item.addEventListener('pointermove', event => {
    const rect = item.getBoundingClientRect();
    item.style.setProperty('--nav-light-x', `${event.clientX - rect.left}px`);
  });
  item.addEventListener('pointerleave', () => {
    item.style.setProperty('--nav-light-x', '50%');
  });
});
