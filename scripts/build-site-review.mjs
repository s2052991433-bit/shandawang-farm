import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.resolve(process.argv[2]||path.join(root,'review-build'));
const destination=path.resolve(process.argv[3]||path.join(root,'site-review.html'));
const index=readFileSync(path.join(build,'index.html'),'utf8');
const js=index.match(/src="\/assets\/([^"]+\.js)"/)?.[1],css=index.match(/href="\/assets\/([^"]+\.css)"/)?.[1];
if(!js||!css)throw new Error('Run a Vite review build first');
let code=readFileSync(path.join(build,'assets',js),'utf8');
const used=new Set();
code=code.replace(/(["'])(\/assets\/[^"']+\.(?:webp|jpg|jpeg|png|svg))\1/g,(match,quote,url)=>{
  const file=path.join(root,'public',url);const extension=path.extname(file).slice(1);
  const mime=extension==='svg'?'image/svg+xml':extension==='jpg'?'image/jpeg':`image/${extension}`;
  used.add(url);return JSON.stringify('data:'+mime+';base64,'+readFileSync(file).toString('base64'));
});
const stylesheet=readFileSync(path.join(build,'assets',css),'utf8');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>山大王农场 · 修改预览</title><style>${stylesheet}</style></head><body><div style="padding:8px 20px;text-align:center;font:12px/1.6 system-ui;background:#e9e6dc;color:#385146">设计预览 · 订单与卡券操作请使用 <a href="https://www.shandawangfarm.com" target="_blank" rel="noreferrer">正式网站</a></div><div id="root"></div><script type="module">${code.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
writeFileSync(destination,html);console.log(JSON.stringify({file:destination,bytes:Buffer.byteLength(html),embeddedImages:used.size}));
