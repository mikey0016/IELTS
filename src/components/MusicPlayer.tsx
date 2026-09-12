import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, X, Shuffle, Repeat, Minimize2 } from "lucide-react";
import { listMusic, type MusicTrack } from "@/api/music";
import { cn } from "@/lib/cn";

export function ReadingMusicPlayer({ skill }: { skill: string }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [open, setOpen] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    listMusic(skill === "reading" ? "reading" : "all").then(setTracks).catch(()=>{});
  }, [skill]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(()=> setPlaying(false));
    else a.pause();
  }, [playing, current]);

  const track = tracks[current];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xl hover:shadow-2xl transition"
      >
        <Music className="h-4 w-4" /> Musiqa
      </button>
    );
  }

  if (!track) return null;

  return (
    <div className={cn(
      "fixed z-40 transition-all duration-300",
      minimized ? "bottom-4 right-4" : "bottom-4 right-4 left-4 sm:left-auto sm:w-[380px]"
    )}>
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
              <Music className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-80">Reading Focus</p>
              <p className="text-sm font-bold leading-none">Musiqa bilan o'qish</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={()=> setMinimized(m=>!m)} className="rounded-lg p-1.5 hover:bg-white/20"><Minimize2 className="h-4 w-4"/></button>
            <button onClick={()=> setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20"><X className="h-4 w-4"/></button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Cover + Info */}
            <div className="flex gap-4 p-4">
              <img src={track.coverUrl || `https://images.unsplash.com/photo-1493225457124?w=300`} alt="" className="h-20 w-20 rounded-xl object-cover shadow" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{track.title}</p>
                <p className="truncate text-xs text-slate-500">{track.artist}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:bg-violet-900/30">Reading</span>
                  <span className="text-[11px] text-slate-400">{current+1} / {tracks.length}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="px-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all" style={{width: `${progress}%`}}/>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-1">
                <button onClick={()=> setCurrent(c=> (c-1+tracks.length)%tracks.length)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><SkipBack className="h-5 w-5"/></button>
                <button onClick={()=> setPlaying(!playing)} className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition">
                  {playing ? <Pause className="h-5 w-5 fill-white"/> : <Play className="h-5 w-5 fill-white ml-0.5"/>}
                </button>
                <button onClick={()=> setCurrent(c=> (c+1)%tracks.length)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><SkipForward className="h-5 w-5"/></button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={()=> setMuted(!muted)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  {muted || volume===0 ? <VolumeX className="h-4 w-4"/> : <Volume2 className="h-4 w-4"/>}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={muted?0:volume} onChange={e=>{setVolume(parseFloat(e.target.value)); setMuted(false)}} className="h-1 w-20 accent-violet-600"/>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Shuffle className="h-4 w-4"/></button>
                <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Repeat className="h-4 w-4"/></button>
              </div>
            </div>

            {/* Playlist */}
            <div className="max-h-40 overflow-y-auto border-t border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/30">
              {tracks.map((t,i)=>(
                <button key={t.id} onClick={()=>{setCurrent(i); setPlaying(true)}} className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white dark:hover:bg-slate-800", i===current && "bg-white dark:bg-slate-800")}>
                  <img src={t.coverUrl || ""} alt="" className="h-9 w-9 rounded-lg object-cover"/>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-xs font-bold", i===current ? "text-violet-600" : "text-slate-800 dark:text-slate-200")}>{t.title}</p>
                    <p className="truncate text-[11px] text-slate-500">{t.artist}</p>
                  </div>
                  {i===current && playing && <span className="h-2 w-2 animate-pulse rounded-full bg-violet-600"/>}
                </button>
              ))}
            </div>

            <p className="bg-slate-900 px-4 py-2 text-center text-[11px] text-slate-400">Musiqa reading paytida fonida ijro etiladi тАФ ovozini pasaytirib qo'yishingiz mumkin</p>
          </>
        )}

        {minimized && (
          <div className="flex items-center gap-3 p-3">
            <img src={track.coverUrl} alt="" className="h-10 w-10 rounded-lg object-cover"/>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{track.title}</p>
              <p className="truncate text-[11px] text-slate-500">{track.artist}</p>
            </div>
            <button onClick={()=> setPlaying(!playing)} className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white">
              {playing ? <Pause className="h-4 w-4"/> : <Play className="h-4 w-4 ml-0.5"/>}
            </button>
          </div>
        )}

        <audio
          ref={audioRef}
          src={track.url}
          preload="metadata"
          onTimeUpdate={e=> setProgress( (e.currentTarget.currentTime / (e.currentTarget.duration || 1))*100 )}
          onEnded={()=> setCurrent(c=> (c+1)%tracks.length)}
          loop={false}
        />
      </div>
    </div>
  );
}
