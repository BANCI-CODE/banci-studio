from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageOps

SOURCE = Path(r"E:\āKU-IP全案\1-AKU-365DAYS插画图")
OUTPUT = Path("site/aku-spiral")
MANIFEST = Path("site/aku-spiral.json")
EXTENSIONS = {".png", ".jpg", ".jpeg"}
TARGET = 640


def group(path: Path) -> str:
    name = path.name
    if "字体版本" in name:
        return "TYPE"
    if "卡片版式" in name:
        return "CARD"
    if "正方形" in name or "贴纸" in name:
        return "STICKER"
    if any(word in name for word in ("Mockup", "mockup", "样机", "名片", "明信片")):
        return "OBJECT"
    if "TODAY" in name and not any(word in name for word in ("视频", "小红书", "过程")):
        return "DAILY"
    return "OTHER"


def title(path: Path) -> str:
    value = path.stem
    value = re.sub(r"^(?:ā?KU[-_ ]*)+", "", value, flags=re.I)
    value = re.sub(r"(?:字体版本|正方形|贴纸|卡片版式|TODAY|周\d+)", " ", value, flags=re.I)
    value = re.sub(r"[-_ ]*\d{1,3}[-_ ]*", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip("-_ ") or path.stem


files = sorted(
    (p for p in SOURCE.rglob("*") if p.is_file() and p.suffix.lower() in EXTENSIONS),
    key=lambda p: str(p).lower(),
)

buckets = {name: [] for name in ("DAILY", "TYPE", "CARD", "STICKER", "OBJECT", "OTHER")}
seen = set()
for path in files:
    category = group(path)
    if any(word in path.name for word in ("线稿", "绘画过程", "过程图", "视频", "小红书")):
        continue
    key = (category, title(path))
    if key in seen:
        continue
    seen.add(key)
    buckets[category].append(path)

limits = {"DAILY": 196, "TYPE": 38, "CARD": 87, "STICKER": 100, "OBJECT": 219}
selected = []
for category in ("DAILY", "TYPE", "CARD", "STICKER", "OBJECT"):
    selected.extend((category, path) for path in buckets[category][: limits[category]])

if len(selected) < TARGET:
    used = {path for _, path in selected}
    selected.extend(("OTHER", path) for path in buckets["OTHER"] if path not in used)
selected = selected[:TARGET]

OUTPUT.mkdir(parents=True, exist_ok=True)
records, errors = [], []
for index, (category, source) in enumerate(selected, 1):
    destination = OUTPUT / f"spiral-{index:03d}.webp"
    try:
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw)
            image.thumbnail((1050, 1300), Image.Resampling.LANCZOS)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            image.save(destination, "WEBP", quality=78, method=6)
            records.append({
                "index": index,
                "category": category,
                "title": title(source),
                "src": f"/aku-spiral/{destination.name}",
                "width": image.width,
                "height": image.height,
                "ratio": round(image.width / image.height, 5),
            })
    except Exception as exc:
        errors.append({"file": source.name, "error": str(exc)})

manifest = {
    "sourceTotal": len(files),
    "count": len(records),
    "errors": errors,
    "categories": {key: sum(item["category"] == key for item in records) for key in buckets},
    "items": records,
}
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({key: manifest[key] for key in ("sourceTotal", "count", "categories")}, ensure_ascii=False))
