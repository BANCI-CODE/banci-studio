from pathlib import Path
from PIL import Image
import hashlib,json
r=Path(__file__).resolve().parents[1]
p=r/'site/content/aku/aku-daily.json';items=json.loads(p.read_text(encoding='utf-8'))
out=r/'site/performance-images/aku';out.mkdir(parents=True,exist_ok=True)
for item in items:
 url=item.get('portrait')
 if not url:continue
 source=r/'site'/url.lstrip('/')
 if not source.exists():source=r/'public'/url.lstrip('/')
 if not source.exists():continue
 with Image.open(source) as im:
  variants=[];digest=hashlib.sha256(source.read_bytes()).hexdigest()[:16]
  for width in (480,800,1100):
   if width>=im.width:continue
   dest=out/f'{digest}-{width}.webp'
   if not dest.exists():
    thumb=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
    thumb.save(dest,'WEBP',lossless=True,method=4,**({'icc_profile':im.info['icc_profile']} if im.info.get('icc_profile') else {}))
   if dest.stat().st_size<source.stat().st_size:variants.append({'src':'/performance-images/aku/'+dest.name,'width':width})
  variants.append({'src':url,'width':im.width})
  item['portraitVariants']=variants
p.write_text(json.dumps(items,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print('Updated portrait variants:',len(items),flush=True)
