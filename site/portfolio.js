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
    $("#featured").innerHTML = data.projects.slice(0, 4).map((project, index) => `<a data-project="${project.slug}" href="${projectUrl(project)}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${project.title}</strong>
      <small>${project.category.join(" / ").toUpperCase()} · ${project.year}</small>
      <span aria-hidden="true">↗</span>
    </a>`).join("");
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
}).then(() => import("/card-effects.js"));
