import fs from 'node:fs';
import path from 'node:path';
const root=process.argv[2] || 'dist/client',files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);entry.isDirectory()?walk(file):files.push(file)}}
walk(root);
const html=files.filter(file=>file.endsWith('.html')),missing=[];
for(const file of html){const source=fs.readFileSync(file,'utf8');for(const match of source.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)){const url=match[1];let target=path.join(root,url.replace(/^\//,''));if(url.endsWith('/'))target=path.join(target,'index.html');if(!fs.existsSync(target))missing.push([path.relative(root,file),url]);}}
console.log(JSON.stringify({html:html.length,files:files.length,missing},null,2));
if(missing.length)process.exitCode=1;
