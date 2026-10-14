# BANCI 全站设计系统审计 — 2026-10-14

## 范围与基线
静态 HTML + 原生 CSS/JS；Node 构建将 public/site 合并并注入导航、语言、响应式、无障碍、图片加载规则。仓库存在 app 及旧 starter 测试，但实际发布入口是 site，不能按 React 组件库重写。
基线提交 97553a6，分支 design-system/home-pilot-20261014。39 个 HTML、54 个 CSS、827 个 !important。在线站点通过外部读取工具无法访问，本次以本地源码及 4192 预览为准，不声称生产站已验证。

## 问题分类与优先级
|优先级|问题与依据|涉及文件|统一建议 / 本次处理|
|---|---|---|---|
|P1|圆环 CSS 353 处 important，长期增量覆盖；手机完整入屏与54%大卡片存在几何冲突|site/home-archive/archive.css、archive.js|冻结几何；只整理末尾材质覆盖并映射 token。裁切另案处理，不能靠横向挤压|
|P1|手机圆环按钮部分宽度不足44，主次按钮状态分散|archive.css、home-classic.css|触摸控件44px下限，窄屏控件可换行，不缩小点击区域|
|P1|共享导航191处important，共享设计系统152处；覆盖顺序脆弱|nav-system.css、design-system.css、scripts/build.mjs|试点显式加载foundation；隔离首页；仅导航迁移桥使用有注释的important|
|P1|viewport cover、安全区、移动弹窗约束并非全站一致|site/index.html、projects/*.html、archive.css|首页保留安全区；弹窗限制可用高度；其他路由后续迁移|
|P2|--pad、--page-pad、--editorial-gutter和局部边距并存|portfolio.css、design-system.css、home-classic.css、about/portfolio-about.css、contact/refined.css|统一page-gutter，首页绑定旧变量以避免双系统漂移|
|P2|断点370/380/390/680/700/760/820/860/900/980/1180混用|全站样式，详见inventory|布局以768/1200切换4/8/12列；现有导航860及圆环700作为行为例外保留|
|P2|8–11px元信息、正文行长、标题间距不一致|portfolio.css、home-classic.css、project.css、aku-world.css|正文16/18，小字14，标签12；标题流体字号，图像内排版不可通过CSS修复|
|P2|按钮圆角和状态混用，focus/disabled缺少统一契约|portfolio.css、archive.css、nav-system.css|button primary/secondary/text/icon及size/state契约，默认方角|
|P2|图片cover/contain和固定高度混用|home-classic.css、project.css、aku-gallery.css|项目封面手机完整自然比例；图库按语义选择cover/contain，不全局重置|
|P2|reveal 720ms与不同hover时长并存|motion.css、home-classic.js、card-effects.js、archive.js|150/220/500ms及少量曲线；保留圆环创意节奏，减少动态偏好必须可用|
|P2|首页部分区域区块间距76/84/94/110/120px，证据条和正文左右线不同|home-classic.css、portfolio.css|4px间距阶梯+统一section/gutter，保留不同构图|
|P2|starter测试仍验证旧loading skeleton，与当前静态server不匹配|tests/rendered-html.test.mjs|不伪报旧测试通过；增加实际试点不变性和浏览器交互检查|
|P3|历史颜色、字体和作品原生强调色混在共享文件|design-system.css、aku-*.css|新基础token仅中性；已有作品颜色不删除不替换|

## 组件清单
Header/nav/mobile-menu、语言切换、Button/Text Link、Project Card、Section Header、Tag、Image Container、Footer/Back to Top、archive-note modal、work filters、AKU tabs/random draw/calendar/pin tooltip。前七项及modal通过首页试点验证；过滤器/AKU仅记录规范，不迁移。

## 风险与边界
首页几何、随机抽取、卡片素材、页面文案、路由保持。新样式仅首页引入，不覆盖其他页面；基础组件是可复用CSS契约，不引入框架。旧important未全量删除，防止影响未审查路由。Chrome仿真不能代替iPhone Safari安全区和折射真机测试。

## 路由清单及样式入口
- `/about/` — `site/about/index.html`；样式：`/portfolio.css`, `/motion.css`, `/about/about.css`, `/about/about-enhancements.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`, `/about/portfolio-about.css?v=1`
- `/contact/` — `site/contact/index.html`；样式：`/portfolio.css`, `/contact/contact.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`, `/contact/refined.css?v=1`
- `/` — `site/index.html`；样式：`/portfolio.css`, `/motion.css`, `/home-classic.css`, `/home-archive/archive.css?v=111`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=87`
- `/lab/another-city/` — `site/lab/another-city/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/another-city/city.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/artists/` — `site/lab/artists/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/artists/artists.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/guzhuo/` — `site/lab/guzhuo/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/guzhuo/guzhuo.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/` — `site/lab/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/catalog.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/lettering/` — `site/lab/lettering/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/lettering/lettering.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/little-people/` — `site/lab/little-people/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/little-people/little.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/mask-time/` — `site/lab/mask-time/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/mask-time/mask.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/mirror/` — `site/lab/mirror/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/mirror/mirror.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/om/` — `site/lab/om/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/om/om.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/one-to-hundred/` — `site/lab/one-to-hundred/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/one-to-hundred/book.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/ordinary-fashion/` — `site/lab/ordinary-fashion/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/ordinary-fashion/fashion.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/poetry/` — `site/lab/poetry/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/poetry/poetry.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/sleeping/` — `site/lab/sleeping/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/sleeping/sleeping.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/stranded/` — `site/lab/stranded/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/stranded/stranded.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/lab/white-t/` — `site/lab/white-t/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/lab/white-t/white-t.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/notes/` — `site/notes/index.html`；样式：`/portfolio.css`, `/lab/lab.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/ai-workflow/` — `site/project/ai-workflow/index.html`；样式：`/portfolio.css`, `/project/case.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/airseekers/` — `site/project/airseekers/index.html`；样式：`/portfolio.css`, `/project/case.css`, `/project/case-system.css`, `/project/airseekers/airseekers.css`, `/project/airseekers/airseekers-refinement.css`, `/project/airseekers/experience.css`, `/project/airseekers/details.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/baidu/` — `site/project/baidu/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/project/baidu/brand.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/fantawild/` — `site/project/fantawild/index.html`；样式：`/portfolio.css`, `/project/fantawild/stories.css`, `/project/airseekers/details.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/forktech/` — `site/project/forktech/index.html`；样式：`/portfolio.css`, `/project/forktech/brand.css`, `/project/airseekers/details.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/kamingo/` — `site/project/kamingo/index.html`；样式：`/portfolio.css`, `/project/kamingo/brand.css`, `/project/airseekers/details.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/mova/` — `site/project/mova/index.html`；样式：`/portfolio.css`, `/project/case.css`, `/project/case-system.css`, `/project/mova/mova-detail.css`, `/project/airseekers/details.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/shanbenqing/` — `site/project/shanbenqing/index.html`；样式：`/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/shantaiqing/` — `site/project/shantaiqing/index.html`；样式：`/portfolio.css`, `/project/airseekers/details.css`, `/project/shantaiqing/brand.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/project/template/` — `site/project/template/index.html`；样式：`/portfolio.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/airseekers.html` — `site/projects/airseekers.html`；样式：`/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/aku-calendar.html` — `site/projects/aku-calendar.html`；样式：`/aku-world.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/aku-daily.html` — `site/projects/aku-daily.html`；样式：`/aku-world.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`, `/aku-draw.css?v=2`
- `/projects/aku-evolution.html` — `site/projects/aku-evolution.html`；样式：`/aku-board.css?v=character1`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/aku-pins.html` — `site/projects/aku-pins.html`；样式：`/aku-world.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/aku.html` — `site/projects/aku.html`；样式：`/aku-world.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/fantawild.html` — `site/projects/fantawild.html`；样式：`/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/interface.html` — `site/projects/interface.html`；样式：`/project.css`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/projects/mova.html` — `site/projects/mova.html`；样式：`/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`
- `/work/` — `site/work/index.html`；样式：`/portfolio.css`, `/motion.css`, `/work/work.css?v=90`, `/nav-system.css?v=75`, `/language-system.css`, `/responsive-system.css`, `/design-system.css?v=83`

完整机器清单见 design-system/audit-inventory.json，含每个CSS的媒体查询、important数量和全部脚本入口。
