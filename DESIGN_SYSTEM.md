# BANCI Design System v1 — 首页试点

## 范围与使用
2026-10-14。基于现有暖白、黑灰、Arial/Helvetica/PingFang/Microsoft YaHei 和 Impact 展示字，不替换素材、文字、字体或路由。只有首页加载 `site/system/{tokens,components,home}.css`，其他页面仍使用原有规则。不得把 home.css 当作全站覆盖层。全站审计见 DESIGN_AUDIT.md。

加载顺序：现有页面样式 → 共享 design-system.css → tokens.css → components.css → 页面绑定。新模板在 `design-system/templates/editorial.html`，不属于发布路由。

## Foundation
- 色彩：背景 #F3F0E8，纸面 #EEE，浮层 #FAF9F5，主文字 #101010，次文字 #53534D，弱文字 #66635D，边线 #B8B5AB；交互 #242421 → #3B3B37 → #101010，禁用 #D9D6CE。Focus 使用 currentColor。深底使用 #F4F1E9。原作品的强调色不迁移、不删除。
- 间距：4/8/12/16/24/32/48/64/96/128。Page gutter 手机16、平板32、桌面48；Section 64/96/128。Container padding24、Grid gap24/32、Component gap12。页面绑定旧 --pad/--page-pad/--editorial-gutter 到同一个 token。
- 栅格：<768 四列、768–1199 八列、≥1200 十二列，max1600。创意满幅区域不强制套max-width；正文最大40rem。不要把已有非对称构图改为均分网格。
- 字体：Display XL/L/M，H1–H4均在tokens.css定义clamp；Body 18/16/14，Caption/Label12，Index14/tabular-nums。正文1.65，标题1.15，展示字.95，标签1.45。中文正文不加字距、不强制全大写；拉丁label可用.09em。首页BANCI逐字伸缩和作品图片内字体为品牌例外，不重排。
- 圆角：0/4/8/999；内容卡片默认0，浮层/工具控件8，pill仅明确的功能需要。圆环卡片原有创意圆角保留。
- 动效：Micro150、Hover220、Reveal500ms，stagger60；standard(.2,.75,.2,1)、out(.16,1,.3,1)。reduced-motion token归零；原共享规则让reveal直接可见。环廊自动播放尊重已有减少动态设置。

## Component contracts
|组件|Variant / Size|State与规则|
|---|---|---|
|Button `.ds-button`|primary/secondary(默认)/text/icon；sm44/md48/lg56|default/hover/active/focus-visible/disabled；44最小点击尺寸；touch无粘滞hover；原生button执行动作，a进行导航|
|Text link `.ds-link`|inline/navigation|保留下划线或明确链接样式；focus-visible；不得仅依赖颜色区分|
|Navigation|desktop/mobile；light/dark|aria-current标识路由；汉堡↔关闭、Escape及焦点行为复用nav-system.js；高度60；亚克力材质保留|
|Project Card `.ds-project-card`|index/editorial/archive|index方角；archive为圆环例外；图片语义不变，hover/focus反馈一致|
|Section Header|label + heading + optional body|编号与标题同网格；标题H2，label12；页首H1|
|Tag `.ds-tag`|static/filter|静态标签非按钮；filter须button并提供aria-pressed，后续页面迁移时实现|
|Image `.ds-image`|natural/contain/cover|natural完整比例；cover仅明确裁切容器，center center；width/height预留空间；作品图片不统一重裁切|
|Page Header|editorial/index/case/gallery|共享gutter和section，允许不同构图；默认顶部避开header-offset|
|Footer / Back to Top|compact/full；icon44+|按页面节奏留白，返回顶部减少动态时即时滚动；原首页手机隐藏浮动按钮，页脚链接可用|
|Modal|desktop/mobile|dialog原生语义、Escape、焦点恢复；移动端受dvh和safe-area约束、内部可滚动；封面不改|
|Filter / Tab|filter/navigation/panel|本次只规范：filter aria-pressed，导航aria-current，panel需tab/tabpanel与键盘方向键；未上线全站|

## 首页实施
保持圆环DOM、旋转算法、54%移动尺寸、所有图片URL和正文。统一各区块gutter/纵向间距、正文行长、标题层级、按钮状态和触摸范围、modal间距；合并圆环末尾重复白底修正。旧材质important因历史高优先级仍保留；新首页文件仅导航/返回顶部三条声明使用important，作为有注释的迁移桥，不可复制到普通组件。

## 验证与后续
五个视口：1440×1000、1024×900、768×1024、390×844、375×812。前后截图和测量由 `design-system-pilot/qa.mjs` 生成。另做菜单、下一张、modal/Escape、reduced-motion与内容/路由不变性检查。
`tests/rendered-html.test.mjs` 是旧starter占位页测试，不能用来证明当前站可用。本次使用构建、validate-site和真实浏览器检查。
未完成：其他38个页面仅审计未迁移；iPhone Safari折射/安全区真机、实际网络性能、首页圆环移动裁切另行处理。禁止把这些事项写成已通过。

## 回滚与推进
分支 `design-system/home-pilot-20261014`，基线 `97553a6`。分支中的试点提交可独立revert；不要reset或清理用户文件。未上传生产环境。
首页验收后按Work → 项目详情 → AKU → About → Contact → 其他页面推进，每次独立提交、内容不变性检查和对应视口截图。新增页面使用模板与tokens，不再追加全局兜底important。
