# BANCI Studio — Global Mobile QA

Date: 2026-09-07

## Coverage

- Pages: Home, Work, About, Contact, AIRSEEKERS, MOVA, FANTAWILD, AKU World, Evolution Board, AKU Daily, Year Calendar, Pin Archive
- Viewports: 1024, 820, 768, 430, 390, 375, 360 px
- Automated checks: 84 page/viewport combinations

## Result

All 84 checks pass after rebuilding the local output.

- No horizontal page overflow
- No H1/title overflow
- No fixed-header viewport collision
- No unintended body scroll lock
- No off-canvas fixed/sticky interactive control
- No undersized generic button/CTA target

The Work filters now keep a minimum 44 px target width and 54 px target height at tablet widths.

## Interaction review

- Mobile navigation uses a tap-operated full-screen overlay, supports Escape, focus restoration, and body-scroll lock only while open.
- Evolution Board uses pointer hover on desktop and click/tap selection on mobile. Its 365 dense controls intentionally use 25–26 px button hit areas with a smaller visual dot, matching the board-specific interaction specification.
- AKU Daily loads the selected image only; adjacent navigation is explicit rather than hover-only.
- Pin Archive uses tap on mobile, progressive batches through IntersectionObserver, and an accessible bottom sheet that closes by button, scrim, or Escape.
- Year Calendar exposes month selection as buttons and does not require hover.
- Work list links remain directly actionable on mobile; desktop preview is supplemental.

## Viewport and layout safeguards

- AKU full-height layouts use `svh` rather than raw `100vh` where browser chrome affects height.
- Shared responsive gutters prevent zero-edge layouts down to 360 px.
- Mobile layouts reflow to single-column/editorial stacks rather than shrinking typography to unreadable sizes.
- Images retain their configured `cover`/`contain` art direction; no source image is modified.

## Machine-readable evidence

See `reports/mobile-qa.json` for the complete 84-result dataset.
