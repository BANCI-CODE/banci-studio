from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(r"E:\BaiduNetdiskDownload\01-AIRSEEKERS-素材")
OUTPUT = Path("site/case-media/airseekers-v2")
MANIFEST = OUTPUT / "manifest.json"

# Deliberately curated from the reorganised source library. The order follows the
# case-study narrative instead of filename or file size.
SELECTIONS = [
    ("hero", "8.产品图片/银色背景科技感主图-01.png"),
    ("product-context", "8.产品图片/草坪车模.png"),
    ("product-detail", "8.产品图片/腔体V2.png"),
    ("product-system", "8.产品图片/APP-tron.png"),
    ("brand-book", "1.品牌手册/Free_Square_Brochure_Mockup_1-品牌手册.jpg"),
    ("brand-principle", "1.品牌手册/Descriptive Tron product details.png"),
    ("brand-shell", "1.品牌手册/外壳样式-03.png"),
    ("brand-guideline", "1.品牌手册/品牌手册2.0.4-打印版_画板 1.png"),
    ("identity-logo", "6.公司形象设计/LOGO样式.png"),
    ("identity-card", "6.公司形象设计/名片效果.png"),
    ("identity-office", "6.公司形象设计/办公室门牌.png"),
    ("identity-kit", "6.公司形象设计/Free cardholder with cards mockup.png"),
    ("packaging-hero", "2.主配包装/free-packaging-box-mockup-1.png"),
    ("packaging-structure", "2.主配包装/包装-爆炸图-Poster_Mockup_3.jpg"),
    ("packaging-inside", "2.主配包装/包装箱内包装.jpg"),
    ("packaging-guide", "2.主配包装/快速指引-Poster_Mockup_3.jpg"),
    ("instruction", "3.安装图例说明/安装指南.png"),
    ("instruction-wheel", "3.安装图例说明/前轮安装指南_画板 1.png"),
    ("accessory-system", "9.配件素材/割草机器人_ROBOTIC LAWN MOWER (Standard suit).jpg"),
    ("accessory-shell", "9.配件素材/外壳_DECORATIVE SHELL.png"),
    ("campaign-hero", "4.AMAZON推广图/广告图/4.产品核心场景1个.png"),
    ("campaign-feature", "4.AMAZON推广图/广告图/3.产品核心卖点3个.png"),
    ("campaign-page", "4.AMAZON推广图/广告图/1.众筹界面.png"),
    ("campaign-mobile", "4.AMAZON推广图/广告图/04手机.png"),
    ("exhibition", "5.展会设计/背板-最终版.jpg"),
    ("exhibition-detail", "5.展会设计/平铺多张圆角名片样机.jpg"),
]


def export(source: Path, destination: Path) -> tuple[int, int]:
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        image.thumbnail((2400, 2000), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=86, method=6)
        return image.width, image.height


records = []
missing = []
for key, relative in SELECTIONS:
    source = ROOT / Path(relative)
    if not source.exists():
        missing.append(relative)
        continue
    destination = OUTPUT / f"{key}.webp"
    try:
        width, height = export(source, destination)
    except Exception as exc:
        missing.append(f"{relative}: {exc}")
        continue
    records.append(
        {
            "key": key,
            "src": f"/case-media/airseekers-v2/{destination.name}",
            "source": relative.replace("\\", "/"),
            "width": width,
            "height": height,
            "ratio": round(width / height, 4),
        }
    )

MANIFEST.write_text(
    json.dumps({"items": records, "missing": missing}, ensure_ascii=False, indent=2),
    encoding="utf-8",
)
print(json.dumps({"exported": len(records), "missing": missing}, ensure_ascii=False))
