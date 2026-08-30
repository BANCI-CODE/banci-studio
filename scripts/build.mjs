import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

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
await injectMotion("dist/client");
await cp("app/globals.css", "dist/client/immersive.css");
await cp(".openai", "dist/.openai", { recursive: true });
await writeFile("dist/server/index.js", `export default { async fetch(request, env) { return env.ASSETS.fetch(request); } };\n`);
