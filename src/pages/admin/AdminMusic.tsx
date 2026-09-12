import { useEffect, useState } from "react";
import { Music, Plus, Trash2, Edit2, Play, Pause, Search, Save, X } from "lucide-react";
import { adminListMusic, adminCreateMusic, adminUpdateMusic, adminDeleteMusic } from "@/api/music";
import type { MusicTrack } from "@/api/music";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";

export function AdminMusic() {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MusicTrack | null>(null);
  const [form, setForm] = useState({ title: "", artist: "", url: "", coverUrl: "", category: "reading" as string, durationSec: 120 });
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminListMusic();
      setTracks(data);
    } catch (e:any){ toast(e.message,"error")}
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const filtered = tracks.filter(t=> t.title.toLowerCase().includes(query.toLowerCase()) || t.artist.toLowerCase().includes(query.toLowerCase()));

  const handleCreate = async () => {
    if(!form.title || !form.url) return toast("Title va URL majburiy","error");
    try{
      if(editing){
        await adminUpdateMusic(editing.id, form);
        toast("Yangilandi","success");
      } else {
        await adminCreateMusic(form as any);
        toast("Qo'shildi","success");
      }
      setShowForm(false); setEditing(null); setForm({title:"",artist:"",url:"",coverUrl:"",category:"reading",durationSec:120});
      load();
    }catch(e:any){ toast(e.message,"error")}
  };

  const handleEdit = (t:MusicTrack)=>{
    setEditing(t);
    setForm({ title:t.title, artist:t.artist, url:t.url, coverUrl:t.coverUrl||"", category:t.category, durationSec:t.durationSec||120 });
    setShowForm(true);
  };

  const handleDelete = async (id:string)=>{
    if(!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try{ await adminDeleteMusic(id); toast("O'chirildi","success"); load(); }catch(e:any){toast(e.message,"error")}
  };

  if(loading) return <div className="animate-pulse space-y-4"><div className="h-10 w-64 rounded-xl bg-slate-200"/><div className="h-64 rounded-2xl bg-slate-200"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Music className="h-6 w-6 text-violet-600"/> Musiqalar</h1>
          <p className="text-slate-500">Reading paytida ijro etiladigan fon musiqalari тАФ CDI Reading uchun</p>
        </div>
        <Button onClick={()=> {setEditing(null); setForm({title:"",artist:"",url:"",coverUrl:"",category:"reading",durationSec:120}); setShowForm(true)}}><Plus className="h-4 w-4"/> Yangi musiqa</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
        <input value={query} onChange={e=> setQuery(e.target.value)} placeholder="Qidirish..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm dark:border-slate-800 dark:bg-slate-900"/>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(t=>(
          <Card key={t.id} className="overflow-hidden group hover:shadow-lg transition">
            <div className="relative">
              <img src={t.coverUrl || `https://images.unsplash.com/photo-1493225457124?w=400`} alt="" className="h-40 w-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition"/>
              <button onClick={()=> setPreview(preview===t.url?null:t.url)} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-violet-600 opacity-0 group-hover:opacity-100 transition shadow-lg">
                {preview===t.url ? <Pause className="h-5 w-5"/> : <Play className="h-5 w-5 ml-0.5"/>}
              </button>
              <span className="absolute left-2 top-2 rounded-full bg-violet-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">{t.category}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h3>
              <p className="text-xs text-slate-500">{t.artist}</p>
              <p className="mt-1 truncate text-[11px] text-slate-400">{t.url}</p>
              {preview===t.url && <audio src={t.url} controls autoPlay className="mt-3 w-full h-8"/>}
              <div className="mt-3 flex gap-2">
                <button onClick={()=> handleEdit(t)} className="flex-1 rounded-xl bg-slate-100 py-2 text-xs font-bold hover:bg-slate-200 dark:bg-slate-800"><Edit2 className="h-3 w-3 inline mr-1"/>Tahrirlash</button>
                <button onClick={()=> handleDelete(t.id)} className="rounded-xl bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"><Trash2 className="h-4 w-4"/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length===0 && <p className="py-20 text-center text-slate-400">Musiqa topilmadi</p>}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 dark:bg-slate-900 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? "Tahrirlash" : "Yangi musiqa qo'shish"}</h3>
              <button onClick={()=> setShowForm(false)} className="rounded-lg p-1.5 hover:bg-slate-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold">Nomi *</label><input value={form.title} onChange={e=> setForm({...form,title:e.target.value})} placeholder="Masalan: Lofi Study Beats" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"/></div>
              <div><label className="text-xs font-bold">Ijrochi</label><input value={form.artist} onChange={e=> setForm({...form,artist:e.target.value})} placeholder="IELTS Master" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"/></div>
              <div><label className="text-xs font-bold">Musiqa URL * (mp3)</label><input value={form.url} onChange={e=> setForm({...form,url:e.target.value})} placeholder="https://.../song.mp3" className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"/></div>
              <div><label className="text-xs font-bold">Cover rasm URL</label><input value={form.coverUrl} onChange={e=> setForm({...form,coverUrl:e.target.value})} placeholder="https://..." className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold">Kategoriya</label><select value={form.category} onChange={e=> setForm({...form,category:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"><option value="reading">Reading</option><option value="focus">Focus</option><option value="ambient">Ambient</option></select></div>
                <div><label className="text-xs font-bold">Davomiylik (soniya)</label><input type="number" value={form.durationSec} onChange={e=> setForm({...form,durationSec:parseInt(e.target.value)})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm dark:bg-slate-800"/></div>
              </div>
              {form.url && <audio src={form.url} controls className="w-full mt-2"/>}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={()=> setShowForm(false)}>Bekor</Button>
              <Button onClick={handleCreate} className="flex-1 bg-violet-600 hover:bg-violet-700"><Save className="h-4 w-4"/> Saqlash</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
