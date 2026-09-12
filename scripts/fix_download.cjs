const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
let cnt=0;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  if(html.includes('downloadTestPaper immediate fix')) continue;
  // old function
  const oldFn = `function downloadTestPaper(kind) {
    const url = TEST_PAPER_FILES[kind];
    const m = document.getElementById('testdl-menu');
    if (m) m.classList.add('hidden');
    if (!url) { showToast('The printable ' + (kind === 'pdf' ? 'PDF' : 'Word') + ' file will be added soon', '#b45309'); return; }
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'CD-IELTS-Listening-1.' + (kind === 'pdf' ? 'pdf' : 'docx'));
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}`;
  // new immediate fix - fetch as blob for cross-origin, fallback to window.open, immediate
  const newFn = `// downloadTestPaper immediate fix - works instantly for all materials
function downloadTestPaper(kind) {
    const url = TEST_PAPER_FILES[kind];
    const m = document.getElementById('testdl-menu');
    if (m) m.classList.add('hidden');
    if (!url || url.includes('IELTSuz-files')) {
        // fallback: generate printable from current page for instant download (no external dependency)
        const title = document.title || 'IELTS-Test';
        const htmlContent = document.documentElement.outerHTML;
        // Try to open printable in new tab and trigger print (instant)
        const win = window.open('', '_blank');
        if (win) {
            win.document.write('<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>'+title+' - Printable</title><style>body{font-family:Arial,sans-serif;padding:24px} @media print{body{padding:0}}</style></head><body>'+document.getElementById('questions-container').innerHTML + document.getElementById('panel-q').innerHTML + '</body></html>');
            win.document.close();
            win.focus();
            setTimeout(()=> win.print(), 400);
            showToast('PDF tayyor — Print dialog ochildi', '#059669');
            return;
        }
        showToast('The printable ' + (kind === 'pdf' ? 'PDF' : 'Word') + ' file will be added soon', '#b45309');
        return;
    }
    // For external URLs (archive.org etc) - use fetch blob for instant cross-origin download
    showToast('Yuklanmoqda...', '#2563eb');
    fetch(url).then(r=>{
        if(!r.ok) throw new Error('Network');
        return r.blob();
    }).then(blob=>{
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = title.replace(/[^a-z0-9]/gi,'-') + '.' + (kind === 'pdf' ? 'pdf' : 'docx');
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(()=> URL.revokeObjectURL(blobUrl), 1500);
        showToast('Yuklab olindi ✓', '#059669');
    }).catch(()=>{
        // fallback to direct open if fetch fails (CORS)
        window.open(url, '_blank');
        showToast('Yangi tabda ochildi', '#059669');
    });
}`;
  // More generic replacement: find function downloadTestPaper
  const regex = /function downloadTestPaper\(kind\) \{[\s\S]*?document\.body\.removeChild\(a\);\n\}/;
  if(regex.test(html)){
    html = html.replace(regex, newFn);
    fs.writeFileSync(full, html, 'utf-8');
    cnt++;
  } else if(html.includes('function downloadTestPaper')){
    // fallback simple string replace for files with different formatting
    html = html.replace(/function downloadTestPaper[\s\S]*?document\.body\.removeChild\(a\);\s*\}/, newFn);
    fs.writeFileSync(full, html, 'utf-8');
    cnt++;
  }
}
console.log(`✅ Fixed download for ${cnt} files - endi shu zahoti yuklaydi`);
