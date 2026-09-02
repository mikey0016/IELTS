export type MarketCategory =
  "badge" | "frame" | "avatar" | "banner" | "bg" | "emoji";
export type MarketMedia = "img" | "video" | "emoji";

export interface MarketItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  icon: string;
  category: MarketCategory;
  imageUrl: string;
  previewUrl: string;
  mediaType: MarketMedia;
  isPremium: boolean;
}

const priceMap: Record<MarketCategory, number> = {
  badge: 80,
  frame: 150,
  avatar: 200,
  banner: 300,
  bg: 400,
  emoji: 0,
};
const iconMap: Record<MarketCategory, string> = {
  badge: "🏅",
  frame: "🖼️",
  avatar: "👤",
  banner: "🎨",
  bg: "🌄",
  emoji: "🦊",
};
const raw = `
https://images.steamusercontent.com/ugc/1838045577744210991/E51AE9834825D29EA7E1075A63D88FED00FB0813/,https://images.steamusercontent.com/ugc/1838045577744210991/E51AE9834825D29EA7E1075A63D88FED00FB0813/,badge,img,false,1
https://images.steamusercontent.com/ugc/1838045115026574819/C4ADA3F96D10C8F635CA25AEBD3784A3BF5C9653/,https://images.steamusercontent.com/ugc/1838045115026574819/C4ADA3F96D10C8F635CA25AEBD3784A3BF5C9653/,badge,img,false,2
https://images.steamusercontent.com/ugc/1838045115026576667/63A9DBBB6D56E2C861E4BB253433A693F0477BAE/,https://images.steamusercontent.com/ugc/1838045115026576667/63A9DBBB6D56E2C861E4BB253433A693F0477BAE/,badge,img,false,3
https://images.steamusercontent.com/ugc/1838045115026576205/B3D5C5D16064A76F0C6F6974B665780E2376A278/,https://images.steamusercontent.com/ugc/1838045115026576205/B3D5C5D16064A76F0C6F6974B665780E2376A278/,badge,img,false,4
https://images.steamusercontent.com/ugc/1838045115026619365/721BA0C8643867855872E9924BFC9A138AC0C12F/,https://images.steamusercontent.com/ugc/1838045115026619365/721BA0C8643867855872E9924BFC9A138AC0C12F/,badge,img,false,5
https://images.steamusercontent.com/ugc/1838045115026695671/3BFA5B38B15C801E3054245FE46DA6A20DEEB8BD/,https://images.steamusercontent.com/ugc/1838045115026695671/3BFA5B38B15C801E3054245FE46DA6A20DEEB8BD/,badge,img,false,6
https://images.steamusercontent.com/ugc/1838045115026696187/0F75EFCC0FE51281CB63764B3067B227C3D63D01/,https://images.steamusercontent.com/ugc/1838045115026696187/0F75EFCC0FE51281CB63764B3067B227C3D63D01/,badge,img,false,7
https://images.steamusercontent.com/ugc/1838045115026697478/968416C9FC451C9B08CC8DDA97F82E02BF824D4C/,https://images.steamusercontent.com/ugc/1838045115026697478/968416C9FC451C9B08CC8DDA97F82E02BF824D4C/,badge,img,false,8
https://images.steamusercontent.com/ugc/1838045115026697902/5B8B82B025579C3C13EDFE99A35F7D0C997A6F8F/,https://images.steamusercontent.com/ugc/1838045115026697902/5B8B82B025579C3C13EDFE99A35F7D0C997A6F8F/,badge,img,false,9
https://images.steamusercontent.com/ugc/1838045115027476285/17514EF0D96762A26C2C7D789440AFD6DA7D5FDC/,https://images.steamusercontent.com/ugc/1838045115027476285/17514EF0D96762A26C2C7D789440AFD6DA7D5FDC/,badge,img,false,10
https://images.steamusercontent.com/ugc/1838045115027475933/3DC67E312625D734727388B773F7B39815D54672/,https://images.steamusercontent.com/ugc/1838045115027475933/3DC67E312625D734727388B773F7B39815D54672/,badge,img,false,11
https://images.steamusercontent.com/ugc/1838045115027477055/FC5C33C1793FB8A2E5E8CE4108027DFBE12C6399/,https://images.steamusercontent.com/ugc/1838045115027477055/FC5C33C1793FB8A2E5E8CE4108027DFBE12C6399/,badge,img,false,12
https://images.steamusercontent.com/ugc/1838045115031329929/AAD3D53B21298F734BD7ED520F565859BB787B90/,https://images.steamusercontent.com/ugc/1838045115031329929/AAD3D53B21298F734BD7ED520F565859BB787B90/,badge,img,false,13
https://images.steamusercontent.com/ugc/1838045115035333774/BF6B48C196B9174FFA81EF04CA78EDD69295DEFB/,https://images.steamusercontent.com/ugc/1838045115035333774/BF6B48C196B9174FFA81EF04CA78EDD69295DEFB/,badge,img,false,14
https://images.steamusercontent.com/ugc/1838045115035324625/EEE040D878E1A12941734B82FBCF2DFD87F1580B/,https://images.steamusercontent.com/ugc/1838045115035324625/EEE040D878E1A12941734B82FBCF2DFD87F1580B/,badge,img,false,15
https://images.steamusercontent.com/ugc/15409034549182281524/EDA6E8FADD5AD1F54A2C4B8B3898000713F53514/,https://images.steamusercontent.com/ugc/15409034549182281524/EDA6E8FADD5AD1F54A2C4B8B3898000713F53514/,badge,img,false,16
https://mirai.senkuro.net/collectibles/319/d9bc002cdb8a574f23b066755fab404032e2726a.webp,https://mirai.senkuro.net/collectibles/319/d9bc002cdb8a574f23b066755fab404032e2726a.webp,frame,img,false,17
https://mirai.senkuro.net/collectibles/318/5d1514c2ea65ca911101bd6897940dcb4f7219c5.webp,https://mirai.senkuro.net/collectibles/318/5d1514c2ea65ca911101bd6897940dcb4f7219c5.webp,frame,img,false,18
https://mirai.senkuro.net/collectibles/317/1091dcb4497f36acc29720ce9af96202c143fd40.webp,https://mirai.senkuro.net/collectibles/317/1091dcb4497f36acc29720ce9af96202c143fd40.webp,frame,img,false,19
https://mirai.senkuro.net/collectibles/315/a8fd74ca361479cb6f72a4e1df5e2c834c16bb87.webp,https://mirai.senkuro.net/collectibles/315/a8fd74ca361479cb6f72a4e1df5e2c834c16bb87.webp,frame,img,false,20
https://mirai.senkuro.net/collectibles/314/018f95ac6097b6ef734050e8e6103a50c1f718ea.webp,https://mirai.senkuro.net/collectibles/314/018f95ac6097b6ef734050e8e6103a50c1f718ea.webp,frame,img,false,21
https://mirai.senkuro.net/collectibles/313/42bf5ce64fbdffd580c0a0d6382c5309b87158e1.webp,https://mirai.senkuro.net/collectibles/313/42bf5ce64fbdffd580c0a0d6382c5309b87158e1.webp,frame,img,false,22
https://mirai.senkuro.net/collectibles/312/e1228a806294fca12852ab1f8334e091609ce694.webp,https://mirai.senkuro.net/collectibles/312/e1228a806294fca12852ab1f8334e091609ce694.webp,frame,img,false,23
https://mirai.senkuro.net/collectibles/311/9d329c86adb8cbc5eddca7979a7f9c30458ad54a.webp,https://mirai.senkuro.net/collectibles/311/9d329c86adb8cbc5eddca7979a7f9c30458ad54a.webp,frame,img,false,24
https://mirai.senkuro.net/collectibles/309/b17466857483412d83655e497b8c5e270dba35bf.webp,https://mirai.senkuro.net/collectibles/309/b17466857483412d83655e497b8c5e270dba35bf.webp,frame,img,false,25
https://mirai.senkuro.net/collectibles/270/b5bab97e7f1d9bbfa35056195ad0e4a99ab5b936.webp,https://mirai.senkuro.net/collectibles/270/b5bab97e7f1d9bbfa35056195ad0e4a99ab5b936.webp,frame,img,false,26
https://mirai.senkuro.net/collectibles/263/b9000d3197cbb23c3576c7bc8835d1ea2c0df834.webp,https://mirai.senkuro.net/collectibles/263/b9000d3197cbb23c3576c7bc8835d1ea2c0df834.webp,frame,img,false,27
https://mirai.senkuro.net/collectibles/248/7911b5dc6027a89348091a5e22a066310b670a83.webp,https://mirai.senkuro.net/collectibles/248/7911b5dc6027a89348091a5e22a066310b670a83.webp,frame,img,false,28
https://mirai.senkuro.net/collectibles/167/fc56fa8caf139c3ee0ff76503c7aa8e01221472b.webp,https://mirai.senkuro.net/collectibles/167/fc56fa8caf139c3ee0ff76503c7aa8e01221472b.webp,frame,img,false,29
https://mirai.senkuro.net/collectibles/169/e6b2a20184adfd50df75b805428298f4961a4d0f.webp,https://mirai.senkuro.net/collectibles/169/e6b2a20184adfd50df75b805428298f4961a4d0f.webp,frame,img,false,30
https://mirai.senkuro.net/collectibles/1/7071cc17e994bbbbdf96021d9515f7d9d4397afc.webp,https://mirai.senkuro.net/collectibles/1/7071cc17e994bbbbdf96021d9515f7d9d4397afc.webp,frame,img,false,31
https://mirai.senkuro.net/collectibles/7/0f38d321e46fed7ef03b73e4099467061aaa3592.webp,https://mirai.senkuro.net/collectibles/7/0f38d321e46fed7ef03b73e4099467061aaa3592.webp,frame,img,false,32
https://i.pinimg.com/originals/4e/c1/ce/4ec1ce232f690681f559aa5ecc7873d2.jpg,https://i.pinimg.com/originals/4e/c1/ce/4ec1ce232f690681f559aa5ecc7873d2.jpg,avata,img,false,33
https://i.pinimg.com/originals/f0/da/8d/f0da8dc29e45f95c8af4ac77500582d8.jpg,https://i.pinimg.com/originals/f0/da/8d/f0da8dc29e45f95c8af4ac77500582d8.jpg,avata,img,false,34
https://i.pinimg.com/originals/ea/f4/2b/eaf42bb232cecbcd0c369d9f1e62ffd5.jpg,https://i.pinimg.com/originals/ea/f4/2b/eaf42bb232cecbcd0c369d9f1e62ffd5.jpg,avata,img,false,35
https://i.pinimg.com/originals/58/0c/5c/580c5cdd179539a37064fd5a2e7ea041.jpg,https://i.pinimg.com/originals/58/0c/5c/580c5cdd179539a37064fd5a2e7ea041.jpg,avata,img,false,36
https://i.pinimg.com/originals/46/78/03/467803688ec379bbd322b3c147dc6d9f.jpg,https://i.pinimg.com/originals/46/78/03/467803688ec379bbd322b3c147dc6d9f.jpg,avata,img,false,37
https://i.pinimg.com/originals/36/63/51/36635149599a3b9009422a6090a5a443.jpg,https://i.pinimg.com/originals/36/63/51/36635149599a3b9009422a6090a5a443.jpg,avata,img,false,38
https://i.pinimg.com/originals/b5/df/7b/b5df7b1a1055b68b27c4933630199bd5.jpg,https://i.pinimg.com/originals/b5/df/7b/b5df7b1a1055b68b27c4933630199bd5.jpg,avata,img,false,39
https://i.pinimg.com/originals/4f/8c/b0/4f8cb0b1f8f900094fce0ce68a3cd46d.png,https://i.pinimg.com/originals/4f/8c/b0/4f8cb0b1f8f900094fce0ce68a3cd46d.png,avata,img,false,40
https://i.pinimg.com/1200x/53/b6/9f/53b69f5c50053d3dcc3de2c06d5d6516.jpg,https://i.pinimg.com/1200x/53/b6/9f/53b69f5c50053d3dcc3de2c06d5d6516.jpg,avata,img,false,41
https://i.pinimg.com/originals/9a/98/03/9a980395cff2c355402942f9d0d87db8.jpg,https://i.pinimg.com/originals/9a/98/03/9a980395cff2c355402942f9d0d87db8.jpg,avata,img,false,42
https://i.pinimg.com/originals/29/b7/91/29b79135b1fc62a2457c8eab403851bc.jpg,https://i.pinimg.com/originals/29/b7/91/29b79135b1fc62a2457c8eab403851bc.jpg,avata,img,false,43
https://i.pinimg.com/originals/53/83/a0/5383a065ddbf2506da0be617ba4bb0cd.jpg,https://i.pinimg.com/originals/53/83/a0/5383a065ddbf2506da0be617ba4bb0cd.jpg,avata,img,false,44
https://i.pinimg.com/originals/44/0a/b7/440ab7c57587cbda3d290e97958eac62.jpg,https://i.pinimg.com/originals/44/0a/b7/440ab7c57587cbda3d290e97958eac62.jpg,avata,img,false,45
https://i.pinimg.com/originals/f0/3d/1d/f03d1d4b9910b969689c4e88f367f4d8.jpg,https://i.pinimg.com/originals/f0/3d/1d/f03d1d4b9910b969689c4e88f367f4d8.jpg,avata,img,false,46
https://i.pinimg.com/originals/d4/38/1b/d4381b3ea0ebb7f14c0ff33656218b91.jpg,https://i.pinimg.com/originals/d4/38/1b/d4381b3ea0ebb7f14c0ff33656218b91.jpg,avata,img,false,47
https://i.pinimg.com/originals/73/cd/09/73cd09f43b4ca5b2d56c152a79ac5c60.png,https://i.pinimg.com/originals/73/cd/09/73cd09f43b4ca5b2d56c152a79ac5c60.png,avata,img,false,48
https://i.pinimg.com/originals/e1/8d/e4/e18de4340c6f4aeda2ad8532dcf64a08.jpg,https://i.pinimg.com/originals/e1/8d/e4/e18de4340c6f4aeda2ad8532dcf64a08.jpg,avata,img,false,49
https://i.pinimg.com/1200x/18/35/18/1835183e41beb15e65cbaf78809a99cf.jpg,https://i.pinimg.com/1200x/18/35/18/1835183e41beb15e65cbaf78809a99cf.jpg,avata,img,false,50
https://i.pinimg.com/originals/5c/55/fc/5c55fcb4f8f281354c9def9d8727993b.jpg,https://i.pinimg.com/originals/5c/55/fc/5c55fcb4f8f281354c9def9d8727993b.jpg,avata,img,false,51
https://i.pinimg.com/originals/92/23/43/9223430d43fda43bb37acadaa424e767.gif,https://i.pinimg.com/originals/92/23/43/9223430d43fda43bb37acadaa424e767.gif,avata,img,false,52
https://i.pinimg.com/originals/e9/5f/5a/e95f5a0e5d6fa3eb5204838eef6ce7fd.jpg,https://i.pinimg.com/originals/e9/5f/5a/e95f5a0e5d6fa3eb5204838eef6ce7fd.jpg,avata,img,false,53
https://i.pinimg.com/originals/86/de/15/86de153bf00265ff58f0cf66724490bd.jpg,https://i.pinimg.com/originals/86/de/15/86de153bf00265ff58f0cf66724490bd.jpg,avata,img,false,54
https://i.pinimg.com/originals/1e/07/71/1e077194fcfa49f17803b3fe019ce4b4.jpg,https://i.pinimg.com/originals/1e/07/71/1e077194fcfa49f17803b3fe019ce4b4.jpg,avata,img,false,55
https://i.pinimg.com/originals/0e/5a/d9/0e5ad9c21d975f91c2876015cc44871b.jpg,https://i.pinimg.com/originals/0e/5a/d9/0e5ad9c21d975f91c2876015cc44871b.jpg,avata,img,false,56
https://mirai.senkuro.net/collectibles/328/21ad0615618ad9951419f9e18f61ef6d76f5ede7_320.webm,https://mirai.senkuro.net/collectibles/328/21ad0615618ad9951419f9e18f61ef6d76f5ede7_320.webm,banner,video,false,57
https://mirai.senkuro.net/collectibles/306/9f9bc6466236c59d04430db2cb33d134a51888aa_320.webm,https://mirai.senkuro.net/collectibles/306/9f9bc6466236c59d04430db2cb33d134a51888aa_320.webm,banner,video,false,58
https://mirai.senkuro.net/collectibles/299/698df52f6cfbcf2a4c1466e23e70298e18b3d301_320.webm,https://mirai.senkuro.net/collectibles/299/698df52f6cfbcf2a4c1466e23e70298e18b3d301_320.webm,banner,video,false,59
https://mirai.senkuro.net/collectibles/298/0211948ae98a2898fefe88cc9559867f67928737_320.webm,https://mirai.senkuro.net/collectibles/298/0211948ae98a2898fefe88cc9559867f67928737_320.webm,banner,video,false,60
https://mirai.senkuro.net/collectibles/286/ee4994de1e9bb28df1b41bbeb949494f38951fc3.jpeg,https://mirai.senkuro.net/collectibles/286/ee4994de1e9bb28df1b41bbeb949494f38951fc3.jpeg,banner,img,false,61
https://mirai.senkuro.net/collectibles/295/ee8a1625af1147c899924565dfec3baa67d6625c_320.webm,https://mirai.senkuro.net/collectibles/295/ee8a1625af1147c899924565dfec3baa67d6625c_320.webm,banner,video,false,62
https://mirai.senkuro.net/collectibles/181/e6a194cbc42b4b7dddc54d6eb39387eed1623785_320.webm,https://mirai.senkuro.net/collectibles/181/e6a194cbc42b4b7dddc54d6eb39387eed1623785_320.webm,banner,video,false,63
https://mirai.senkuro.net/collectibles/180/450ae1e9a623bbf85005b241f00d5fc3ba9d2317_320.webm,https://mirai.senkuro.net/collectibles/180/450ae1e9a623bbf85005b241f00d5fc3ba9d2317_320.webm,banner,video,false,64
https://mirai.senkuro.net/collectibles/41/778c2a4e122ea7d9af83d1b8dd13e331e96569e6_320.webm,https://mirai.senkuro.net/collectibles/41/778c2a4e122ea7d9af83d1b8dd13e331e96569e6_320.webm,banner,video,false,65
https://mirai.senkuro.net/collectibles/40/51b207ab9ca80077086b3a1eed096f59ca0a52f7_320.webm,https://mirai.senkuro.net/collectibles/40/51b207ab9ca80077086b3a1eed096f59ca0a52f7_320.webm,banner,video,false,66
https://i.pinimg.com/originals/e1/b4/97/e1b497d5cc627017dcb13fdf3dfe1a3c.jpg,https://i.pinimg.com/originals/e1/b4/97/e1b497d5cc627017dcb13fdf3dfe1a3c.jpg,banner,img,false,67
https://i.pinimg.com/originals/16/be/c9/16bec9a832a1b90ca555c363c4837401.jpg,https://i.pinimg.com/originals/16/be/c9/16bec9a832a1b90ca555c363c4837401.jpg,banner,img,false,68
https://i.pinimg.com/originals/17/2f/a8/172fa8dd96d6e13f4b1825594034ec78.jpg,https://i.pinimg.com/originals/17/2f/a8/172fa8dd96d6e13f4b1825594034ec78.jpg,banner,img,false,69
https://i.pinimg.com/originals/f6/f5/cd/f6f5cd63fac0ec3dbf0f73fd74cbae6c.jpg,https://i.pinimg.com/originals/f6/f5/cd/f6f5cd63fac0ec3dbf0f73fd74cbae6c.jpg,banner,img,false,70
https://i.pinimg.com/originals/38/6b/0f/386b0f2411fbed04ccc775d8f8498f42.jpg,https://i.pinimg.com/originals/38/6b/0f/386b0f2411fbed04ccc775d8f8498f42.jpg,banner,img,false,71
https://i.pinimg.com/originals/aa/55/41/aa5541d265687d1fb50d15e6088013d6.jpg,https://i.pinimg.com/originals/aa/55/41/aa5541d265687d1fb50d15e6088013d6.jpg,banner,img,false,72
https://i.pinimg.com/originals/d2/a6/cc/d2a6cc7134978023c1149b3b27b305d4.gif,https://i.pinimg.com/originals/d2/a6/cc/d2a6cc7134978023c1149b3b27b305d4.gif,banner,img,false,73
https://i.pinimg.com/originals/3a/e6/7d/3ae67df286b9b8e568de17e4657fd21d.jpg,https://i.pinimg.com/originals/3a/e6/7d/3ae67df286b9b8e568de17e4657fd21d.jpg,banner,img,false,74
https://i.pinimg.com/originals/73/cd/09/73cd09f43b4ca5b2d56c152a79ac5c60.png,https://i.pinimg.com/originals/73/cd/09/73cd09f43b4ca5b2d56c152a79ac5c60.png,avata,img,false,48
🦊,,avata,emoji,true,0
/bg/bg_1.jpg,/bg/bg_1.jpg,bg,img,false,75
/bg/bg_2.jpg,/bg/bg_2.jpg,bg,img,false,76
/bg/bg_3.png,/bg/bg_3.png,bg,img,false,77
/bg/bg_4.jpg,/bg/bg_4.jpg,bg,img,false,78
/bg/bg_6.jpg,/bg/bg_6.jpg,bg,img,false,80
/bg/bg_7.jpg,/bg/bg_7.jpg,bg,img,false,81
/bg/bg_8.jpg,/bg/bg_8.jpg,bg,img,false,82
`.trim();

