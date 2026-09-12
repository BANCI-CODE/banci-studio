# BANCI Studio — Image Performance

Date: 2026-09-07

## Implemented rules

- Web delivery prefers WebP; original JPG/WebP source files remain untouched.
- Featured desktop covers are capped at 1920 px; mobile variants are 800 px.
- Homepage practice images use separate desktop and mobile derivatives.
- The AIRSEEKERS identity image now uses a 1600 px / 599 KB WebP derivative instead of the 1.74 MB source.
- Critical case imagery uses `loading="eager"`, `fetchpriority="high"`, and asynchronous decoding.
- Non-critical static images are converted at build time to IntersectionObserver loading with a 240 px prefetch margin.
- Build output adds intrinsic `width` and `height` to local raster images whenever dimensions can be read, reducing layout shift.
- Dynamically rendered homepage covers use responsive `<picture>` art direction and do not download desktop and mobile files together.

## Measured initial transfer

Measurements use local production output, Chrome resource timing, and a 900 px viewport height. Values include images, CSS, JavaScript, JSON, and fonts requested during the initial view.

| Page | Desktop 1440 | Mobile 390 |
|---|---:|---:|
| Home | 1603 KB | 556 KB |
| Work | 397 KB | 156 KB |
| AIRSEEKERS | 122 KB | 122 KB |
| AKU World | 93 KB | 93 KB |
| Evolution Board | 120 KB | 120 KB |
| AKU Daily | 156 KB | 156 KB |
| Year Calendar | 95 KB | 95 KB |
| Pin Archive | 102 KB | 108 KB |

The detailed resource list is stored in `reports/image-performance.json`.

## Generated cover sizes

- AIRSEEKERS: 289 KB desktop / 48 KB mobile
- MOVA: 152 KB desktop / 37 KB mobile
- FANTAWILD: 256 KB desktop / 61 KB mobile
- AI WORKFLOW: 157 KB desktop / 28 KB mobile
- AKU practice: 61 KB desktop / 20 KB mobile
- Creative Lab practice: 559 KB desktop / 172 KB mobile

## AKU scalability

- Evolution renders metadata-only dots; preview images load on demand.
- Daily keeps the current view and adjacent navigation rather than loading an archive grid.
- Pin Archive uses progressive batches and IntersectionObserver.
- Calendar starts from lightweight month controls/thumb state and loads selected imagery on demand.
- Increasing the data set to 365 or more entries does not add all source images to the initial request.

## Reproduction

- Generate derivatives: `python scripts/optimize_portfolio_images.py`
- Build local output: `node scripts/build.mjs`
- Run transfer audit: `node scripts/qa-image-performance.mjs`
