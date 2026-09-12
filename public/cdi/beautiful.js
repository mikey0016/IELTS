// IELTS Master - Beautiful Frontend SFX - Safe, frontend only
(function(){
  try{
    let ctx=null;
    function getCtx(){
      if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)();
      if(ctx.state==='suspended') ctx.resume();
      return ctx;
    }
    function tone(freq,dur){
      try{
        const c=getCtx(), o=c.createOscillator(), g=c.createGain();
        o.type='sine'; o.frequency.value=freq; g.gain.value=0.05;
        o.connect(g); g.connect(c.destination);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime+dur);
        o.start(); o.stop(c.currentTime+dur);
      }catch(e){}
    }
    document.addEventListener('click', e=>{
      const b=e.target.closest('button, a, .option-row');
      if(b) tone(700,0.12);
    });
    document.addEventListener('click', e=>{
      const b=e.target.closest('button');
      if(!b || b.id==='test-loading-overlay') return;
      const r=b.getBoundingClientRect();
      const d=document.createElement('span');
      d.style.cssText='position:absolute;pointer-events:none;width:20px;height:20px;background:rgba(124,58,237,.12);border-radius:50%;transform:translate(-50%,-50%) scale(0);left:'+(e.clientX-r.left)+'px;top:'+(e.clientY-r.top)+'px;animation:ripple .6s ease-out';
      b.style.position='relative'; b.style.overflow='hidden';
      b.appendChild(d);
      setTimeout(()=>d.remove(),600);
    });
    if(!document.getElementById('ripple-kf')){
      const s=document.createElement('style');
      s.id='ripple-kf';
      s.textContent='@keyframes ripple{to{transform:translate(-50%,-50%) scale(9);opacity:0}}';
      document.head.appendChild(s);
    }
  }catch(e){}
})();
