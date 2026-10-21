# Portfolio typography system — 2026-10-21

## Confirmed direction

The author confirmed Alibaba PuHuiTi for reading text. PSD text layer metadata in `06Contact/01-尾页感谢.psd` confirms BebasNeue for CONTACT / NEXT COLLABORATION, and AlimamaShuHeiTi-Bold for the main Chinese closing statement.

- English display: Bebas Neue.
- Chinese display: Alimama ShuHeiTi.
- Body, captions, buttons and supporting UI: Alibaba PuHuiTi Regular / Medium.
- BANCI logotype and compressed BANCI.STUDIO masthead retained.

## Responsive hierarchy

| Role | Desktop | Mobile |
| --- | --- | --- |
| Page headline | 56–128 px | 44–76 px |
| Section heading | 32–64 px | 30–42 px |
| Project / item title | 23–34 px | 22–28 px |
| Lead / subtitle | 19–26 px | 18 px |
| Body | 16–18 px | 15 px |
| Caption / metadata | 12–13 px | 12 px |

Chinese display tracking is zero; Latin display tracking -0.01em; metadata +0.025–0.07em. Reading copy uses 1.75 line height; leads 1.6; headings 1.12 / CJK 1.22. Paragraphs use pretty wrapping, headings balance, and long reading blocks have a 38em maximum measure.

Homepage canvas uses the same families: title 76/82 source units, description 38/50, a 2:1 font-size ratio. Both are limited to two lines; descriptions balance full words and CJK characters. Full descriptions remain in the DOM and project pages. Rear ticket labels use PuHui for clarity. Material, images, ordering and elastic movement are retained.

## Fonts and loading

Self-hosted, content-hashed WOFF2. Official ShuHei webfont is unchanged (about 663 KiB); PuHui subsets about 216/214 KiB and Bebas about 11 KiB. The earlier IBM/Noto assets remain for rollback but are unused. Canvas waits for required fonts before creating text textures. No font calls to third-party servers at runtime.

The PDF is image-only; no editable text/font metadata could be read from it. Font evidence came from the matching editable PSD, with the author's correction for body type.

## Verification

Local and GitHub builds and JS syntax/diff checks pass. Chrome checks cover homepage, Work, About, Contact, Notes, Lab, AIRSEEKERS, MOVA, Baidu, Fantawild and AKU at desktop/mobile sizes, plus 320/768 width checks for primary pages. No horizontal overflow, font failures or JavaScript exceptions in 28 combinations. Contact heading was visually checked for orphan text; card wrapping is measured against all 22 current items. Safari/iPhone hardware remains untested. No production deployment.
