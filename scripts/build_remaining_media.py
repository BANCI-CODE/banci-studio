from pathlib import Path
from PIL import Image, ImageOps

EXT = {".png", ".jpg", ".jpeg", ".webp"}

def save(source, dest):
    with Image.open(source) as raw:
        image = ImageOps.exif_transpose(raw)
        if image.width < 600 or image.height < 450:
            return False
        image.thumbnail((1800, 1500), Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        dest.parent.mkdir(parents=True, exist_ok=True)
        image.save(dest, "WEBP", quality=82, method=6)
        return True

def export_named(root, names, slug):
    out = Path("site/case-media") / slug
    count = 0
    for name in names:
        source = root / name
        if source.exists():
            try:
                if save(source, out / f"{slug}-{count+1:02d}.webp"):
                    count += 1
            except Exception:
                pass
    return count

shan = export_named(Path(r"E:\BANCI设计项目方案合集\山太清-设计案"), [
    "最终效果/案例效果图展示-1.png", "最终效果/案例效果图展示-瓶贴方案2.png",
    "最终效果/案例效果图展示-盒子方案2.png", "最终效果/案例效果图展示-袋子.png",
    "展示案例/主LOGO-1.png", "展示案例/主LOGO-2.png", "展示案例/1-2.png",
    "展示案例/1-3.png", "展示案例/1-4.png", "展示案例/1-5.png", "展示案例/1-6.png",
    "展示案例/1-7.png", "展示案例/1-8.png", "展示案例/1-9.png", "展示案例/2-2.png",
    "展示案例/2-3.png", "展示案例/2-4.png", "展示案例/2-5.png", "展示案例/2-6.png",
    "主视觉/产品主图.png", "主视觉/主图.png", "主视觉/山冭清主视觉-瓶子.png",
    "主视觉/产品类/酒展示.png", "主视觉/产品类/酒展示2.png", "主视觉/产品类/酒展示3.png",
    "主视觉/邀请海报.png", "LOGO效果/Brand Identity Mockup.png", "LOGO效果/White Logo Mockup-山冭清.png"
], "shanbenqing")

kamingo = export_named(Path(r"D:\2025-10-08-Kamingo"), [
    "品牌LOGO/Kamingo logo_transparent.png", "品牌LOGO/1112-Kamingo-LOGO_画板 1.png",
    "品牌LOGO/Free Modern Logo Mockup 2019.jpg", "品牌LOGO/Logo_on_the_Builiding_Mockup_1-01.png",
    "品牌LOGO/Mockup-01.jpg", "品牌LOGO/Mockup-02.jpg", "品牌LOGO/t-shirt logo mockup-01.jpg",
    "品牌LOGO/t-shirt logo mockup02.jpg", "品牌LOGO/Outdoor Screen Mockup.jpg",
    "品牌LOGO/Outdoor Screen Mockup-01.jpg", "品牌LOGO/Outdoor Screen Mockup-02.jpg",
    "品牌LOGO/Free Rectangle Pennant Flag Mockup.png", "品牌LOGO/Bracelet Mockup.jpg",
    "品牌LOGO/Gravity Cups Mockup.jpg", "品牌LOGO/电池-01.jpg", "品牌LOGO/电池-02.jpg",
    "2026-05-16-6展会视觉设计/合成图01.png", "2026-05-16-6展会视觉设计/合成图02.png",
    "2026-05-16-6展会视觉设计/合成图03.png", "2026-05-16-6展会视觉设计/合成图04.png",
    "150ppi/资源 1@150x.png", "150ppi/资源 2@150x.png"
], "kamingo")

lab_root = Path(r"E:\BANCI艺术创作")
lab_out = Path("site/case-media/creative-lab")
lab_count = 0
for folder in sorted([p for p in lab_root.iterdir() if p.is_dir()]):
    candidates = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in EXT]
    candidates.sort(key=lambda p: p.stat().st_size, reverse=True)
    for source in candidates[:8]:
        try:
            if save(source, lab_out / f"creative-lab-{lab_count+1:02d}.webp"):
                lab_count += 1
                break
        except Exception:
            pass
    if lab_count >= 24:
        break

print({"shanbenqing": shan, "kamingo": kamingo, "creative-lab": lab_count})
