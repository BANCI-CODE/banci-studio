from pathlib import Path
import sys, urllib.request, re, json, hashlib
# Requires: pip install fonttools brotli
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont

root=Path(__file__).resolve().parents[1]
out=root/'site/fonts'; out.mkdir(exist_ok=True)
stage=root/'.cache/font-sources'; stage.mkdir(exist_ok=True)
def fetch(url, path):
    if not path.exists():
        path.write_bytes(urllib.request.urlopen(url,timeout=90).read())
    return path
characters=set(chr(i) for i in range(32,127))
for p in (root/'site').rglob('*'):
    if p.suffix in {'.html','.js','.json'}:
        characters.update(c for c in p.read_text('utf-8',errors='ignore') if 0x3000<=ord(c)<=0x9fff or 0xff00<=ord(c)<=0xffef)
characters.update('，。！？：；「」『』（）《》、—…·“”‘’–→↗↓©')
css=urllib.request.urlopen('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',timeout=30).read().decode()
sources=[]
def export(font, name, chars):
    opts=subset.Options(); opts.flavor='woff2'; opts.recalc_timestamp=False
    tool=subset.Subsetter(options=opts); tool.populate(text=''.join(sorted(chars))); tool.subset(font)
    # Subsets are modified fonts: remove the OFL reserved family names.
    family='Banci Sans' if name.startswith('plex') else 'Banci Han'
    for record in font['name'].names:
        if record.nameID in (1,2,3,4,6,16,17):
            value=family.replace(' ','') if record.nameID==6 else family
            if record.nameID in (2,17): value='Regular'
            record.string=value.encode(record.getEncoding(),errors='replace')
    font.flavor='woff2'; path=stage/name; font.save(path)
    tag=hashlib.sha256(path.read_bytes()).hexdigest()[:10]
    target=out/(path.stem+'.'+tag+'.woff2'); target.write_bytes(path.read_bytes())
    print(target.name,target.stat().st_size,flush=True)
for weight,url in re.findall(r'font-weight: (\d+);.*?url\(([^)]+)\)',css,re.S):
    src=fetch(url,stage/f'plex-{weight}.ttf')
    export(TTFont(src),f'plex-sans-{weight}.woff2',set(chr(i) for i in range(32,256))|set('–—…→↗↓'))
src=fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',stage/'noto-sc.ttf')
for weight in (400,600):
    font=instantiateVariableFont(TTFont(src),{'wght':weight},inplace=True)
    export(font,f'noto-sans-sc-{weight}.woff2',characters-set(chr(i) for i in range(32,256)))
for family in ('ibmplexsans','notosanssc'):
    fetch(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{family}/OFL.txt',out/f'{family}-OFL.txt')
(out/'README.md').write_text('''# BANCI typography assets

IBM Plex Sans (400/500/600/700) and Noto Sans SC (400/600), SIL Open Font License.
Sources: https://github.com/google/fonts/tree/main/ofl/ibmplexsans and https://github.com/google/fonts/tree/main/ofl/notosanssc

WOFF2 assets are self-hosted. Noto is subset to CJK characters appearing in site HTML/JS/JSON; missing/new characters fall back to PingFang SC / Microsoft YaHei. Re-run scripts/subset-fonts.py after adding copy. No runtime third-party font requests.
''','utf-8')
print('CJK character count',len(characters))

print("Update typography.css font URLs to the newly printed content hashes after reviewing subsets.")
