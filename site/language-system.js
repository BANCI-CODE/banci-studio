(() => {
  const STORAGE_KEY = 'banci-language';
  const validLanguage = value => value === 'en' ? 'en' : 'zh';
  let language = validLanguage(localStorage.getItem(STORAGE_KEY) || document.documentElement.lang?.slice(0, 2));

  const navCopy = {
    '/': ['首页', 'Home'],
    'brand': ['品牌设计', 'Brand'],
    'product': ['产品设计', 'Product'],
    'ai': ['AI工作流', 'AI Workflow'],
    '/projects/aku.html': ['AKU日记', 'AKU Journal'],
    '/lab/': ['个人创作', 'Creative Lab'],
    '/notes/': ['迟早更新', 'Daily Notes'],
    '/contact/': ['多多联系', 'Contact']
  };

  const pageCopy = {
    home: [
      ['.hero-meta span:nth-child(2)', '深圳 · 中国', 'SHENZHEN · CHINA'],
      ['.hero-meta span:nth-child(3)', '品牌设计 · 产品体验 · AI 创意', 'BRAND DESIGN · PRODUCT EXPERIENCE · AI CREATIVE'],
      ['.hero-statement p', '连接品牌、产品与人，创造清晰而有意义的体验。', 'Designing meaningful connections between brands, products and people.'],
      ['.section-kicker:nth-of-type(1) span:last-child', '精选项目 / 2023—2026', 'SELECTED PROJECTS / 2023—2026'],
      ['.selected-intro h2', '让策略成为<br><em>可见的体验。</em>', 'Make strategy<br><em>visible.</em>', true],
      ['.selected-intro p', '<small>策略成为可见的体验</small>从品牌识别到智能硬件体验，用清晰的设计系统连接商业、技术与用户。', '<small>STRATEGY BECOMES VISIBLE EXPERIENCE</small>From brand identity to intelligent hardware, clear design systems connect business, technology and people.', true],
      ['.selected > .glass-button', '查看全部项目 <span>→</span>', 'VIEW ALL PROJECTS <span>→</span>', true],
      ['.home-about .section-kicker span:last-child', '关于我 / 系统思考', 'ABOUT / SYSTEM THINKING'],
      ['.home-about h2', '<span>从视觉表达，</span><span>到产品体验。</span>', '<span>From visual expression</span><span>to product experience.</span>', true],
      ['.home-about .about-copy p', '<small>从视觉执行到产品定义</small>我的设计经历从内容视觉开始，逐渐扩展到品牌体系、产品体验与智能硬件。我擅长把复杂的信息、技术与商业目标，转化为用户能够理解的体验。', '<small>FROM VISUAL EXECUTION TO PRODUCT DEFINITION</small>My practice grew from content and visual design into brand systems, product experience and intelligent hardware. I turn complex information, technology and business goals into experiences people can understand.', true],
      ['.home-about .glass-button', '了解张仕伟 <span>→</span>', 'ABOUT ZHANG SHIWEI <span>→</span>', true],
      ['.contact-strip .section-kicker span:last-child', '多多联系 / 一起合作', "CONTACT / LET'S COLLABORATE"],
      ['.contact-strip h2', '一起创造<br>下一步。', 'Let’s create<br>what comes next.', true],
      ['.contact-strip .glass-button', '开始交流 <span>→</span>', 'START A CONVERSATION <span>→</span>', true]
    ],
    work: [
      ['.work-intro .eyebrow', '精选实践 / 2015—2026', 'SELECTED PRACTICE / 2015—2026'],
      ['.work-intro h1', '一种实践。<br><em>多种能力。</em>', 'One practice.<br><em>Multiple disciplines.</em>', true],
      ['.work-intro-foot p:first-child', '从品牌识别到产品体验，再到 AI 时代的创造流程。这里按照能力与问题类型组织项目，而不是按照公司履历排列。', 'From brand identity and product experience to AI-era creative workflows. Projects are organized by capability and problem type—not by employment history.'],
      ['.discipline-index .section-kicker span:last-child', '选择一个方向进入', 'CHOOSE A DISCIPLINE'],
      ['#projects-title', '精选<br>作品', 'Selected<br>Works', true],
      ['.project-index-head > p', '移动鼠标浏览项目，点击进入完整案例。项目页以设计决策、过程与结果为核心，而不是简单图片陈列。', 'Move through the index and open a complete case study. Each project focuses on decisions, process and impact rather than a simple image gallery.']
    ],
    about: [
      ['.about-intro h1', '连接<br><em>系统、</em><br>产品<br>与人。', 'Connecting<br><em>systems,</em><br>products<br>&amp; people.', true],
      ['.about-intro-copy p', '我从视觉表达出发，逐渐进入品牌体系、产品定义和智能体验。我的工作不是增加设计，而是减少噪音、识别价值，让复杂的技术与商业目标转化为人能够理解的体验。', 'I began with visual communication and gradually moved into brand systems, product definition and intelligent experiences. My work reduces noise, identifies value and translates complex technology and business goals into experiences people can understand.'],
      ['.about-statement p', '一个从视觉出发，逐渐成长为能够连接 <strong>品牌、产品、AI 与商业</strong> 的设计师。', 'A designer who grew from visual craft into a practice connecting <strong>brand, product, AI and business</strong>.', true],
      ['.philosophy h2', '减少噪音。<br><em>突出价值。</em>', 'Reduce noise.<br><em>Highlight value.</em>', true],
      ['.career h2', '在真实系统中<br>持续成长。', 'Learning through<br>real systems.', true],
      ['.capability h2', '彼此连接的<br>能力体系。', 'A connected<br>skill set.', true],
      ['.about-next h2', '设计正在发生的<br>下一步。', 'Designing what<br>comes next.', true],
      ['.about-next > p', '未来希望在 AI 硬件和智能产品方向，承担连接产品、技术、品牌与设计团队的角色。', 'I am looking to shape AI hardware and intelligent products by connecting product, technology, brand and design teams.'],
      ['.about-next a:first-of-type', '查看精选作品 →', 'VIEW SELECTED WORK →'],
      ['.about-next a:last-of-type', '联系我 →', 'CONTACT ME →']
    ],
    lab: [
      ['.lab-hero > span', '独立研究 / 持续进行', 'INDEPENDENT RESEARCH / ONGOING'],
      ['.lab-hero h1', '想法需要<br><em>自由生长。</em>', 'Ideas need<br><em>room to play.</em>', true],
      ['.lab-hero p', '字体、图像、IP、城市观察与日常符号实验。这里收集没有客户边界，却持续影响商业设计判断的个人研究。', 'Typography, image, IP, urban observation and experiments with everyday symbols—independent research without client boundaries that continues to shape my commercial design judgment.'],
      ['.lab-index span:last-child', '悬停预览 →', 'HOVER TO PREVIEW →'],
      ['.directory-head span:nth-child(2)', '项目 / PROJECT', 'PROJECT'],
      ['.lab-close h2', '不是副项目。<br>是另一种思考方式。', 'Not side projects.<br>Another way of thinking.', true],
      ['.lab-close p', '独立创作让我持续训练观察、提炼与视觉转译。它与品牌和产品工作共享同一套核心能力：从复杂世界中找出值得被看见的部分。', 'Independent practice keeps my observation, synthesis and visual translation active. It shares the same core capability as my brand and product work: finding what deserves to be seen in a complex world.'],
      ['.lab-close a', '继续查看随手记录 →', 'CONTINUE TO DAILY NOTES →']
    ],
    notes: [
      ['.lab-hero h1', '留意<br><em>日常。</em>', 'Notice the<br><em>ordinary.</em>', true],
      ['.lab-hero p', '设计判断来自日常积累。这里记录平凡生活、实体符号、城市文化与个人思考，是作品背后持续运行的观察系统。', 'Design judgment is built through daily observation. These notes collect ordinary life, physical symbols, urban culture and personal reflection—the observation system behind the work.'],
      ['.lab-index span:last-child', '外部档案 →', 'EXTERNAL ARCHIVE →'],
      ['.lab-close h2', '思考在作品集之外<br>继续发生。', 'Thoughts continue<br>outside the portfolio.', true],
      ['.lab-close p', '更多文章、创作记录与生活观察保存在 BANCI 的长期日志中。', 'More writing, creative records and observations live in BANCI’s long-term journal.'],
      ['.lab-close a', '打开 QIZHUAYU 日志 →', 'OPEN QIZHUAYU JOURNAL →']
    ],
    contact: [
      ['.contact-strip .eyebrow', '开放精选合作机会', 'AVAILABLE FOR SELECTED OPPORTUNITIES'],
      ['.contact-strip h2', '一起创造<br>正在发生的下一步。', 'Let’s create<br>what comes next.', true],
      ['.contact-strip div p', '张仕伟 / BANCI<br>品牌设计 × 产品体验 × AI 创意<br>中国深圳', 'ZHANG SHIWEI / BANCI<br>Brand Design × Product Experience × AI Creative<br>Shenzhen, China', true],
      ['.contact-strip .text-link:nth-of-type(1)', '查看完整作品索引 →', 'VIEW COMPLETE WORK INDEX →'],
      ['.contact-strip .text-link:nth-of-type(2)', '阅读日志 →', 'READ JOURNAL →'],
      ['.contact-strip .text-link:nth-of-type(3)', '关于我与经历 →', 'ABOUT & EXPERIENCE →']
    ],
    aku: [
      ['.aku-intro .eyebrow', '个人创作研究 / 365 天中的第 206 天', 'PERSONAL CREATIVE RESEARCH / 206 OF 365'],
      ['.aku-intro .intro-copy', '每天创作一张插画，<br>通过视觉记录观察、思考与表达。', 'One illustration every day—<br>a visual record of observation, thought and expression.', true],
      ['.aku-intro > a', '进入档案 <i>→</i>', 'ENTER THE ARCHIVE <i>→</i>', true],
      ['.gallery-help span:nth-child(1)', '滚动穿行', 'SCROLL TO TRAVEL'],
      ['.gallery-help span:nth-child(2)', '移动观察', 'MOVE TO LOOK'],
      ['.gallery-help span:nth-child(3)', '点击打开', 'CLICK TO OPEN'],
      ['.archive-heading h2', '一天。<br>一个视觉想法。', 'One day.<br>One visual thought.', true],
      ['.type-lab h2', '文字成为<br><i>视觉节奏。</i>', 'Words become<br><i>visual rhythm.</i>', true],
      ['.pin-wall h2', '一个可以放进口袋的<br>AKU 世界。', 'A pocket-sized<br>world of AKU.', true],
      ['.month-book h2', '一页一页<br>翻阅这一年。', 'Turn the year<br>page by page.', true],
      ['.tear-calendar h2', '按住。拖动。<br><i>撕下这一天。</i>', 'Hold. Drag.<br><i>Tear the day away.</i>', true],
      ['.aku-story > span', '从内容到产品', 'FROM CONTENT TO PRODUCT'],
      ['.aku-story h2', '想法成为<br>真实体验。', 'Ideas become<br>real experiences.', true],
      ['.aku-story div p:first-child', 'AKU 从日常插画逐渐延展到卡片、贴纸、出版物与实体产品。它不是一组孤立的插画，而是一场关于持续创造、视觉转译和产品化的长期实验。', 'AKU expanded from daily illustration into cards, stickers, publications and physical products—a long-term experiment in continuous creation, visual translation and productization.'],
      ['.aku-next h2', '精选<br>作品。', 'Selected<br>works.', true],
      ['.aku-next a', '返回首页 →', 'BACK TO HOME →']
    ]
  };

  const workCategories = {
    brand: ['品牌设计', 'Brand Design', '建立识别、策略与表达系统，让产品被理解与信任。', 'Build identity, strategy and communication systems that make products understandable and trustworthy.'],
    product: ['产品设计', 'Product Design', '从研究、定义与协作，到真实产品进入市场。', 'From research, definition and collaboration to products entering the market.'],
    ui: ['UI 体验设计', 'UI Experience', '交互逻辑、界面、动效与可扩展的设计系统。', 'Interaction logic, interface, motion and scalable design systems.'],
    ai: ['AI 创作', 'AI Creative', '用人的判断力驱动智能工具，重构设计探索流程。', 'Human judgment directs intelligent tools and reshapes the design exploration process.'],
    aku: ['AKU 日记', 'AKU Journal', '持续 365 天的视觉思考、个人 IP 与产品实验。', 'A 365-day practice of visual thinking, personal IP and product experimentation.'],
    lab: ['个人创作', 'Creative Lab', '关于字体、图像、文化与日常观察的独立实验。', 'Independent experiments in typography, image, culture and everyday observation.'],
    notes: ['随手记录', 'Daily Notes', '来自平凡生活的观察、符号与诗意片段。', 'Observations, symbols and poetic fragments from ordinary life.']
  };

  const labProjects = [
    ['IP–OH 贴纸包', 'IP–OH Sticker Pack'], ['白 T 计划', 'White T Project'], ['从数字 1 到 100 的难度', 'The Difficulty from 1 to 100'],
    ['搁浅的人', 'Stranded People'], ['古抽体', 'Gu-Chou Type'], ['关于镜子', 'About Mirrors'], ['城市明信片', 'City Postcards'],
    ['疫情明信片', 'Pandemic Postcards'], ['诗的意向', 'Poetic Intentions'], ['手写字体', 'Handwritten Type'], ['睡着的人', 'Sleeping People'],
    ['小人物', 'Little People'], ['艺术家肖像', 'Artist Portraits']
  ];

  const titles = {
    home: ['BANCI — 品牌、产品与 AI', 'BANCI — Brand, Product & AI'], work: ['作品 — BANCI', 'Work — BANCI'],
    about: ['关于 — BANCI', 'About — BANCI'], lab: ['个人创作 — BANCI', 'Creative Lab — BANCI'], notes: ['随手记录 — BANCI', 'Daily Notes — BANCI'],
    contact: ['联系 — BANCI', 'Contact — BANCI'], aku: ['AKU Days 365 — BANCI', 'AKU Days 365 — BANCI']
  };

  function pageName() {
    const path = location.pathname.toLowerCase();
    if (path === '/') return 'home';
    if (path.startsWith('/work/')) return 'work';
    if (path.startsWith('/about/')) return 'about';
    if (path.startsWith('/lab/')) return 'lab';
    if (path.startsWith('/notes/')) return 'notes';
    if (path.startsWith('/contact/')) return 'contact';
    if (path.includes('/projects/aku')) return 'aku';
    return 'project';
  }

  function setContent(selector, zh, en, html = false) {
    const value = language === 'zh' ? zh : en;
    document.querySelectorAll(selector).forEach(element => {
      if (html) {
        if (element.innerHTML !== value) element.innerHTML = value;
      } else if (element.textContent !== value) element.textContent = value;
    });
  }

  function ensureSwitch() {
    document.querySelectorAll('.site-header').forEach(header => {
      let utility = header.querySelector('.nav-utility');
      if (!utility) {
        utility = document.createElement('div');
        utility.className = 'nav-utility';
        const phase = header.querySelector(':scope > .phase');
        if (phase) {
          header.insertBefore(utility, phase);
          utility.appendChild(phase);
        } else header.appendChild(utility);
      }
      if (!utility.querySelector('.language-switch')) {
        const control = document.createElement('div');
        control.className = 'language-switch';
        control.setAttribute('aria-label', 'Language / 语言');
        const chinaFlag = '<span class="language-switch__flag" aria-hidden="true"><svg viewBox="0 0 14 10"><rect width="14" height="10" fill="#ee1c25"/><path fill="#ffde00" d="m3 1 .45 1.2 1.28.06-.99.8.34 1.24L3 3.58 1.92 4.3l.34-1.24-.99-.8 1.28-.06z"/><circle cx="5.7" cy="1.45" r=".32" fill="#ffde00"/><circle cx="6.55" cy="2.35" r=".3" fill="#ffde00"/><circle cx="6.45" cy="3.55" r=".3" fill="#ffde00"/><circle cx="5.55" cy="4.35" r=".3" fill="#ffde00"/></svg></span>';
        const ukFlag = '<span class="language-switch__flag" aria-hidden="true"><svg viewBox="0 0 14 10"><rect width="14" height="10" fill="#012169"/><path d="M0 0 14 10M14 0 0 10" stroke="#fff" stroke-width="2.8"/><path d="M0 0 14 10M14 0 0 10" stroke="#c8102e" stroke-width="1"/><path d="M6 0h2v4h6v2H8v4H6V6H0V4h6z" fill="#fff"/><path d="M6.55 0h.9v4.45H14v1.1H7.45V10h-.9V5.55H0v-1.1h6.55z" fill="#c8102e"/></svg></span>';
        control.innerHTML = `<button type="button" data-language="zh">${chinaFlag}ZH</button><span class="language-switch__divider" aria-hidden="true">/</span><button type="button" data-language="en">${ukFlag}EN</button>`;
        utility.appendChild(control);
        control.querySelectorAll('button').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
      }
    });
  }

  function applyNav() {
    document.querySelectorAll('.nav-system__item').forEach(link => {
      if (link.hasAttribute('data-primary-nav')) return;
      const href = link.getAttribute('href') || '';
      let pair = navCopy[href];
      if (href.includes('category=brand')) pair = navCopy.brand;
      if (href.includes('category=product')) pair = navCopy.product;
      if (href.includes('category=ai')) pair = navCopy.ai;
      if (!pair) return;
      const label = link.querySelector('.nav-system__label');
      const value = language === 'zh' ? pair[0] : pair[1];
      if (label && label.textContent !== value) label.textContent = value;
    });
  }

  function applyWorkDynamic() {
    document.querySelectorAll('.category').forEach(link => {
      const id = new URL(link.href, location.href).searchParams.get('category');
      const copy = workCategories[id];
      if (!copy) return;
      const heading = link.querySelector('h2');
      const description = link.querySelector('p');
      const headingValue = language === 'zh' ? `${copy[0]}<small>${copy[1].toUpperCase()}</small>` : `${copy[1]}<small>${copy[0]}</small>`;
      const descriptionValue = language === 'zh' ? copy[2] : copy[3];
      if (heading && heading.innerHTML !== headingValue) heading.innerHTML = headingValue;
      if (description && description.textContent !== descriptionValue) description.textContent = descriptionValue;
    });
    document.querySelectorAll('#filters button').forEach(button => {
      const id = button.dataset.filter;
      const value = id === 'all' ? (language === 'zh' ? '全部' : 'ALL') : workCategories[id] ? (language === 'zh' ? workCategories[id][0] : workCategories[id][1].toUpperCase()) : button.textContent;
      if (button.textContent !== value) button.textContent = value;
    });
  }

  function applyLabDynamic() {
    document.querySelectorAll('.project-row').forEach((row, index) => {
      const pair = labProjects[index];
      if (!pair) return;
      const heading = row.querySelector('h2');
      if (!heading) return;
      const small = heading.querySelector('small');
      const description = small?.textContent || '';
      const value = `${language === 'zh' ? pair[0] : pair[1]}<small>${description}</small>`;
      if (heading.innerHTML !== value) heading.innerHTML = value;
    });
  }

  function applyInlineCopy() {
    document.querySelectorAll('[data-zh][data-en]').forEach(element => {
      const value = language === 'zh' ? element.dataset.zh : element.dataset.en;
      if (element.hasAttribute('data-i18n-html')) {
        if (element.innerHTML !== value) element.innerHTML = value;
      } else if (element.textContent !== value) element.textContent = value;
    });
  }

  function updateControls() {
    document.querySelectorAll('.language-switch button').forEach(button => {
      const active = button.dataset.language === language;
      button.setAttribute('aria-pressed', String(active));
      button.tabIndex = active ? -1 : 0;
    });
  }

  function markChineseCopy() {
    const containsCjk = /[\u3400-\u9fff\uf900-\ufaff]/;
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd').forEach(element => {
      element.classList.toggle('is-cjk-copy', language === 'zh' && containsCjk.test(element.textContent || ''));
    });
  }

  function applyLanguage() {
    ensureSwitch();
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.body.dataset.language = language;
    applyNav();
    applyInlineCopy();
    const page = pageName();
    (pageCopy[page] || []).forEach(entry => setContent(...entry));
    if (page === 'work') applyWorkDynamic();
    if (page === 'lab') applyLabDynamic();
    if (titles[page]) document.title = titles[page][language === 'zh' ? 0 : 1];
    markChineseCopy();
    updateControls();
  }

  function setLanguage(next) {
    const normalized = validLanguage(next);
    if (normalized === language) return;
    language = normalized;
    localStorage.setItem(STORAGE_KEY, language);
    applyLanguage();
    window.dispatchEvent(new CustomEvent('banci:languagechange', { detail: { language } }));
  }

  window.BanciI18n = { get language() { return language; }, setLanguage, applyLanguage };
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; applyLanguage(); });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  applyLanguage();
})();
