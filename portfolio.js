const holoStyles = document.createElement("link");
holoStyles.rel = "stylesheet";
holoStyles.href = "/card-effects.css";
document.head.appendChild(holoStyles);
const dataPromise = fetch("/content/projects.json").then(response => response.json());
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const projectUrl = project => project.url || `/project/template/?slug=${project.slug}`;
const escapeAttribute = value => String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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

      return `<article class="featured-case${index === 0 ? " featured-case--primary" : ""}" data-project="${escapeAttribute(project.slug)}">
        <div class="featured-case__meta">
          <span>${number} / ${escapeAttribute(category)}</span>
          <span>${escapeAttribute(displayYear)}</span>
        </div>
        <div class="featured-case__intro">
          <h3 class="featured-case__title">${titleHtml}</h3>
          <p class="featured-case__statement" data-zh="${escapeAttribute(statementZh)}" data-en="${escapeAttribute(statementEn)}">${escapeAttribute(statementZh)}</p>
        </div>
        <a class="featured-case__media" href="${escapeAttribute(href)}" aria-label="查看 ${escapeAttribute(project.title)} 完整案例" style="--featured-object-position:${escapeAttribute(project.featuredObjectPosition || "50% 50%")}">
          <img src="${escapeAttribute(project.featuredCover || project.cover)}" alt="${escapeAttribute(project.title)} 项目封面" ${imageLoading}>
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
  if ($("#work-list")) {
    let active = new URLSearchParams(location.search).get("category") || "all";
    const setPreview = (project, index) => {
      const image = $("#work-preview-image");
      if (!image) return;
      image.classList.add("is-changing");
      window.setTimeout(() => {
        image.src = project.cover;
        $("#work-preview-number").textContent = String(index + 1).padStart(2, "0");
        $("#work-preview-label").textContent = project.title;
        image.classList.remove("is-changing");
      }, 100);
    };
    const render = () => {
      const projects = data.projects.filter(project => active === "all" || project.category.includes(active));
      $("#work-list").innerHTML = projects.length ? projects.map((project, index) => `<a class="work-index-row" href="${projectUrl(project)}"><span class="work-index-number">${String(index + 1).padStart(2, "0")}</span><span class="work-index-title">${project.title}</span><span class="work-index-category">${project.category.join(" / ").toUpperCase()}</span><span class="work-index-year">${project.year}</span><span class="work-index-arrow">↗</span></a>`).join("") : `<p class="empty-state">该方向的项目正在整理中。</p>`;
      $$(".work-index-row", $("#work-list")).forEach((row, index) => {
        row.addEventListener("mouseenter", () => setPreview(projects[index], index));
        row.addEventListener("focus", () => setPreview(projects[index], index));
      });
      if (projects[0]) setPreview(projects[0], 0);
    };
    $("#filters").innerHTML = [{id:"all", title:"All"}, ...data.categories.slice(0, 6)].map(category => `<button type="button" data-filter="${category.id}" class="${category.id === active ? "active" : ""}">${category.title.toUpperCase()}</button>`).join("");
    $$("button", $("#filters")).forEach(button => button.addEventListener("click", () => {
      active = button.dataset.filter;
      $$("button", $("#filters")).forEach(item => item.classList.toggle("active", item === button));
      history.replaceState(null, "", active === "all" ? "/work/" : `/work/?category=${active}`);
      render();
    }));
    render();
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
}).then(() => import("/card-effects.js"));
