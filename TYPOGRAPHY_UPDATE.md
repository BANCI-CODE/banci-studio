# Typography pairing — 2026-10-21

- Latin UI, headlines and captions: IBM Plex Sans 400/500/600/700, locally hosted as Banci Sans.
- Chinese: Noto Sans SC 400/600, locally hosted as Banci Han; system fallback for newly added characters.
- BANCI logotype, compressed homepage masthead and project-specific serif accents retained.
- CJK heading tracking reduced from .065em to 0; paragraph tracking from .045em to .005em. Heading/body line heights 1.24/1.72.
- Homepage canvas uses the same pairing and waits for its four font faces before text texture generation.
- All HTML receives shared typography through both build targets. Content-hashed WOFF2, no runtime external font requests.
- Modified fonts have distinct internal family and weight names. Original OFL licenses are included in site/fonts.
- Full font payload about 484 KiB; CJK subsets include 1,474 CJK/punctuation characters from existing HTML, JS and JSON. No image assets or routes changed.

## Maintenance

With Python fonttools + brotli installed, run `python scripts/subset-fonts.py` after adding copy. It downloads official sources to .cache/font-sources, prints new hashed assets, and preserves current published files. Review and update typography.css URLs before building.

## Validation

Local and GitHub builds pass. Chrome desktop 1440×1000 and mobile 390×844: homepage, Work and AIRSEEKERS render without horizontal overflow, missing font faces or JS exceptions. Homepage card loader completes. Real Safari/iPhone rendering has not been tested.
