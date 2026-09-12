import { enhanceSeoAccessibility } from "./seo-accessibility.mjs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { enhanceImageMarkup } from "./image-performance.mjs";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/client", { recursive: true });
await mkdir("dist/server", { recursive: true });
await cp("public", "dist/client", { recursive: true });
await cp("site", "dist/client", { recursive: true });
// Keep the original high-resolution portfolio PDF in the workspace, but do not
// ship the unused 100 MB source file with the web deployment.
await rm("dist/client/BANCI-Portfolio.pdf", { force: true });
async function injectMotion(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await injectMotion(file);
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    let html = await readFile(file, "utf8");
    if (!html.includes('/nav-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/nav-system.css"></head>');
  if (!html.includes('/language-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/language-system.css"></head>');
  if (!html.includes('/responsive-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/responsive-system.css"></head>');
  if (!html.includes('/design-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/design-system.css"></head>');
    if (!html.includes('/nav-system.js')) html = html.replace('</body>', '<script src="/nav-system.js" defer></script></body>');
    if (!html.includes('/language-system.js')) html = html.replace('</body>', '<script src="/language-system.js" defer></script></body>');
    if (!html.includes('/image-loader.js')) html = html.replace('</body>', '<script src="/image-loader.js" defer></script></body>');
    html = enhanceSeoAccessibility(html, file, "dist/client");
    html = await enhanceImageMarkup(html, "dist/client");
    await writeFile(file, html);
  }
}
await injectMotion("dist/client");
await cp("app/globals.css", "dist/client/immersive.css");
// Portable build: no hosting account configuration required.
await writeFile("dist/server/index.js", `export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };\n`);
