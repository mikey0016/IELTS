import { apiFetch, isRealApi } from "./http";
import { mockRequest } from "./mockClient";

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl?: string;
  durationSec?: number;
  category: string;
  isActive: boolean;
  order: number;
}

const FALLBACK_TRACKS: MusicTrack[] = [
  {
    id: "m1",
    title: "Lofi Study Beats",
    artist: "IELTS Focus",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
    category: "reading",
    isActive: true,
    order: 1,
  },
  {
    id: "m2",
    title: "Gentle Piano Ambient",
    artist: "Calm Reading",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
    category: "reading",
    isActive: true,
    order: 2,
  },
  {
    id: "m3",
    title: "Soft Rain & Focus",
    artist: "Ambient Collection",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "focus",
    isActive: true,
    order: 3,
  },
];

export function listMusic(category?: string): Promise<MusicTrack[]> {
  if (isRealApi()) {
    const q = category && category !== "all" ? `?category=${category}` : "";
    return apiFetch(`/api/music${q}`).then((d: any) => d as MusicTrack[]).catch(() => mockRequest(() => FALLBACK_TRACKS, 400));
  }
  return mockRequest(() => FALLBACK_TRACKS, 400);
}

export function adminListMusic(): Promise<MusicTrack[]> {
  if (isRealApi()) return apiFetch("/api/admin/music").catch(() => mockRequest(() => FALLBACK_TRACKS, 400));
  return mockRequest(() => FALLBACK_TRACKS, 400);
}

export function adminCreateMusic(data: Partial<MusicTrack> & { title: string; url: string }): Promise<MusicTrack> {
  if (isRealApi()) return apiFetch("/api/admin/music", { method: "POST", body: JSON.stringify(data) }).catch(() => mockRequest(() => ({ id: `m_${Date.now()}`, title: data.title, artist: data.artist || "IELTS Master", url: data.url, category: data.category || "reading", isActive: true, order: 0 } as MusicTrack), 400));
  return mockRequest(() => ({ id: `m_${Date.now()}`, title: data.title, artist: data.artist || "IELTS Master", url: data.url, category: data.category || "reading", isActive: true, order: 0 } as MusicTrack), 400);
}

export function adminUpdateMusic(id: string, patch: Partial<MusicTrack>): Promise<MusicTrack> {
  if (isRealApi()) return apiFetch(`/api/admin/music/${id}`, { method: "PUT", body: JSON.stringify(patch) }).catch(() => mockRequest(() => ({ ...FALLBACK_TRACKS[0], ...patch, id } as MusicTrack), 400));
  return mockRequest(() => ({ ...FALLBACK_TRACKS[0], ...patch, id } as MusicTrack), 400);
}

export function adminDeleteMusic(id: string): Promise<void> {
  if (isRealApi()) return apiFetch(`/api/admin/music/${id}`, { method: "DELETE" }).then(() => undefined).catch(() => mockRequest(() => undefined, 400));
  return mockRequest(() => undefined, 400);
}
