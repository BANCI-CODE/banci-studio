# BANCI 个人作品集 — 完整静态源码

包含全站 23 个 HTML 页面、CSS、JavaScript、网站图片与内容数据。TRON App 已整合进 AIRSEEKERS 案例。原始素材盘、开发缓存和原托管账户配置不属于运行所需文件，未打包。

## 本地使用
安装 Node.js 20 或以上版本，无需安装 npm 依赖。
在 source 文件夹打开终端：
```
npm run build
npm run dev
```
浏览器打开 http://127.0.0.1:4173 。修改 site 下的 HTML/CSS/JS 后重新 build。

## 自己上传
直接上传版 ZIP 中的内容已经构建完成。解压后，将 index.html 及其同级所有文件夹一起上传到网站根目录。不要只上传 HTML。
若从源码重新导出：运行 npm run build:github，上传 github-dist 内全部内容。
页面使用根路径 / 开头的资源链接，适用于独立域名或站点根目录；部署到 /仓库名/ 子路径前需要调整路径。
导出器保留原站点 CNAME banci.studio。使用其他域名时删除或修改 CNAME，同时检查 site 中的 canonical 和网站地址配置。
无需运行服务器端业务代码，普通静态托管即可。请通过 HTTP 预览，不建议双击 HTML。

## 文件位置
- site：各页面、交互、共享样式和案例素材。
- site/project/airseekers：AIRSEEKERS 案例与图片阅读器。
- site/case-media/tron-app：新增完整 App 屏幕与网站设计图。
- site/design-system.css：全站最终视觉规则，包含本次间距修正。
- site/content：项目等内容数据。
- public：公共素材。
- app/globals.css：构建所用补充样式。
- scripts：完整构建、预览和引用检查脚本。
- reports：项目检查记录；旧报告保留其原始检查时间。

联系邮箱、简历等仍按现有配置显示；若要公开，请自行填写真实信息。此次未上传或发布网站。
