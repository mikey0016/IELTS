const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const tracks = [
    {
      title: "Lofi Study Beats",
      artist: "IELTS Focus",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
      durationSec: 120,
      category: "reading",
      order: 1,
    },
    {
      title: "Gentle Piano Ambient",
      artist: "Calm Reading",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
      durationSec: 135,
      category: "reading",
      order: 2,
    },
    {
      title: "Soft Rain & Focus",
      artist: "Ambient Collection",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      coverUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=300",
      durationSec: 140,
      category: "focus",
      order: 3,
    },
    {
      title: "Morning Light Acoustic",
      artist: "Study Vibes",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300",
      durationSec: 150,
      category: "reading",
      order: 4,
    },
    {
      title: "Deep Concentration",
      artist: "IELTS Master",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300",
      durationSec: 160,
      category: "focus",
      order: 5,
    },
    {
      title: "Evening Library",
      artist: "Quiet Hours",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      coverUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300",
      durationSec: 145,
      category: "reading",
      order: 6,
    },
  ];

  for (const t of tracks) {
    const existing = await prisma.music.findFirst({ where: { title: t.title } });
    if (!existing) {
      await prisma.music.create({ data: t });
      console.log(`seeded ${t.title}`);
    } else {
      console.log(`exists ${t.title}`);
    }
  }
  console.log("✅ Music seeded");
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
