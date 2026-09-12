import path from 'node:path';

const origin = 'https://banci.studio';
const descriptions = {
  'notes/index.html': 'BANCI 的日常观察、设计记录与独立创作笔记。',
  'project/ai-workflow/index.html': 'BANCI 的 AI 创意工作流：从视觉探索到设计表达的实践。',
  'project/kamingo/index.html': 'KAMINGO 品牌升级案例，展示品牌识别与视觉表达。',
  'project/shanbenqing/index.html': '山冭清品牌系统案例，展示品牌识别与设计应用。',
  'project/template/index.html': 'BANCI 项目资料页，按项目展示背景、职责与设计过程。',
  'projects/airseekers.html': 'AIRSEEKERS 品牌与产品视觉设计项目档案。',
  'projects/fantawild.html': '华强方特视觉内容与设计项目档案。',
  'projects/mova.html': 'MOVA 智能硬件与屏幕交互设计项目档案。',
  'projects/interface.html': 'BANCI 数字界面设计项目档案，展示界面与交互设计实践。'
};
const canonicalRoutes = {
  'projects/airseekers.html': '/project/airseekers/',
  'projects/mova.html': '/project/mova/',
  'projects/fantawild.html': '/project/fantawild/'
};
// Existing project imagery is used without cropping or generating new artwork.
const images = {
  'project/airseekers/index.html': '/work/airseekers-featured-2026.webp',
  'project/mova/index.html': '/home/mova-featured-2026.webp',
  'project/fantawild/index.html': '/home/fantawild-featured-2026.webp',
  'project/ai-workflow/index.html': '/home/ai-workflow-featured-2026.webp'
};
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export function enhanceSeoAccessibility(html, file, root) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const route = relative === 'index.html' ? '/' : '/' + relative.replace(/index\.html$/, '');
  const canonical = origin + (canonicalRoutes[relative] || route);
  const title = decode(html.match(/<title>([^<]+)<\/title>/i)?.[1] || '');
  if (!title) throw new Error(`Missing page title: ${relative}`);
  const existingDescription = html.match(/<meta\b[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1];
  const description = existingDescription ? decode(existingDescription) : descriptions[relative];
  if (!description) throw new Error(`Missing page description: ${relative}`);
  const additions = [];
  if (!existingDescription) additions.push(`<meta name="description" content="${escape(description)}">`);
  if (!/<link\b[^>]*rel="canonical"/i.test(html)) additions.push(`<link rel="canonical" href="${canonical}">`);
  for (const [property, content] of Object.entries({
    'og:title': title, 'og:description': description, 'og:url': canonical,
    'og:type': 'website', 'og:site_name': 'BANCI', 'og:locale': 'zh_CN',
    ...(images[relative] ? {'og:image': origin + images[relative], 'og:image:alt': title + ' 项目封面'} : {})
  })) {
    if (!html.includes(`property="${property}"`)) additions.push(`<meta property="${property}" content="${escape(content)}">`);
  }
  // The generic query-driven template still contains editorial placeholders.
  if (relative === 'project/template/index.html' && !html.includes('name="robots"')) additions.push('<meta name="robots" content="noindex,follow">');
  html = html.replace('</head>', additions.join('\n') + '\n</head>');
  if (!html.includes('class="site-skip-link"') && /<main\b/i.test(html) && !/class="[^"]*skip-link/.test(html)) {
    let mainId = html.match(/<main\b[^>]*\bid="([^"]+)"/i)?.[1];
    if (!mainId) {
      mainId = 'site-main-content';
      html = html.replace(/<main\b/i, `<main id="${mainId}"`);
    }
    html = html.replace(/(<body\b[^>]*>)/i, `$1\n<a class="site-skip-link" href="#${mainId}">跳到主要内容</a>`);
  }
  return html;
}
