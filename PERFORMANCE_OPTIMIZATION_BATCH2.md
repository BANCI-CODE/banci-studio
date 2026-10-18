# 第二批性能优化 · 2026-10-18

回退点：e9fb2eb。原图保留，未推送或部署。

已写入：
- scripts/generate_aku_images.py：增量生成 480/800/1100px 无损 WebP；保留 ICC、宽高比。仅把小于原件的副本列为候选，原件始终作为最大版本回退。
- site/content/aku/aku-daily.json：新增 portraitVariants，不改标题、故事、顺序及原图字段。
- site/aku-world.js：按实际卡片宽度 × 设备像素密度选择图片；窗口变化后重新匹配清晰版本；预热使用同一选择逻辑。
- site/projects/aku-daily.html：提前请求数据清单，减少配置之后才请求清单的串联等待。
- site/aku-data.js、aku-config.json 及相关 HTML：缓存版本更新。
- site/home-film-preview/film.js：先请求当前卡片，再请求邻近卡片；增加 film-texture-ready 性能标记，不改变形变、轮播或转场。

验证：
- 构建及差异空白检查通过。
- 549 个被列为候选的副本，解码像素与同尺寸 Lanczos 参考图一致，ICC 一致。缩放副本不等同全分辨率原件，高清原件继续保留。
- 480px 副本体积中位数为对应原件约 16.7%；800px 为 44.6%；1100px 为 82.1%。
- 390px / DPR2 需375物理像素，选择480图；放大至1440px / DPR2 需600，自动升级800图。抽卡成功切换，按钮恢复可用，无横向溢出、无 JS 异常。
- 首页纹理加载正常并产生就绪标记。

Lighthouse 13.5，本地同配置各3轮；随机图片不同，仅用于方向性判断：
| 设备 | LCP 中位数 | 性能分中位数 | 本轮传输中位数 |
|---|---:|---:|---:|
| 手机 | 4.06 秒 | 86 | 0.56 MB |
| 桌面 | 0.81 秒 | 100 | 0.54 MB |

原审计手机 LCP 中位数14.11秒、3.37MB；第一批单次10.06秒、1.78MB。不能将随机样本差异解释为严格同图提升率。尚未达到手机2.5秒目标，不继续靠降低画质追分。INP及iPhone真机仍未验证。

执行生成：python scripts/generate_aku_images.py，然后 node scripts/build.mjs。需要 Pillow；无新增前端依赖。
证据：E:/BANCI艺术创作/performance-audit-20261017/batch2-verified.json、quality2.json、qa2.json、daily2-*.png。
