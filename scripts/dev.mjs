import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";

const types = {".html":"text/html; charset=utf-8",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".pdf":"application/pdf"};
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let file = pathname === "/" ? "dist/client/index.html" : `dist/client${pathname}`;
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, "index.html");
    response.writeHead(200, {"Content-Type":types[extname(file)] || "application/octet-stream"});
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
    response.end("Not found");
  }
});
server.listen(4173, "127.0.0.1", () => console.log("Local URL: http://127.0.0.1:4173"));
