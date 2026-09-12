const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
let cnt=0;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  const origLen = html.length;
  html = html.replace(/\n\s*<link rel="stylesheet" href="\/cdi\/beautiful\.css">/g, '');
  html = html.replace(/\n\s*<script src="\/cdi\/beautiful\.js"><\/script>/g, '');
  if(html.length !== origLen){
    fs.writeFileSync(full, html, 'utf-8');
    cnt++;
  }
}
console.log(`✅ Removed beautiful frontend from ${cnt} files - endi original holatida ochiladi`);
