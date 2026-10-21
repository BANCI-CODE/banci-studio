import { generateAkuDrawManifest } from "./aku-draw-manifest.mjs";
import { enhanceSeoAccessibility } from "./seo-accessibility.mjs";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { enhanceImageMarkup } from "./image-performance.mjs";

await rm("github-dist", { recursive: true, force: true });
await mkdir("github-dist", { recursive: true });
await cp("public", "github-dist", { recursive: true });
await cp("site", "github-dist", { recursive: true });
await generateAkuDrawManifest("github-dist");

// Keep the original portfolio PDF locally; GitHub Pages receives only the
// optimized website assets.
await rm("github-dist/BANCI-Portfolio.pdf", { force: true });

async function injectSharedSystems(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await injectSharedSystems(file);
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

    let html = await readFile(file, "utf8");
    if (!html.includes('/nav-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/nav-system.css"></head>');
    if (!html.includes('/language-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/language-system.css"></head>');
    if (!html.includes('/responsive-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/responsive-system.css"></head>');
    if (!html.includes('/design-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/design-system.css"></head>');
    if (!html.includes('/nav-system.js')) html = html.replace('</body>', '<script src="/nav-system.js" defer></script></body>');
    if (!html.includes('/language-system.js')) html = html.replace('</body>', '<script src="/language-system.js" defer></script></body>');
    if (!html.includes('/image-loader.js')) html = html.replace('</body>', '<script src="/image-loader.js" defer></script></body>');
    // Version both sides of the project handoff, including legacy static pages.
    html = html.replace(/(\/(?:nav-system\.(?:js|css)|home-film-preview\/film\.(?:js|css)))(?:\?[^"']*)?(?=["'])/g, (_, asset) => asset + '?v=' + (asset.includes('/film.') ? 'card-color-20261021' : 'handoff-clear-20261020'));
    html = html.replace(/<header\b([^>]*?)class="([^"]*)"([^>]*)>/g, (tag, before, classes, after) => {
      if (!/(?:^|\s)(?:site-header|aku-nav|project-nav)(?:\s|$)/.test(classes)) return tag;
      const names = new Set(classes.split(/\s+/));
      names.add('site-header'); names.add('nav-system-shell');
      return `<header${before}class="${[...names].join(' ')}"${after}>`;
    });
    html = enhanceSeoAccessibility(html, file, "github-dist");
    html = await enhanceImageMarkup(html, "github-dist");
    await writeFile(file, html);
  }
}

await injectSharedSystems("github-dist");

await writeFile("github-dist/.nojekyll", "");
await writeFile("github-dist/CNAME", "banci.studio\n");

console.log("GitHub Pages export ready: github-dist/");

// Cloudflare Pages rejects individual assets over 25 MiB.
async function assertPagesAssetLimits(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await assertPagesAssetLimits(file);
    else if (entry.isFile() && (await stat(file)).size > 25 * 1024 * 1024) {
      throw new Error(`Cloudflare Pages asset exceeds 25 MiB: ${file}`);
    }
  }
}
await assertPagesAssetLimits("github-dist");
