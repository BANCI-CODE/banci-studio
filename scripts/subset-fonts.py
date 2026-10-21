from pathlib import Path
import urllib.request,hashlib,json,os,argparse
# Requires: pip install fonttools brotli
from fontTools.ttLib import TTFont
from fontTools import subset
root=Path(__file__).resolve().parents[1]
stage=root/'.cache/font-sources';stage.mkdir(parents=True,exist_ok=True)
out=root/'site/fonts'
def get(url,name):
 p=stage/name
 if not p.exists():p.write_bytes(urllib.request.urlopen(urllib.request.Request(url,headers={'Referer':'https://fonts.alibabagroup.com/','User-Agent':'Mozilla/5.0'}),timeout=50).read())
 return p
def publish(p,stem):
 d=p.read_bytes();name=stem+'.'+hashlib.sha256(d).hexdigest()[:10]+'.woff2';(out/name).write_bytes(d);print(name,len(d),flush=True);return name
# Use the publisher's web font unchanged for the proprietary display family.
shu=get('https://fonts.alibabadesign.com/AlimamaShuHeiTi/AlimamaShuHeiTi-Bold/AlimamaShuHeiTi-Bold.woff2','shuheiti-official.woff2')
names={'display-han':publish(shu,'alimama-shuheiti')}
chars=set(chr(i) for i in range(32,256))|set('–—…→↗↓“”‘’')
for p in (root/'site').rglob('*'):
 if p.suffix in {'.html','.js','.json'}:chars.update(c for c in p.read_text('utf-8',errors='ignore') if 0x3000<=ord(c)<=0x9fff or 0xff00<=ord(c)<=0xffef)
parser=argparse.ArgumentParser(description='Rebuild the active portfolio font subsets')
parser.add_argument('--font-dir',type=Path,default=Path(os.environ.get('LOCALAPPDATA','.'))/'Microsoft/Windows/Fonts')
local=parser.parse_args().font_dir
for weight,suffix in [(400,'Regular'),(500,'Medium')]:
 font=TTFont(local/f'Alibaba-PuHuiTi-{suffix}.ttf')
 opts=subset.Options();opts.recalc_timestamp=False
 sub=subset.Subsetter(options=opts);sub.populate(text=''.join(sorted(chars)));sub.subset(font)
 font.flavor='woff2';p=stage/f'puhui-{weight}.woff2';font.save(p);names[str(weight)]=publish(p,f'alibaba-puhuiti-{weight}')
font=TTFont(local/'BebasNeue-Regular.ttf');opts=subset.Options();opts.recalc_timestamp=False
sub=subset.Subsetter(options=opts);sub.populate(text=''.join(chr(i) for i in range(32,256))+'–—…→↗↓');sub.subset(font)
font.flavor='woff2';p=stage/'bebas.woff2';font.save(p);names['display-latin']=publish(p,'bebas-neue')
license=get('https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/OFL.txt','bebas-OFL.txt');(out/'bebas-neue-OFL.txt').write_bytes(license.read_bytes())
(stage/'portfolio-fonts.json').write_text(json.dumps(names),'utf-8')
print('Ready')

print("Review the new fonts, then update typography.css with the printed content-hashed file names. Existing font assets are preserved.")
