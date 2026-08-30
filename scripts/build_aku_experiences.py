from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(r"E:\āKU-IP全案")
DAILY = ROOT / "1-AKU-365DAYS插画图"
PINS = ROOT / "3-PIN-AKU小贴纸"
CALENDAR = ROOT / "8-AKU-日历产品" / "2025-月历"
OUTPUT = Path("site/aku-experience")
MANIFEST = Path("site/aku-experience.json")
EXTENSIONS = {".png", ".jpg", ".jpeg"}


def web_copy(source: Path, destination: Path, maximum=(1400, 1600), quality=84):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        image.thumbnail(maximum, Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(destination, "WEBP", quality=quality, method=6)
        return image.width, image.height


def clean_title(path: Path) -> str:
    title = path.stem
    title = re.sub(r"^(?:ā?KU[-_ ]*)+", "", title, flags=re.I)
    title = re.sub(r"(?:字体版本|正方形|贴纸|TODAY|周\d+)", "", title, flags=re.I)
    title = re.sub(r"[-_ ]*\d{1,3}[-_ ]*", " ", title)
    return title.strip("-_ ") or path.stem


OUTPUT.mkdir(parents=True, exist_ok=True)
manifest = {"type": [], "pins": [], "months": [], "tear": [], "errors": []}

# Typography versions
type_files = sorted(
    p for p in DAILY.rglob("*")
    if p.is_file() and p.suffix.lower() in EXTENSIONS and "字体版本" in p.name
)
for index, source in enumerate(type_files, 1):
    try:
        dest = OUTPUT / "type" / f"type-{index:02d}.webp"
        width, height = web_copy(source, dest)
        manifest["type"].append({"src": f"/aku-experience/type/{dest.name}", "title": clean_title(source), "width": width, "height": height})
    except Exception as exc:
        manifest["errors"].append({"file": str(source), "error": str(exc)})

# Independent PIN sticker collection
pin_files = sorted(p for p in PINS.rglob("*") if p.is_file() and p.suffix.lower() in EXTENSIONS)
for index, source in enumerate(pin_files, 1):
    try:
        dest = OUTPUT / "pins" / f"pin-{index:02d}.webp"
        width, height = web_copy(source, dest, (1000, 1000))
        manifest["pins"].append({"src": f"/aku-experience/pins/{dest.name}", "title": source.stem, "width": width, "height": height})
    except Exception as exc:
        manifest["errors"].append({"file": str(source), "error": str(exc)})

# Finished month layouts, one per month.
month_files = []
for month in range(1, 13):
    candidates = list(CALENDAR.glob(f"{month}月份-排版-*"))
    if not candidates:
        candidates = [p for p in CALENDAR.glob(f"{month}月-*") if "草图" not in p.name and "线稿" not in p.name]
    if candidates:
        month_files.append((month, sorted(candidates, key=lambda p: (len(p.name), p.name))[0]))
for month, source in month_files:
    try:
        dest = OUTPUT / "months" / f"month-{month:02d}.webp"
        width, height = web_copy(source, dest, (1500, 1500), 86)
        manifest["months"].append({"month": month, "src": f"/aku-experience/months/{dest.name}", "title": source.stem, "width": width, "height": height})
    except Exception as exc:
        manifest["errors"].append({"file": str(source), "error": str(exc)})

# Square daily calendar: named square exports first, then other genuine square artwork.
all_daily = sorted(p for p in DAILY.rglob("*") if p.is_file() and p.suffix.lower() in EXTENSIONS)
named_square = [p for p in all_daily if ("正方形-AKU" in p.name or "AKU正方形贴纸" in p.name) and "线稿" not in p.name]
seen = set()
square_sources = []
for source in named_square:
    key = clean_title(source)
    if key not in seen:
        seen.add(key)
        square_sources.append(source)

if len(square_sources) < 206:
    for source in all_daily:
        if source in square_sources or any(token in source.name for token in ("过程", "Mockup", "mockup", "样机", "字体版本")):
            continue
        try:
            with Image.open(source) as image:
                ratio = image.width / image.height
            if .97 <= ratio <= 1.03:
                key = clean_title(source)
                if key not in seen:
                    seen.add(key)
                    square_sources.append(source)
            if len(square_sources) >= 206:
                break
        except Exception:
            pass

for index, source in enumerate(square_sources[:206], 1):
    try:
        dest = OUTPUT / "tear" / f"tear-{index:03d}.webp"
        width, height = web_copy(source, dest, (1100, 1100), 83)
        manifest["tear"].append({"day": index, "src": f"/aku-experience/tear/{dest.name}", "title": clean_title(source), "width": width, "height": height})
    except Exception as exc:
        manifest["errors"].append({"file": str(source), "error": str(exc)})

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({key: len(value) for key, value in manifest.items()}, ensure_ascii=False))
