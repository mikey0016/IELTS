const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main(){
  const tracks = [
    // Lana Del Rey
    { title: "Summertime Sadness", artist: "Lana Del Rey", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d1/64/e3/d164e3bb-aeb5-effb-a09c-d3775441c5b8/mzaf_3133376794831917475.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/d9/63/5fd96387-45fa-6b94-afd8-7b2c4a24a93b/11UMGIM38959.rgb.jpg/500x500bb.jpg", category: "reading", order: 10 },
    { title: "Young and Beautiful", artist: "Lana Del Rey", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/0b/8a/d70b8adf-8a27-aafa-76a4-f59200be9ab0/mzaf_6008955516336655319.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/e3/e3/13/e3e31393-abf5-e9b1-edc4-20ede35d0c75/13UMGIM43701.rgb.jpg/500x500bb.jpg", category: "reading", order: 11 },
    { title: "Video Games", artist: "Lana Del Rey", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d2/15/5d/d2155d1d-0ec5-6918-57e0-a1cea36cb70b/mzaf_8368586371262139085.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/d9/63/5fd96387-45fa-6b94-afd8-7b2c4a24a93b/11UMGIM38959.rgb.jpg/500x500bb.jpg", category: "reading", order: 12 },
    { title: "Cinnamon Girl", artist: "Lana Del Rey", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/86/ab/c9/86abc949-717d-b99e-ccc1-2d06a10e01d6/mzaf_13331833199397738074.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/c6/5f/b9/c65fb9eb-da2f-89a9-b640-2fff1fc3a660/19UMGIM61350.rgb.jpg/500x500bb.jpg", category: "reading", order: 13 },
    { title: "Art Deco", artist: "Lana Del Rey", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/eb/79/4aeb79f3-082f-db52-3c5f-ce8011bcfc04/mzaf_7046295694749755255.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a2/e1/35/a2e1350a-c739-dc75-93f5-b3e8b33d7d7e/15UMGIM44419.rgb.jpg/500x500bb.jpg", category: "reading", order: 14 },
    // Billie Eilish
    { title: "WILDFLOWER", artist: "Billie Eilish", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/de/c3/e8/dec3e884-7237-9622-718a-12c5f48c5ca2/mzaf_3134455671785145822.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/500x500bb.jpg", category: "reading", order: 20 },
    { title: "ocean eyes", artist: "Billie Eilish", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d6/59/2b/d6592b0b-1e7e-4743-b2e4-f2af038fd783/mzaf_7697277787797935735.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/1d/30/021d3036-5503-3ed3-df00-882f2833a6ae/17UM1IM17026.rgb.jpg/500x500bb.jpg", category: "reading", order: 21 },
    { title: "BIRDS OF A FEATHER", artist: "Billie Eilish", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/34/31/d3/3431d34e-847f-5d66-df83-0bce688d997e/mzaf_18106743962423782018.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/500x500bb.jpg", category: "reading", order: 22 },
    { title: "lovely", artist: "Billie Eilish & Khalid", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1e/d8/8d/1ed88d91-fb06-b3f2-5391-afd732cc2ff9/mzaf_18444937225262929488.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/27/94/d4/2794d4fc-c3e2-2373-3e6c-dd82fd5aefe6/18UMGIM18200.rgb.jpg/500x500bb.jpg", category: "reading", order: 23 },
    { title: "bad guy", artist: "Billie Eilish", url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/87/1f/c3871f7e-3260-d615-1c66-5fdca2c3a48f/mzaf_10721331211699880949.plus.aac.p.m4a", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/19UMGIM05028.rgb.jpg/500x500bb.jpg", category: "reading", order: 24 },
  ];

  for(const t of tracks){
    const existing = await prisma.music.findFirst({ where: { title: t.title, artist: t.artist }});
    if(existing){
      console.log(`exists ${t.artist} - ${t.title}`);
      continue;
    }
    await prisma.music.create({ data: { title: t.title, artist: t.artist, url: t.url, coverUrl: t.coverUrl, category: t.category, order: t.order, durationSec: 30 }});
    console.log(`added ${t.artist} - ${t.title}`);
  }
  console.log("✅ Lana & Billie added to reading list");
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
