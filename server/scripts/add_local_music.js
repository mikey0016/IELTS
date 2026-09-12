const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function main(){
  const dir = path.join(__dirname, "../../public/music");
  const files = fs.readdirSync(dir).filter(f => /\.(mp3|m4a|flac|wav|ogg)$/i.test(f));
  console.log(`Found ${files.length} files`);
  let added=0;
  for(const file of files){
    const url = "/music/" + encodeURIComponent(file);
    // check if already exists by url
    const existing = await prisma.music.findFirst({ where: { url }});
    if(existing){
      console.log(`exists ${file}`);
      continue;
    }
    let artist = "IELTS Master";
    let title = path.parse(file).name;
    const lower = file.toLowerCase();
    if(lower.includes("lana")) artist = "Lana Del Rey";
    else if(lower.includes("billie")) artist = "Billie Eilish";
    else if(lower.includes("lana del")) artist = "Lana Del Rey";
    else if(lower.includes("arctic monkeys")) artist = "Arctic Monkeys";
    else if(lower.includes("tame impala")) artist = "Tame Impala";
    else if(lower.includes("laufey")) artist = "Laufey";
    else if(lower.includes("michael jackson")) artist = "Michael Jackson";
    else if(lower.includes("diplo")) artist = "Diplo";
    // clean title: remove extension, replace underscores, trim
    title = title.replace(/_/g, " ").replace(/\s+/g, " ").trim();
    // remove leading numbers like "01 ", "03.", etc.
    title = title.replace(/^\d+[\s\-\.]+/, "").trim();
    if(!title) title = file;
    await prisma.music.create({
      data: {
        title: title.slice(0, 100),
        artist,
        url,
        coverUrl: null,
        category: "reading",
        order: 100 + added,
        durationSec: 0,
      }
    });
    console.log(`added ${artist} - ${title}`);
    added++;
  }
  console.log(`✅ Added ${added} local tracks`);
  const total = await prisma.music.count();
  console.log(`Total music: ${total}`);
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
