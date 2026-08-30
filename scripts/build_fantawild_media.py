from pathlib import Path
from PIL import Image, ImageOps

root = Path(r"E:\BaiduNetdiskDownload\03-华强方特-素材")
output = Path("site/case-media/fantawild")
names = [
    "赣州条漫整理.jpg", "赣州开园条漫上色-展开.jpg", "赣州开园条漫上色-未展开.jpg",
    "国庆节条漫.jpg", "国庆节条漫-完成稿-3.jpg", "合作条漫.jpg", "合作条漫(1).jpg",
    "双十一条漫-完整版.jpg", "双十一条漫-上色.jpg", "双十一主图-线稿.jpg",
    "护士节条漫排版.jpg", "护士节草稿.jpg", "元旦条漫线稿.jpg", "元旦条漫线稿-横向.jpg",
    "复盘.png", "分析复盘.jpg", "P1-P13-100周年H5完成.jpg", "六一长图文切图.jpg",
    "重返原始时代-横版.jpg", "彩色切图/重返原始时代-横版_08.jpg",
    "线稿切图/重返原始时代-横版_08.jpg", "方特欢乐世界插画版原型图.jpg",
    "方特欢乐世界官网-红色版.jpg", "品牌计划推广视频界面成图展示.jpg"
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
            max_width = 1600
            if image.width > max_width:
                height = round(image.height * max_width / image.width)
                image = image.resize((max_width, height), Image.Resampling.LANCZOS)
            if image.height > 12000:
                width = round(image.width * 12000 / image.height)
                image = image.resize((width, 12000), Image.Resampling.LANCZOS)
            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGB")
            count += 1
            image.save(output / f"fantawild-{count:02d}.webp", "WEBP", quality=82, method=6)
    except Exception:
        pass
print(count)
