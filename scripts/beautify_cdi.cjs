const fs = require("fs");
const path = require("path");

const cdiDir = path.join(__dirname, "../public/cdi");
const files = fs.readdirSync(cdiDir).filter(f => f.endsWith(".html"));

const musicWidget = `
<!-- BEAUTIFUL READING MUSIC WIDGET - IELTS Master -->
<style>
  #reading-music-widget{position:fixed;right:16px;bottom:16px;z-index:9999;font-family:'Outfit',system-ui,sans-serif}
  #reading-music-btn{width:56px;height:56px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;box-shadow:0 8px 24px rgba(124,58,237,.35);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s}
  #reading-music-btn:hover{transform:scale(1.05)}
  #reading-music-panel{position:absolute;right:0;bottom:70px;width:340px;max-width:92vw;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.6);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.18);overflow:hidden;display:none}
  #reading-music-panel.open{display:block}
  .rm-head{background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between}
  .rm-title{font-weight:800;font-size:13px;letter-spacing:.04em;text-transform:uppercase;opacity:.9}
  .rm-track{padding:12px 16px;display:flex;gap:12px;align-items:center}
  .rm-cover{width:56px;height:56px;border-radius:12px;object-fit:cover}
  .rm-info{flex:1;min-width:0}
  .rm-name{font-weight:800;font-size:13px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .rm-artist{font-size:11px;color:#64748b}
  .rm-controls{display:flex;align-items:center;gap:8px;padding:0 16px 12px}
  .rm-play{width:44px;height:44px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer}
  .rm-list{max-height:180px;overflow-y:auto;border-top:1px solid #e2e8f0;background:#f8fafc}
  .rm-item{width:100%;text-align:left;padding:10px 14px;display:flex;gap:10px;align-items:center;background:none;border:none;cursor:pointer}
  .rm-item:hover{background:#fff}
  .rm-item.active{background:#fff;border-left:3px solid #7c3aed}
</style>
<div id="reading-music-widget">
  <div id="reading-music-panel">
    <div class="rm-head"><span class="rm-title">🎵 Reading Focus Musiqa</span><button onclick="document.getElementById('reading-music-panel').classList.remove('open')" style="background:none;border:none;color:#fff;cursor:pointer">✕</button></div>
    <div class="rm-track">
      <img id="rm-cover" class="rm-cover" src="https://images.unsplash.com/photo-1493225457124?w=300" />
      <div class="rm-info"><div id="rm-title" class="rm-name">Lofi Study Beats</div><div id="rm-artist" class="rm-artist">IELTS Focus</div></div>
    </div>
    <div class="rm-controls">
      <button class="rm-play" id="rm-prev">⏮</button>
      <button class="rm-play" id="rm-play" style="width:48px;height:48px">▶</button>
      <button class="rm-play" id="rm-next">⏭</button>
      <input id="rm-vol" type="range" min="0" max="1" step="0.05" value="0.35" style="flex:1" />
    </div>
    <div id="rm-list" class="rm-list"></div>
    <div style="padding:8px 14px;font-size:10px;color:#94a3b8;text-align:center">Reading paytida fonida ijro etiladi — IELTS Master musiqalari</div>
  </div>
  <button id="reading-music-btn" title="Musiqa">♫</button>
</div>
<audio id="rm-audio" preload="metadata"></audio>
<script>
(function(){
  const btn=document.getElementById('reading-music-btn');
  const panel=document.getElementById('reading-music-panel');
  const audio=document.getElementById('rm-audio');
  const titleEl=document.getElementById('rm-title');
  const artistEl=document.getElementById('rm-artist');
  const coverEl=document.getElementById('rm-cover');
  const playBtn=document.getElementById('rm-play');
  const prevBtn=document.getElementById('rm-prev');
  const nextBtn=document.getElementById('rm-next');
  const vol=document.getElementById('rm-vol');
  const listEl=document.getElementById('rm-list');
  let tracks=[]; let idx=0; let playing=false;
  async function load(){
    try{
      const res=await fetch('http://localhost:4000/api/music?category=reading');
      if(res.ok){ tracks=await res.json(); }
    }catch(e){}
    if(!tracks.length){
      tracks=[
        {title:'Lofi Study Beats',artist:'IELTS Focus',url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',coverUrl:'https://images.unsplash.com/photo-1493225457124?w=300'},
        {title:'Gentle Piano',artist:'Calm Reading',url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',coverUrl:'https://images.unsplash.com/photo-1511671782779?w=300'},
        {title:'Soft Rain',artist:'Ambient',url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',coverUrl:''},
      ];
    }
    renderList(); setTrack(0);
  }
  function renderList(){
    listEl.innerHTML='';
    tracks.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='rm-item'+(i===idx?' active':'');
      b.innerHTML='<img src=\"'+(t.coverUrl||'')+'\" style=\"width:36px;height:36px;border-radius:8px;object-fit:cover\"><div style=\"flex:1;min-width:0\"><div style=\"font-weight:700;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">'+t.title+'</div><div style=\"font-size:11px;color:#64748b\">'+t.artist+'</div></div>';
      b.onclick=()=>{setTrack(i); play();};
      listEl.appendChild(b);
    });
  }
  function setTrack(i){ idx=(i+tracks.length)%tracks.length; const t=tracks[idx]; titleEl.textContent=t.title; artistEl.textContent=t.artist; coverEl.src=t.coverUrl||''; audio.src=t.url; renderList(); }
  function play(){ playing=true; playBtn.textContent='⏸'; audio.play().catch(()=>{playing=false; playBtn.textContent='▶'}); }
  function pause(){ playing=false; playBtn.textContent='▶'; audio.pause(); }
  btn.onclick=()=> panel.classList.toggle('open');
  playBtn.onclick=()=> playing? pause(): play();
  prevBtn.onclick=()=>{ setTrack(idx-1); play(); };
  nextBtn.onclick=()=>{ setTrack(idx+1); play(); };
  vol.oninput=()=> audio.volume=parseFloat(vol.value);
  audio.volume=0.35;
  audio.onended=()=>{ setTrack(idx+1); play(); };
  load();
})();
</script>
`;

let count=0;
for (const file of files) {
  if (!file.includes("reading")) continue;
  const full = path.join(cdiDir, file);
  let html = fs.readFileSync(full, "utf-8");
  if (html.includes("reading-music-widget")) continue;
  // inject before </body>
  if (html.includes("</body>")) {
    html = html.replace("</body>", musicWidget + "\n</body>");
  } else {
    html += musicWidget;
  }
  // also beautify: add beautiful header gradient if not present
  if (!html.includes("IELTS Master Beautiful")) {
    // add beautiful top bar style injection after <style>
    html = html.replace("</style>", `
  /* Beautiful Enhancement - IELTS Master */
  header{backdrop-filter:blur(12px) !important; box-shadow:0 4px 20px rgba(0,0,0,.08) !important}
  #panel-p, #panel-q{border-radius:16px !important; box-shadow:0 8px 32px rgba(0,0,0,.06) !important; border:1px solid #e2e8f0 !important}
  #instruction-bar{border-radius:12px !important; margin:12px !important}
</style>`);
  }
  fs.writeFileSync(full, html, "utf-8");
  count++;
}
console.log(`✅ Beautified ${count} reading HTML files with music widget`);
