from pathlib import Path
import re
r=Path(__file__).resolve().parents[1]
from PIL import Image
import hashlib,json
out=r/'site/performance-images';out.mkdir(exist_ok=True)
p=r/'site/work/index.html';html=p.read_text(encoding='utf-8');records=[]
def anchor(m):
 block=m.group(0);kind=m.group(1)
 def image(n):
  tag=re.sub(r' (?:width|height|sizes|srcset|fetchpriority)="[^"]*"','',n.group(0));url=re.search(r'\bsrc="([^"]+)"',tag).group(1)
  source=r/'site'/url.lstrip('/')
  if not source.exists():source=r/'public'/url.lstrip('/')
  im=Image.open(source);w,h=im.size
  # Account for object-fit:cover when the source is wider than its container.
  ratio={'ed-feature':.75,'ed-brand':16/9,'ed-employer':1,'ed-lab-item':1}[kind]
  factor=max(1,w/h/ratio)
  desktop={'ed-feature':360,'ed-brand':360,'ed-employer':96,'ed-lab-item':160}[kind]*factor
  mobile={'ed-feature':None,'ed-brand':None,'ed-employer':64,'ed-lab-item':104}[kind]
  sizes=(f'(max-width: 767px) {40*factor:.3f}vw, {desktop:.2f}px' if mobile is None else f'(max-width: 767px) {mobile*factor:.2f}px, {desktop:.2f}px')
  candidates=[]
  for target in [320,640,1080]:
   if target>=w:continue
   name=hashlib.sha256(source.read_bytes()).hexdigest()[:16]+f'-{target}.webp';dest=out/name
   if not dest.exists():
    resized=im.resize((target,round(h*target/w)),Image.Resampling.LANCZOS)
    resized.save(dest,'WEBP',lossless=True,method=6,**({'icc_profile':im.info['icc_profile']} if im.info.get('icc_profile') else {}))
   if dest.stat().st_size < source.stat().st_size:
    candidates.append(f'/performance-images/{name} {target}w')
   records.append({'source':url,'width':target,'bytes':dest.stat().st_size,'originalBytes':source.stat().st_size,'file':name})
  candidates.append(f'{url} {w}w')
  tag=tag.replace('loading="eager"','loading="lazy"')
  if kind=='ed-feature' and 'airseekers' in url:tag=tag.replace('loading="lazy"','loading="eager" fetchpriority="high"')
  return tag[:-1]+f' width="{w}" height="{h}" sizes="{sizes}" srcset="'+', '.join(candidates)+'">'
 return re.sub(r'<img\b[^>]*>',image,block)
html=re.sub(r'<a class="(ed-feature|ed-brand|ed-employer|ed-lab-item)"[^>]*>.*?</a>',anchor,html,flags=re.S)
p.write_text(html,encoding='utf-8')
(out/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')

