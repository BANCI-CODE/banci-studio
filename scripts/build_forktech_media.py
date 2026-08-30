from pathlib import Path
from PIL import Image, ImageOps

root = Path(r"D:\2025-08-10-叉子科技有限公司")
output = Path("site/case-media/forktech-final")
names = [
    "1107-FT-logo-12.png", "1107-FT-logo-03.png", "1107-FT-logo-08.png",
    "1107-FT-logo-07.png", "LOGO玻璃-FT.png", "LOGO玻璃-icon.png",
    "Brand Identity Mockup.jpg", "Business_Card_Mockup_2-EN.png",
    "Business_Card_Mockup_2-CN.png", "双面名片样机-纸质-en.png",
    "Free_Stationery_Mockup_2.png", "Free_Stationery_Mockup_2-02.png",
    "Free Corporation Papers Set Mockup-02.png", "Paper_Bag_Mockup_1.png",
    "Free-Bag-Mockup.png", "T-shirt Mockup.png", "T-shirt Mockup-02.png",
    "Office Glass Mockup.png", "Office Glass Mockup-02.png",
    "Acrylic Cube Lightbox Mockup.png", "Cube_Banner_Mockup_2.png",
    "Free Urban Horizontal Advertising Billboard Mockup.png",
    "Free_G_Mockups_iMac_24_Inch.png", "正面苹果电脑屏幕样机.png",
    "正面苹果电脑屏幕样机-02.png", "Blue Matcha Mockup.png",
    "Blue Matcha Mockup02.png", "工作证.jpg", "Image0001.png",
]

output.mkdir(parents=True, exist_ok=True)
count = 0
for name in names:
    source = root / name
    if not source.exists():
        continue
    try:
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw)
            if image.width < 600 or image.height < 450:
                continue
            image.thumbnail((1800, 1500), Image.Resampling.LANCZOS)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGB")
            count += 1
            image.save(output / f"forktech-{count:02d}.webp", "WEBP", quality=84, method=6)
    except Exception:
        pass
print(count)
