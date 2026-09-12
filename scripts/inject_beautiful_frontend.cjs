const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
let cnt=0;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  if(html.includes('beautiful.css')) continue;
  // Inject beautiful.css in <head>
  if(html.includes('</head>')){
    html = html.replace('</head>', '  <link rel="stylesheet" href="/cdi/beautiful.css">\n</head>');
  } else if(html.includes('<head>')){
    html = html.replace('<head>', '<head>\n  <link rel="stylesheet" href="/cdi/beautiful.css">');
  }
  // Inject beautiful.js before </body>
  if(html.includes('</body>')){
    html = html.replace('</body>', '  <script src="/cdi/beautiful.js"></script>\n</body>');
  } else {
    html += '\n<script src="/cdi/beautiful.js"></script>\n';
  }
  fs.writeFileSync(full, html, 'utf-8');
  cnt++;
}
console.log(`✅ Injected modern beautiful frontend into ${cnt} files (CSS + JS, frontend only)`);
