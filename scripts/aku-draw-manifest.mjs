import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

// Built from the canonical collection; never hand-edit the generated manifest.
export async function generateAkuDrawManifest(root) {
  const directory = path.join(root, 'content/aku');
  const config = JSON.parse(await readFile(path.join(directory, 'aku-config.json'), 'utf8'));
  const items = JSON.parse(await readFile(path.join(directory, 'aku-daily.json'), 'utf8'));
  const base = '/performance-images/aku/';
  const fields = ['day', 'title', 'story', 'week', 'date', 'portrait', 'storyImage', 'variants'];
  const rows = items.map(item => [item.day, item.title, item.story || '', item.week || '', item.date || '',
    item.portrait || item.detail || item.thumb || '', item.storyImage || '',
    (item.portraitVariants || []).map(v => [v.src.startsWith(base) ? v.src.slice(base.length) : v.src, v.width])]);
  await writeFile(path.join(directory, 'aku-draw.json'), JSON.stringify({version:1, totalDays:config.totalDays, base, fields, rows}));
}
