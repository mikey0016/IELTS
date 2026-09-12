const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));

const beautifyCSS = `
/* IELTS Master - Beautiful Frontend Effects Only */
header{backdrop-filter:blur(16px) !important; background:rgba(255,255,255,.92) !important; box-shadow:0 4px 24px rgba(15,23,42,.06) !important; border-bottom:1px solid #e2e8f0 !important; transition:all .3s ease}
header:hover{box-shadow:0 8px 32px rgba(15,23,42,.12) !important}
#panel-p, #panel-q{border-radius:20px !important; box-shadow:0 12px 40px rgba(15,23,42,.08) !important; border:1px solid #e2e8f0 !important; transition:all .3s cubic-bezier(.4,0,.2,1) !important; overflow:hidden}
#panel-p:hover, #panel-q:hover{box-shadow:0 16px 48px rgba(15,23,42,.12) !important; transform:translateY(-1px)}
#instruction-bar{border-radius:16px !important; margin:12px !important; box-shadow:0 4px 16px rgba(0,0,0,.04) !important; background:linear-gradient(135deg,#f8fafc,#f1f5f9) !important; border:1px solid #e2e8f0 !important; transition:all .2s}
#instruction-bar:hover{box-shadow:0 6px 20px rgba(0,0,0,.06) !important}
.answer-input{border-radius:10px !important; transition:all .2s cubic-bezier(.4,0,.2,1) !important; box-shadow:0 1px 3px rgba(0,0,0,.05) !important}
.answer-input:focus{transform:scale(1.02); box-shadow:0 0 0 3px rgba(124,58,237,.15), 0 4px 12px rgba(124,58,237,.1) !important; border-color:#7c3aed !important}
.answer-input:hover{border-color:#a78bfa !important}
.q-num-badge{border-radius:8px !important; transition:all .2s !important; box-shadow:0 2px 8px rgba(0,0,0,.06) !important}
.q-num-badge:hover{transform:scale(1.05); box-shadow:0 4px 12px rgba(0,0,0,.1) !important}
.option-row{border-radius:12px !important; transition:all .2s !important; border:1px solid transparent !important}
.option-row:hover{background:#f8fafc !important; border-color:#e2e8f0 !important; transform:translateX(2px)}
.option-row:has(input:checked){background:linear-gradient(135deg,#ede9fe,#f5f3ff) !important; border-color:#8b5cf6 !important; box-shadow:0 4px 12px rgba(139,92,246,.15) !important}
button{transition:all .2s cubic-bezier(.4,0,.2,1) !important}
button:active{transform:scale(0.98)}
#testdl-menu{border-radius:16px !important; box-shadow:0 20px 60px rgba(0,0,0,.15) !important; border:1px solid #e2e8f0 !important; backdrop-filter:blur(16px) !important; animation:slideDown .3s ease}
@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
.tdl-pdf, .tdl-doc{border-radius:12px !important; transition:all .2s !important}
.tdl-pdf:hover{transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.08) !important}
.vocab-card{transition:all .3s cubic-bezier(.4,0,.2,1) !important; border-radius:16px !important}
.vocab-card:hover{transform:translateY(-4px); box-shadow:0 12px 32px rgba(79,70,229,.12) !important}
/* Shimmer loading */
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.shimmer{background:linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size:200% 100%; animation:shimmer 1.5s infinite}
/* Floating orbs */
body::before{content:'';position:fixed;inset:0;pointer-events:none;z-index:-1; background: radial-gradient(circle at 20% 20%, rgba(124,58,237,.04) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59,130,246,.04) 0%, transparent 50%)}
`;

const sfxJS = `
// SFX & UX Effects - Frontend Only
(function(){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    function playTone(freq, dur, type){
      try{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.type=type||'sine'; o.frequency.value=freq;
        g.gain.value=0.06; o.connect(g); g.connect(ctx.destination);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+dur);
        o.start(); o.stop(ctx.currentTime+dur);
      }catch(e){}
    }
    document.addEventListener('click', e=>{
      const btn=e.target.closest('button, a, .option-row, .q-num-badge');
      if(btn) playTone(800,0.12,'sine');
    });
    document.addEventListener('mouseenter', e=>{
      const el=e.target.closest('button, .option-row');
      if(el) playTone(1200,0.08,'sine');
    }, true);
    // Ripple effect
    document.addEventListener('click', e=>{
      const btn=e.target.closest('button');
      if(!btn) return;
      const rect=btn.getBoundingClientRect();
      const ripple=document.createElement('span');
      ripple.style.cssText='position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden;';
      const dot=document.createElement('span');
      dot.style.cssText='position:absolute;width:20px;height:20px;background:rgba(124,58,237,.15);border-radius:50%;transform:translate(-50%,-50%) scale(0);pointer-events:none;left:'+(e.clientX-rect.left)+'px;top:'+(e.clientY-rect.top)+'px;animation:ripple .6s ease-out';
      btn.style.position='relative'; btn.style.overflow='hidden';
      btn.appendChild(dot);
      setTimeout(()=>dot.remove(),600);
    });
    // Add ripple keyframes if not exists
    if(!document.getElementById('ripple-style')){
      const s=document.createElement('style');
      s.id='ripple-style';
      s.textContent='@keyframes ripple{to{transform:translate(-50%,-50%) scale(8);opacity:0}}';
      document.head.appendChild(s);
    }
    console.log('✨ IELTS Beautiful Frontend Effects loaded');
  }catch(e){}
})();
`;

let cnt=0;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  if(html.includes('IELTS Master - Beautiful Frontend Effects Only')) continue;
  // Inject beautify CSS before </style> (first one) and sfx JS before </body>
  if(html.includes('</style>')){
    html = html.replace('</style>', beautifyCSS + '\n</style>');
  } else if(html.includes('</head>')){
    html = html.replace('</head>', '<style>'+beautifyCSS+'</style>\n</head>');
  }
  if(html.includes('</body>')){
    html = html.replace('</body>', '<script>'+sfxJS+'</script>\n</body>');
  } else {
    html += '<script>'+sfxJS+'</script>';
  }
  fs.writeFileSync(full, html, 'utf-8');
  cnt++;
}
console.log(`✅ Beautified ${cnt} files with frontend-only effects (no backend touch)`);
