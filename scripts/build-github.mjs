import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

await rm("github-dist", { recursive: true, force: true });
await mkdir("github-dist", { recursive: true });
await cp("public", "github-dist", { recursive: true });
await cp("site", "github-dist", { recursive: true });

// Keep the original portfolio PDF locally; GitHub Pages receives only the
// optimized website assets.
await rm("github-dist/BANCI-Portfolio.pdf", { force: true });

async function injectSharedSystems(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await injectSharedSystems(file);
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;

    let html = await readFile(file, "utf8");
    if (!html.includes('/card-effects.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/card-effects.css"></head>');
    if (!html.includes('/nav-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/nav-system.css"></head>');
    if (!html.includes('/language-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/language-system.css"></head>');
    if (!html.includes('/responsive-system.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/responsive-system.css"></head>');
    if (!html.includes('/card-effects.js')) html = html.replace('</body>', '<script src="/card-effects.js" defer></script></body>');
    if (!html.includes('/nav-system.js')) html = html.replace('</body>', '<script src="/nav-system.js" defer></script></body>');
    if (!html.includes('/language-system.js')) html = html.replace('</body>', '<script src="/language-system.js" defer></script></body>');
    await writeFile(file, html);
  }
}

await injectSharedSystems("github-dist");

await writeFile("github-dist/.nojekyll", "");
await writeFile("github-dist/CNAME", "banci.studio\n");

console.log("GitHub Pages export ready: github-dist/");
