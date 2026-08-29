# BANCI Studio Portfolio

BANCI 是张世伟的多学科设计作品网站，涵盖品牌设计、产品体验、AI 创作、AKU 日记与个人艺术项目。

## 网站地址

- 主域名：<https://banci.studio/>
- GitHub：<https://github.com/BANCI-CODE/banci-studio>

## 日常更新

1. 修改 `site/` 中的页面、样式和脚本。
2. 把网页使用的压缩图片放入对应的 `site/` 或 `public/` 目录。
3. 在本地运行 `npm run build:github` 检查静态发布文件。
4. 提交并推送到 `main` 分支。

推送后，`.github/workflows/deploy-pages.yml` 会自动构建并发布网站。

## 素材原则

- 原始高清素材保留在本地素材盘，不在仓库中修改。
- GitHub 只保存网站实际使用的 WebP、AVIF、PNG、JPG、JPEG 等网页版本。
- `public/BANCI-Portfolio.pdf` 为大体积源文件，默认不进入仓库和线上站点。

## 本地预览

```bash
npm run dev
```

## 构建 GitHub Pages 版本

```bash
npm run build:github
```

输出目录为 `github-dist/`。该目录由自动化流程生成，不需要手动提交。
