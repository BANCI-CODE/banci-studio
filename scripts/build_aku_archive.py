from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from PIL import Image, ImageOps

SOURCE = Path(r"E:\āKU-IP全案\1-AKU-365DAYS插画图")
OUTPUT = Path("site/aku-archive")
MANIFEST = Path("site/aku-archive.json")
EXTENSIONS = {".png", ".jpg", ".jpeg"}
EXCLUDED_PRIMARY = ("字体版本", "小红书", "视频", "GIF", "绘画过程", "卡片", "贴纸", "Mockup", "mockup", "样机")
DAY_PATTERN = re.compile(r"TODAY[-—_ ]*0*(\d{1,3})", re.IGNORECASE)


def category(name: str) -> str:
    labels = (
        ("绘画过程", "process"),
        ("卡片版式", "card"),
        ("正方形贴纸", "sticker"),
        ("Mockup", "mockup"),
        ("mockup", "mockup"),
        ("样机", "mockup"),
        ("字体版本", "type"),
        ("TODAY", "daily"),
    )
    for token, label in labels:
        if token in name:
            return label
    return "other"


files = sorted(
    (path for path in SOURCE.rglob("*") if path.is_file() and path.suffix.lower() in EXTENSIONS),
    key=lambda path: str(path).lower(),
)

by_day: dict[int, list[Path]] = defaultdict(list)
category_counts = Counter()
for path in files:
    category_counts[category(path.name)] += 1
    match = DAY_PATTERN.search(path.name)
    if match and not any(token in path.name for token in EXCLUDED_PRIMARY):
        day = int(match.group(1))
        if 1 <= day <= 365:
            by_day[day].append(path)

OUTPUT.mkdir(parents=True, exist_ok=True)
records = []
errors = []

for day in sorted(by_day):
    candidates = by_day[day]
    # Prefer the cleanest, most compact standard TODAY export when duplicates exist.
    source = sorted(candidates, key=lambda path: (len(path.name), path.stat().st_size))[0]
    title_match = re.search(rf"TODAY[-—_ ]*0*{day}[-—_ ]*(.*?)(?:\.[^.]+)$", source.name, re.IGNORECASE)
    title = (title_match.group(1).strip("-—_ ") if title_match else "") or f"Day {day:03d}"
    destination = OUTPUT / f"day-{day:03d}.webp"
    try:
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw)
            image.thumbnail((1200, 1600), Image.Resampling.LANCZOS)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            image.save(destination, "WEBP", quality=82, method=6)
            records.append(
                {
                    "day": day,
                    "week": (day - 1) // 7 + 1,
                    "title": title,
                    "src": f"/aku-archive/{destination.name}",
                    "width": image.width,
                    "height": image.height,
                    "ratio": round(image.width / image.height, 4),
                }
            )
    except Exception as exc:
        errors.append({"day": day, "file": source.name, "error": str(exc)})

manifest = {
    "sourceTotal": len(files),
    "sourceSizeBytes": sum(path.stat().st_size for path in files),
    "dailyCount": len(records),
    "dayMin": records[0]["day"] if records else None,
    "dayMax": records[-1]["day"] if records else None,
    "categories": dict(category_counts),
    "errors": errors,
    "items": records,
}
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({key: manifest[key] for key in ("sourceTotal", "dailyCount", "dayMin", "dayMax")}, ensure_ascii=False))
