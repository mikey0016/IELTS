const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
let cnt=0;
const newFn = `// downloadTestPaper immediate fix - works instantly for all materials
function downloadTestPaper(kind) {
    const url = TEST_PAPER_FILES[kind];
    const m = document.getElementById('testdl-menu');
    if (m) m.classList.add('hidden');
    if (!url || url.includes('IELTSuz-files')) {
        const title = document.title || 'IELTS-Test';
        // instant fallback: use current page content to generate printable
        try {
            const win = window.open('', '_blank');
            if (win) {
                const q = document.getElementById('questions-container');
                const p = document.getElementById('panel-q');
                win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>'+title+' - Printable</title><style>body{font-family:Arial,sans-serif;padding:24px} @media print{body{padding:0}}</style></head><body>'+ (q? q.innerHTML : '') + (p? p.innerHTML : document.body.innerHTML) + '</body></html>');
                win.document.close();
                win.focus();
                setTimeout(()=> win.print(), 400);
                showToast('PDF tayyor — Print dialog ochildi', '#059669');
                return;
            }
        } catch(e){}
        showToast('The printable ' + (kind === 'pdf' ? 'PDF' : 'Word') + ' file will be added soon', '#b45309');
        return;
    }
    showToast('Yuklanmoqda...', '#2563eb');
    fetch(url).then(r=>{
        if(!r.ok) throw new Error('Network');
        return r.blob();
    }).then(blob=>{
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        const safeTitle = (document.title || 'IELTS-Test').replace(/[^a-z0-9]/gi,'-');
        a.download = safeTitle + '.' + (kind === 'pdf' ? 'pdf' : 'docx');
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=> URL.revokeObjectURL(blobUrl), 1500);
        showToast('Yuklab olindi ✓', '#059669');
    }).catch(()=>{
        window.open(url, '_blank');
        showToast('Yangi tabda ochildi', '#059669');
    });
}`;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  if(html.includes('downloadTestPaper immediate fix')) continue;
  // find function downloadTestPaper
  const start = html.indexOf('function downloadTestPaper(kind)');
  if(start===-1) continue;
  // find end of function: look for next "document.addEventListener" after start, or find matching braces
  // Simple: find "}\n" after start that is followed by "document.addEventListener"
  let end = html.indexOf("document.addEventListener('click',", start);
  if(end===-1) end = html.indexOf('document.addEventListener("click"', start);
  if(end===-1) continue;
  // find last } before end
  let funcEnd = html.lastIndexOf('}', end);
  // include that }
  funcEnd = html.indexOf('}', funcEnd) + 1; // actually we need to find the closing brace of function
  // More robust: count braces
  let depth=0, idx=start, funcStart = html.indexOf('{', start);
  for(let i=funcStart; i<html.length; i++){
    if(html[i]==='{') depth++;
    else if(html[i]==='}'){ depth--; if(depth===0){ funcEnd=i+1; break; } }
    if(i> start+5000) break; // prevent infinite
  }
  if(funcEnd<=start) continue;
  const oldFn = html.slice(start, funcEnd);
  html = html.slice(0, start) + newFn + html.slice(funcEnd);
  fs.writeFileSync(full, html, 'utf-8');
  cnt++;
}
console.log(`✅ Fixed download for ${cnt} more files - total should be 208`);
