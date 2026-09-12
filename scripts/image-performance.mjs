import { readFile } from "node:fs/promises";
import path from "node:path";

function jpegSize(buffer) {
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return [buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5)];
    }
    if (!length) break;
    offset += 2 + length;
  }
}

function webpSize(buffer) {
  const type = buffer.toString("ascii", 12, 16);
  if (type === "VP8X") return [1 + buffer.readUIntLE(24, 3), 1 + buffer.readUIntLE(27, 3)];
  if (type === "VP8 " && buffer.length >= 30) return [buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff];
  if (type === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
  }
}

async function imageSize(file) {
  try {
    const buffer = await readFile(file);
    if (buffer.toString("ascii", 1, 4) === "PNG") return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return jpegSize(buffer);
    if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return webpSize(buffer);
  } catch {}
}

export async function enhanceImageMarkup(html, outputRoot) {
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)];
  if (!tags.length) return html;
  const replacements = new Map();
  for (const match of tags) {
    let tag = match[0];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src || src.startsWith("data:") || src.endsWith(".svg")) continue;
    const critical = /\bfetchpriority=["']high["']/i.test(tag);
    if (!/\bloading=/i.test(tag)) tag = tag.replace(/>$/, ` loading="${critical ? "eager" : "lazy"}">`);
    if (!/\bdecoding=/i.test(tag)) tag = tag.replace(/>$/, ' decoding="async">');
    if (!/\bwidth=/i.test(tag) && !/\bheight=/i.test(tag) && src.startsWith("/")) {
      const cleanPath = decodeURIComponent(src.split(/[?#]/)[0]).replace(/^\/+/, "");
      const size = await imageSize(path.join(outputRoot, cleanPath));
      if (size) tag = tag.replace(/>$/, ` width="${size[0]}" height="${size[1]}">`);
    }
    const insidePicture = html.lastIndexOf("<picture", match.index) > html.lastIndexOf("</picture", match.index);
    if (!critical && !insidePicture && /\bloading=["']lazy["']/i.test(tag) && !/\bdata-src=/i.test(tag)) {
      tag = tag.replace(/\bsrc=(["'])([^"']+)\1/i, 'src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-src="$2"');
    }
    replacements.set(match[0], tag);
  }
  for (const [before, after] of replacements) html = html.replaceAll(before, after);
  return html;
}
