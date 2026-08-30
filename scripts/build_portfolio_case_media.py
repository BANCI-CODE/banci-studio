from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps

OUTPUT = Path("site/case-media")
MANIFEST = Path("site/content/project-media.json")
EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
PROJECTS = {
    "airseekers": {
        "root": Path(r"E:\BaiduNetdiskDownload\01-AIRSEEKERS-素材"),
        "keywords": ["WEB-jpg", "web整理", "airseekers-VI手册", "AIRSEEKERS-规范", "广告图", "配件", "图片2027"],
    },
    "mova": {
        "root": Path(r"E:\BaiduNetdiskDownload\02-MOVA-素材"),
        "keywords": ["V.2.0-70W2C-UI界面-0323", "UI营销流程说明", "70W2C带屏幕产品合成图", "渲染图", "详情页"],
    },
    "forktech": {
        "root": Path(r"D:\2025-08-10-叉子科技有限公司"),
        "keywords": ["品牌建设图片", "案例", "150ppi", "VIS-P", "LOGO3.0", "LOGO2.0", "包装"],
    },
}
EXCLUDE = ("参考", "素材", "截图", "微信图片", "过程", "草图", "线稿", "二维码", "icon", "ICON")


def score(path: Path, keywords: list[str]) -> tuple[int, int]:
    text = str(path)
    keyword_score = sum((len(keywords) - i) * 100 for i, word in enumerate(keywords) if word in text)
    return keyword_score, path.stat().st_size


def export(source: Path, destination: Path):
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        if image.width < 700 or image.height < 500:
            raise ValueError("too small")
        image.thumbnail((1800, 1500), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=82, method=6)
        return image.width, image.height


manifest = {}
for slug, config in PROJECTS.items():
    root = config["root"]
    files = [
        p for p in root.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTENSIONS and not any(word in p.name for word in EXCLUDE)
    ]
    ranked = sorted(files, key=lambda p: score(p, config["keywords"]), reverse=True)
    records, seen = [], set()
    for source in ranked:
        key = source.stem.lower().replace(" ", "")
        if key in seen:
            continue
        try:
            destination = OUTPUT / slug / f"{slug}-{len(records)+1:02d}.webp"
            width, height = export(source, destination)
            records.append({
                "src": f"/case-media/{slug}/{destination.name}",
                "title": source.stem,
                "width": width,
                "height": height,
                "ratio": round(width / height, 4),
            })
            seen.add(key)
            if len(records) >= 36:
                break
        except Exception:
            continue
    manifest[slug] = records

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({slug: len(items) for slug, items in manifest.items()}, ensure_ascii=False))
