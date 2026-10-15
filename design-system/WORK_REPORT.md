# Work index design-system migration

2026-10-15. Scope: Work index only. Branch: design-system/work-index-20261015.

- Added site/system/work.css and its token binding to site/work/index.html; root copies are deployment mirrors.
- Preserved text, image URLs, destinations, square cards, centered cover crop and the fourteen-series archive.
- Gutter: 48px desktop / 32px tablet / 16px mobile. Section rhythm: existing global 128/96/64 tokens. Labels, body, index and heading roles use existing typography tokens.
- Below 768px, content grids use a single column; section navigation retains two columns and 44px targets.
- Neutral keyboard focus, shared hover timing, reduced-motion image scaling disabled. Two documented important declarations bridge legacy page-head rules; no global override.
- Browser checks at 1440,1024,768,390,375: no horizontal overflow, all fourteen archive entries present, no runtime exceptions. Before/after screenshots stored in E:/BANCI艺术创作/work-system.
- Build and static asset validation completed. No production deployment. Safari hardware testing, remaining page migrations and legacy CSS consolidation are outstanding.