function parseMarket(): MarketItem[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const seen = new Set<number>();
  const items: MarketItem[] = [];
  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 6) continue;
    let [preview, image, catRaw, mediaRaw, isPremStr, idStr] = parts;
    let cat = catRaw.toLowerCase() as MarketCategory;
    if (cat === ("avata" as any)) cat = "avatar" as MarketCategory;
    let media = mediaRaw.toLowerCase() as MarketMedia;
    if (media === "emoji") cat = "emoji";
    if (!(cat in priceMap)) cat = image.includes("pinimg") ? "avatar" : "badge";
    const id = parseInt(idStr) || 0;
    if (seen.has(id)) continue;
    seen.add(id);
    let price = priceMap[cat] ?? 100;
    if (media === "video") price += 50;
    if (cat === "emoji") {
      preview = "🦊";
      image = "🦊";
      price = 0;
    }
    if (!image) {
      image = "🦊";
      preview = "🦊";
    }
    // normalize bg local path to usable url (public folder) — keep as /bg/... but ensure it works, fallback handled in UI
    if (cat === "bg" && image.startsWith("/bg/")) {
      // keep as is, Vite will serve from public if exists, otherwise fallback to gradient
    }
    const names: Record<MarketCategory, string> = {
      badge: `Badge #${id} — IELTS Badge`,
      frame: `Frame #${id} — Profile Frame`,
      avatar: `Avatar #${id}`,
      banner: `Banner #${id} — Profile Banner`,
      bg: `Background #${id}`,
      emoji: "Fox Emoji",
    };
    const descs: Record<MarketCategory, string> = {
      badge: "Profilingiz uchun yorqin badge — do‘stlar ro‘yxatida ko‘rinadi",
      frame: "Avatar atrofida chiroyli ramka",
      avatar: "Mashhur avatar — profil rasmingiz uchun",
      banner: "Profil banneri — shaxsiy sahifangizni bezang",
      bg: "Fon rasmi — dashboard va profil foni",
      emoji: "Maxsus emoji — chat va commentlarda",
    };
    items.push({
      id,
      name: names[cat],
      desc: descs[cat],
      price,
      icon: iconMap[cat],
      category: cat,
      imageUrl: image,
      previewUrl: preview,
      mediaType: media,
      isPremium: isPremStr.toLowerCase() === "true",
    });
  }
  // sort by id
  items.sort((a, b) => a.id - b.id);
  return items;
}

export const MARKET_ITEMS: MarketItem[] = parseMarket();
