# BANCI Studio — Image Art Direction Audit

This audit records the current image choice without replacing user-selected assets. The data layer now supports `desktopSrc`, `mobileSrc`, `objectPositionDesktop`, `objectPositionMobile`, and `fitMode`. An empty `mobileSrc` falls back to `desktopSrc`.

| Project | Current image | Problem | Recommended image type | Recommended aspect ratio |
|---|---|---|---|---|
| AIRSEEKERS TRON | `/work/airseekers-featured-2026.jpg` | 16:9 source matches the homepage stage; mobile may still need a tighter product-safe composition. | Mobile-specific product hero if the product becomes too small. | Desktop 16:9; mobile 4:3 |
| MOVA AI Charger | `/home/mova-featured-2026.jpg` | 16:9 source is structurally compatible; screen details may become too small on narrow phones. | Mobile crop focused on screen and interaction state. | Desktop 16:9; mobile 4:3 |
| FANTAWILD Content System | `/home/fantawild-featured-2026.jpg` | 16:9 source fits the homepage, but dense editorial details need a phone-safe focal area. | Simplified mobile editorial crop with fewer small details. | Desktop 16:9; mobile 4:3 |
| AI Creative Workflow | `/home/ai-workflow-featured-2026.jpg` | 16:9 source fits; mobile needs the workflow subject kept inside the safe center. | Mobile-specific workflow crop only if later approved. | Desktop 16:9; mobile 4:3 |
| FORKTECH | `/case-media/forktech-final/forktech-01.webp` | Portrait source can lose top/bottom context in landscape and fixed preview frames. | Landscape identity-system overview. | 4:3 or 16:10 |
| BAIDU | `/case-media/baidu-preview.webp` | 16:9 source is suitable; verify text safe area when reused in portrait preview. | Portrait-safe campaign detail for Work preview, if supplied. | 4:5 preview; 16:9 hero |
| SHANBENQING | `/case-media/shanbenqing/shanbenqing-01.webp` | Near-16:9 source is suitable for wide use; packaging may need a tighter phone composition. | Packaging hero with central product group. | Desktop 16:9; mobile 4:3 |
| KAMINGO | `/case-media/kamingo/kamingo-01.webp` | Near-square source may crop unpredictably in wide containers. | Dedicated wide exhibition/brand overview. | 4:3 or 16:9 |
| AKU World | `/work/aku.png` | Wide art would be cropped by a forced cover rule. | Preserve the full composition; current `contain` setting is intentional. | Preserve original 16:9-like ratio |
| CREATIVE LAB | `/case-media/creative-lab/creative-lab-01.webp` | Portrait source is vulnerable in wide containers. | Landscape archive overview or approved mobile/desktop pair. | Desktop 4:3; mobile 4:5 |

No replacement image was selected automatically in this phase.
