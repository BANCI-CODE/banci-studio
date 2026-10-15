# 首页试点交付记录

日期：2026-10-15。分支 design-system/home-pilot-20261014，基线97553a6。

|阶段|修改内容 / 文件|解决的问题|未解决与风险|
|---|---|---|---|
|1 Audit|DESIGN_AUDIT.md、design-system/audit-inventory.json|扫描39页面54CSS，分类827个important及断点/边距/组件冲突|线上站读取失败，以本地为准；不是全站视觉验收|
|2 Foundation|site/system/tokens.css|集中颜色、4px间距、字体、4/8/12列、圆角、150/220/500ms动效|仅首页加载；旧页面不自动切换|
|3 Components|site/system/components.css、DESIGN_SYSTEM.md|按钮variant/size/state、文字/图片/标签/栅格可复用契约|既有复杂导航仍存在legacy重要性覆盖，桥接有限使用important|
|4 Homepage|site/system/home.css、site/index.html、site/home-archive/archive.css|统一左右线、section节奏、正文行高、控件触摸尺寸；合并重复材质补丁|圆环几何不变，手机后排裁切仍是已知问题，不在此轮强行修复|
|5 Responsive/Motion|五种视口截图+interactions.json|没有页面级横向溢出；资源完整；下一张/弹窗/Escape/菜单打开/减少动态检查通过|Chrome模拟不等于Safari真机；未验证iOS折射与安全区|
|6 QA/Docs|DESIGN_SYSTEM.md、editorial模板、本记录|构建39HTML/3846文件/缺失0；首页文字、素材URL、导航目标不变|旧starter测试不适用于当前静态站，未声称通过；未部署生产|

## 本次改动文件
- site/index.html：仅增加ds-home作用域及三份样式引用。
- site/system/tokens.css、components.css、home.css：基础系统与首页适配。
- site/home-archive/archive.css：合并末尾多次白卡/背面修复，最终材质保持。
- DESIGN_AUDIT.md、DESIGN_SYSTEM.md、design-system/audit-inventory.json、design-system/templates/editorial.html、design-system/PILOT_REPORT.md。
- 根目录index.html、home-archive/archive.css、system/*为部署镜像，由构建同步。

## 验证结论
首页原始文字及图片URL/导航链接逐项比较一致。1440、1024、768、390、375：页面级横向溢出均false，已加载损坏图片0，脚本异常0。1440、390、375下减少动态开启、换卡、弹窗适配、Escape关闭通过；移动菜单aria-expanded变为true。检查未包括全部菜单焦点循环和真实设备触摸手势，需后续真机验收。
前后截图见工作目录 design-system-pilot/comparison.html；表格数据见before/report.json、after/report.json、interactions.json。39个路由不增删，其他页面源码未修改。首页试点完成后等待视觉验收，再逐页迁移。
