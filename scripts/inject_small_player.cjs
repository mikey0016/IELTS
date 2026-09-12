const fs=require('fs'), path=require('path');
const dir=path.join(__dirname,'../public/cdi');
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.html'));
const widget = `
<!-- Small Material Player - IELTS Master -->
<style>
  #small-music-player{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border:1px solid #e2e8f0;border-radius:12px;margin:12px;padding:8px 12px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 16px rgba(0,0,0,.06)}
  #small-music-player button{width:32px;height:32px;border-radius:999px;border:none;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
  #small-music-player select{flex:1;max-width:220px;border:1px solid #e2e8f0;border-radius:8px;padding:6px 8px;font-size:12px;font-weight:600;background:#fff}
  #small-music-player input[type=range]{width:80px;accent-color:#7c3aed}
  #small-music-player .smp-title{font-size:12px;font-weight:800;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}
  #small-music-player .smp-artist{font-size:10px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  @media(max-width:640px){#small-music-player{margin:8px;padding:6px 8px}#small-music-player select{max-width:140px}}
</style>
<div id="small-music-player">
  <button id="smp-play" title="Play/Pause">▶</button>
  <div style="flex:1;min-width:0">
    <div id="smp-title" class="smp-title">Lofi Study Beats</div>
    <div id="smp-artist" class="smp-artist">IELTS Focus</div>
  </div>
  <select id="smp-select"></select>
  <input id="smp-vol" type="range" min="0" max="1" step="0.05" value="0.35" title="Volume"/>
</div>
<audio id="smp-audio" preload="metadata"></audio>
<script>
(function(){
  const audio=document.getElementById('smp-audio');
  const playBtn=document.getElementById('smp-play');
  const titleEl=document.getElementById('smp-title');
  const artistEl=document.getElementById('smp-artist');
  const sel=document.getElementById('smp-select');
  const vol=document.getElementById('smp-vol');
  let tracks=[], idx=0, playing=false;
  async function load(){
    try{
      const r=await fetch('/api/music');
      if(r.ok) tracks=await r.json();
    }catch(e){}
    if(!tracks.length){
      tracks=[
        {title:'Lofi Study Beats',artist:'IELTS Focus',url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'},
        {title:'Summertime Sadness',artist:'Lana Del Rey',url:'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d1/64/e3/d164e3bb-aeb5-effb-a09c-d3775441c5b8/mzaf_3133376794831917475.plus.aac.p.m4a'},
        {title:'ocean eyes',artist:'Billie Eilish',url:'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d6/59/2b/d6592b0b-1e7e-4743-b2e4-f2af038fd783/mzaf_7697277787797935735.plus.aac.p.m4a'}
      ];
    }
    sel.innerHTML='';
    tracks.forEach((t,i)=>{
      const o=document.createElement('option');
      o.value=i; o.textContent=t.title + ' — ' + t.artist;
      sel.appendChild(o);
    });
    setTrack(0);
  }
  function setTrack(i){
    idx=(i+tracks.length)%tracks.length;
    const t=tracks[idx];
    titleEl.textContent=t.title; artistEl.textContent=t.artist;
    audio.src=t.url; sel.value=idx;
  }
  function play(){ playing=true; playBtn.textContent='⏸'; audio.play().catch(()=>{playing=false; playBtn.textContent='▶'}); }
  function pause(){ playing=false; playBtn.textContent='▶'; audio.pause(); }
  playBtn.onclick=()=> playing? pause(): play();
  sel.onchange=()=>{ setTrack(parseInt(sel.value)); play(); };
  vol.oninput=()=> audio.volume=parseFloat(vol.value);
  audio.volume=0.35;
  audio.onended=()=>{ setTrack(idx+1); play(); };
  load();
})();
</script>
`;

let cnt=0;
for(const file of files){
  const full=path.join(dir,file);
  let html=fs.readFileSync(full,'utf-8');
  if(html.includes('small-music-player')) continue;
  // inject after <header> or after <body>
  if(html.includes('<header')){
    // inject right after header closing </header>
    html = html.replace('</header>', '</header>\n' + widget);
  } else if(html.includes('<body')){
    html = html.replace(/<body[^>]*>/, (m)=> m + '\n' + widget);
  } else {
    html = widget + '\n' + html;
  }
  fs.writeFileSync(full, html, 'utf-8');
  cnt++;
}
console.log(`✅ Injected small player into ${cnt} files (all materials)`);
