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
  const idx = html.indexOf('function downloadTestPaper(kind)');
  if(idx===-1) continue;
  // Find function end by counting braces
  let startBrace = html.indexOf('{', idx);
  let depth=0, end=-1;
  for(let i=startBrace; i<html.length; i++){
    if(html[i]==='{') depth++;
    else if(html[i]==='}'){ depth--; if(depth===0){ end=i+1; break; } }
    if(i - startBrace > 8000) break;
  }
  if(end===-1) continue;
  html = html.slice(0, idx) + newFn + html.slice(end);
  fs.writeFileSync(full, html, 'utf-8');
  cnt++;
}
console.log(`✅ Fixed ${cnt} remaining files`);
