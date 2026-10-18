# 性能优化第一批 · 2026-10-18

回退提交：b9bb2c0。已写入本地源码并构建，没有推送或部署。

## 已完成
- 构建 HTML 时提前应用导航最终布局类，避免等待 JavaScript 后页头突然缩小；Logo 增加明确尺寸。
- WORK 增加 srcset/sizes，多尺寸副本采用 Lanczos 缩放、无损 WebP 编码并保留 ICC；图片比例、居中裁切、内容和链接不变。仅选择比原件小的副本，保留原件作为最大尺寸候选和 src 回退。
- WORK 第二个案例改为 lazy；首页第二屏作品不再抢 high 优先级。
- 抽卡初次加载不再等待 320ms 抽卡延迟；用户主动抽卡动画保留。慢速/省流网络不预热邻图，快速网络也延后预热。
- 更新受影响脚本版本号。多个 HTML 的修改仅为版本号，不是重新设计页面。

## 验证
构建、git diff --check 通过。WORK 与 AKU 首页在 1440/1024/768/390/375px 无横向溢出。抽卡 DAY195→DAY108，按钮恢复可用，高清图片加载正常；未记录 JS 异常。
58 个不同尺寸副本解码后与同尺寸 Lanczos 参考像素一致（不是与全尺寸原件像素相同）。保留原图；缩略图只用于列表。截图核对见 detail-390.png / detail-1440.png。未做 iPhone 真机和印刷级色彩校准，不宣称全站图片画质验收完成。

## 本地 Lighthouse 复测
优化前是三次中位数，以下优化后为一次复测，属于方向性验证，不应当作稳定统计结论。设备及限速配置沿用审计。抽卡样本随机不同，不把其 LCP 差值当作严格同图对照。INP 尚未测得。

| 页面 | 设备 | 分数 | LCP 秒 | CLS | 传输 MB |
|---|---|---:|---:|---:|---:|
| / | mobile | 98 | 2.11 | 0.0042 | 0.65 |
| /work/ | mobile | 90 | 3.46 | 0.0000 | 0.78 |
| /project/airseekers/ | mobile | 97 | 2.26 | 0.0013 | 0.22 |
| /projects/aku.html | mobile | 99 | 1.81 | 0.0000 | 0.14 |
| /projects/aku-daily.html | mobile | 74 | 10.06 | 0.0663 | 1.78 |
| /projects/aku-evolution.html | mobile | 99 | 1.80 | 0.0026 | 0.71 |
| /projects/aku-calendar.html | mobile | 99 | 1.81 | 0.0000 | 0.28 |
| / | desktop | 100 | 0.49 | 0.0004 | 1.48 |
| /work/ | desktop | 97 | 1.27 | 0.0000 | 1.79 |
| /project/airseekers/ | desktop | 100 | 0.53 | 0.0000 | 0.22 |
| /projects/aku.html | desktop | 100 | 0.41 | 0.0000 | 0.14 |
| /projects/aku-daily.html | desktop | 89 | 2.16 | 0.0015 | 2.31 |
| /projects/aku-evolution.html | desktop | 100 | 0.61 | 0.0015 | 0.71 |
| /projects/aku-calendar.html | desktop | 100 | 0.40 | 0.0002 | 1.18 |

WORK 移动端：此前 LCP 7.66 秒 / 2.06 MB，本轮 3.46 秒 / 0.78 MB。AKU 首页及月历移动端 CLS 本轮为 0。首页 LCP 主要对应标题，不能代表 WebGL 图像显示时间。

## 尚存瓶颈
- Daily 高清长方形原图仍约 1–2MB；本轮移动端 LCP 约 10 秒，尚未达到 2.5 秒目标。后续需单独生成并人工验收适配其展示尺寸的高清版本。
- 首页本轮传输量基本不变，后续应测实际纹理就绪而非只依赖 LCP。
- 尚未调整 Cloudflare，真实部署方式仍需确认。未验证的资源不得设为 immutable。

## 可重复生成
脚本 scripts/generate_work_images.py，依赖 Pillow；在仓库运行 python scripts/generate_work_images.py，再运行 node scripts/build.mjs。原件不覆盖；生成目录 site/performance-images，manifest.json 记录源路径、尺寸及体积。

完整证据保存在 E:/BANCI艺术创作/performance-audit-20261017：after-verified.json、after-r1-*.html/json、qa-after.json、截图。原始基线保留。
