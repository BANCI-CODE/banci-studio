const dataPromise = fetch("/content/projects.json").then(response => response.json());
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const projectUrl = project => project.url || `/project/template/?slug=${project.slug}`;
const escapeAttribute = value => String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const projectArtDirection = project => ({
  desktopSrc: project.desktopSrc || project.featuredCover || project.cover,
  mobileSrc: project.mobileSrc || "",
  objectPositionDesktop: project.objectPositionDesktop || project.featuredObjectPosition || "50% 50%",
  objectPositionMobile: project.objectPositionMobile || project.objectPositionDesktop || project.featuredObjectPosition || "50% 50%",
  fitMode: ["cover", "contain"].includes(project.fitMode) ? project.fitMode : "cover"
});
const responsiveProjectImage = (project, loadingAttributes) => {
  const art = projectArtDirection(project);
  const desktopSource = art.mobileSrc
    ? `<source media="(min-width: 821px)" srcset="${escapeAttribute(art.desktopSrc)}">`
    : "";
  const fallbackSrc = art.mobileSrc || art.desktopSrc;
  return `<picture>${desktopSource}<img src="${escapeAttribute(fallbackSrc)}" alt="${escapeAttribute(project.title)} 项目封面" ${loadingAttributes}></picture>`;
};

dataPromise.then(data => {
  if ($("#featured")) {
    const featuredProjects = data.projects
      .filter(project => project.featured === true)
      .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER))
      .slice(0, 4);
    $("#featured").innerHTML = featuredProjects.map((project, index) => {
      const href = projectUrl(project);
      const number = String(index + 1).padStart(2, "0");
      const category = project.featuredCategoryLabel || project.category.join(" × ").toUpperCase();
      const displayYear = String(project.year).replace(/(\d{4})[–-](\d{4})/g, "$1—$2");
      const statementZh = project.featuredStatement || project.description;
      const statementEn = project.featuredStatementEn || project.descriptionEn || project.description;
      const scope = (project.featuredScope || project.tools || []).join(" / ");
      const titleHtml = (project.featuredTitleLines || [project.title])
        .map((line) => `<span>${escapeAttribute(line)}</span>`)
        .join("");
      const imageLoading = index === 0
        ? 'loading="eager" fetchpriority="high" decoding="async"'
        : 'loading="lazy" decoding="async"';
      const art = projectArtDirection(project);

      return `<article class="featured-case${index === 0 ? " featured-case--primary" : ""}" data-project="${escapeAttribute(project.slug)}">
        <div class="featured-case__meta">
          <span>${number} / ${escapeAttribute(category)}</span>
          <span>${escapeAttribute(displayYear)}</span>
        </div>
        <div class="featured-case__intro">
          <h3 class="featured-case__title">${titleHtml}</h3>
          <p class="featured-case__statement" data-zh="${escapeAttribute(statementZh)}" data-en="${escapeAttribute(statementEn)}">${escapeAttribute(statementZh)}</p>
        </div>
        <a class="featured-case__media" href="${escapeAttribute(href)}" aria-label="查看 ${escapeAttribute(project.title)} 完整案例" style="--featured-object-position-desktop:${escapeAttribute(art.objectPositionDesktop)};--featured-object-position-mobile:${escapeAttribute(art.objectPositionMobile)};--featured-fit:${escapeAttribute(art.fitMode)}">
          ${responsiveProjectImage(project, imageLoading)}
        </a>
        <div class="featured-case__evidence">
          <div><span>ROLE</span><p>${escapeAttribute(project.role)}</p></div>
          <div><span>SCOPE</span><p>${escapeAttribute(scope)}</p></div>
          <div><span>RESULT</span><p>${escapeAttribute(project.result || "In development")}</p></div>
        </div>
        <a class="featured-case__cta" href="${escapeAttribute(href)}" aria-label="查看 ${escapeAttribute(project.title)} 完整案例">
          <span>VIEW FULL CASE</span><span aria-hidden="true">↗</span>
        </a>
      </article>`;
    }).join("");
  }
  if ($("#homepage-evidence")) {
    $("#homepage-evidence").innerHTML = (data.evidence || []).map(item => {
      const metricClass = item.longMetric ? " feature-proof__metric--long" : "";
      const secondary = item.secondary
        ? `<p class="feature-proof__secondary" data-zh="${escapeAttribute(item.secondaryZh)}" data-en="${escapeAttribute(item.secondary)}">${escapeAttribute(item.secondaryZh)}</p>`
        : "";
      return `<article class="feature-proof">
        <div class="feature-proof__project"><span>${escapeAttribute(item.project)}</span><span>${escapeAttribute(item.number)}</span></div>
        <div class="feature-proof__measure">
          <strong class="feature-proof__metric${metricClass}">${escapeAttribute(item.metric)}</strong>
          <p class="feature-proof__label" data-zh="${escapeAttribute(item.metricLabelZh)}" data-en="${escapeAttribute(item.metricLabel)}">${escapeAttribute(item.metricLabelZh)}</p>
        </div>
        <div class="feature-proof__context">
          <p class="feature-proof__support" data-zh="${escapeAttribute(item.supportZh)}" data-en="${escapeAttribute(item.support)}">${escapeAttribute(item.supportZh)}</p>
          ${secondary}
        </div>
      </article>`;
    }).join("");
  }
  const akuPractice = $("#practice-aku");
  if (akuPractice) {
    const project = data.projects.find(item => item.slug === akuPractice.dataset.projectSlug);
    if (project) {
      const href = projectUrl(project);
      const titleLines = project.title.replace(/\s+365$/i, "").trim();
      akuPractice.querySelectorAll("a").forEach(link => { link.href = href; });
      const image = $(".practice-item__media img", akuPractice);
      if (image && project.homepagePracticeCover) image.src = project.homepagePracticeCover;
      const title = $("h3", akuPractice);
      if (title) title.innerHTML = `<span>${escapeAttribute(titleLines)}</span><span>365</span>`;
    }
  }
  if ($("#category-list")) {
    $("#category-list").innerHTML = data.categories.map(category => `<a class="category" href="/work/?category=${category.id}"><span>${category.number}</span><h2>${category.title}<small>${category.cn}</small></h2><p>${category.description}</p><span class="category-arrow">↗</span></a>`).join("");
  }
  if ($("#work-list") && !$("#work-list").hasAttribute("data-prerendered")) {
    const get = slug => data.projects.find(p => p.slug === slug);
    const art = {fantawild:"/case-media/fantawild-posters/poster-315.webp",airseekers:"/case-media/airseekers-v2/product-context.webp",mova:"/case-media/mova-hd/hd-228-read.webp",kamingo:"/case-media/kamingo-v2/kamingo-156.webp",forktech:"/case-media/forktech-v2/forktech-91.webp",shantaiqing:"/case-media/shantaiqing/stq-1032.webp"};
    const img = (p, eager=false) => `<img src="${escapeAttribute(art[p.slug] || p.desktopSrc || p.cover)}" alt="${escapeAttribute(p.title)}" loading="${eager?'eager':'lazy'}" decoding="async">`;
    const heading = (id, label, title, text) => `<header class="ed-section-head" id="${id}"><div><small>${label}</small><h2>${title}</h2></div><p>${text}</p></header>`;
    const feature = slug => {const p=get(slug);return `<a class="ed-feature" href="${projectUrl(p)}"><div class="ed-feature-image">${img(p,true)}</div><div class="ed-feature-caption"><div><small>${p.year} / ${slug==='mova'?'PRODUCT EXPERIENCE':'BRAND & PRODUCT'}</small><h3>${p.title}</h3><p>${p.description}</p></div><span aria-hidden="true">↗</span></div></a>`};
    const employers=[['mova','2025—2026','MOVA · 追觅科技','屏幕交互 / 产品逻辑 / 外型探索'],['airseekers','2024—2025','AIRSEEKERS','品牌体系 / 包装交付 / 展会与数字体验'],['baidu','2022—2023','百度 · Baidu','IP 形象 / 行业会议 / 视觉设计'],['fantawild','2018—2022','华强方特 · Fantawild','漫画栏目 / 节日主视觉 / H5 与官网']];
    const lab=get('creative-lab');
    $("#work-list").innerHTML = `${heading('selected-cases','SELECTED CASE STUDIES','重点案例','从品牌表达，到产品被使用的体验。')}<div class="ed-feature-grid">${['airseekers','mova'].map(feature).join('')}</div>
    ${heading('company-work','IN-HOUSE EXPERIENCE','任职经历与项目','按公司梳理工作阶段，进入对应案例查看设计内容。')}<div class="ed-employers">${employers.map(([slug,year,name,scope])=>{const p=get(slug);return `<a class="ed-employer" href="${projectUrl(p)}"><div class="ed-company-image">${img(p)}</div><time>${year}</time><div><h3>${name}</h3><span>${p.role}</span></div><p>${scope}</p><b aria-hidden="true">↗</b></a>`}).join('')}</div>
    ${heading('brand-projects','BRAND PROJECTS','品牌项目','标志、视觉规范与品牌应用。')}<div class="ed-brands">${['kamingo','forktech','shantaiqing'].map(slug=>{const p=get(slug);return `<a class="ed-brand" href="${projectUrl(p)}"><div>${img(p)}</div><small>${p.year} / BRAND DESIGN</small><h3>${p.title}<span aria-hidden="true">↗</span></h3><p>${p.description}</p></a>`}).join('')}</div>
    <section class="ed-personal" id="personal-work">${heading('personal-heading','INDEPENDENT PRACTICE','个人创作','商业项目之外，关于角色、图像、字体与日常的持续观察。')}<div class="ed-practice-links">${['aku','ai-workflow'].map(slug=>{const p=get(slug);return `<a href="${projectUrl(p)}"><small>${slug==='aku'?'CHARACTER WORLD':'CREATIVE PROCESS'}</small><h3>${p.title} ↗</h3><p>${p.description}</p></a>`}).join('')}</div><div class="ed-lab-grid"><div class="ed-lab-intro"><small>CREATIVE LAB / 14 SERIES</small><h3>独立创作<br>档案</h3><p>插画、字体、书籍与物件。<br>每一个系列，都是一次自己的提问。</p><a href="/lab/">浏览完整档案 ↗</a></div>${lab.labItems.map((item,i)=>`<a class="ed-lab-item" href="${item.url}"><div><img src="${item.cover}" alt="${item.title}" loading="lazy" decoding="async"></div><span><small>${String(i+1).padStart(2,'0')}</small><strong>${item.title}</strong><b aria-hidden="true">↗</b></span></a>`).join('')}</div></section>`;
  }
  if ($("#project-template")) {
    const slug = new URLSearchParams(location.search).get("slug") || "airseekers";
    const project = data.projects.find(item => item.slug === slug) || data.projects[0];
    $("#project-title").textContent = project.title;
    $("#project-desc").textContent = project.description;
    $("#project-cover").src = project.cover;
    $("#project-cover").alt = project.title;
    $("#project-year").textContent = project.year;
    $("#project-category").textContent = project.category.join(" / ");
    $("#project-role").textContent = project.role;
    $("#project-result").textContent = project.result || "In development";
    $("#project-tools").textContent = project.tools.join(" · ");
    document.title = `${project.title} — BANCI`;
  }
  window.BanciI18n?.applyLanguage();
});
