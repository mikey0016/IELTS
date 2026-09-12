const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const hash = (p) => bcrypt.hashSync(p, 10);

  const users = [
    {
      id: "u_demo",
      name: "Alex Carter",
      email: "alex@ieltsmaster.com",
      passwordHash: hash("demo1234"),
      avatarColor: "#4c56ec",
      targetBand: 7.5,
      examDate: "2026-12-15",
      dailyGoalMin: 30,
      planType: "premium",
      role: "student",
      status: "active",
    },
    {
      id: "u_admin",
      name: "Admin Master",
      email: "admin@ieltsmaster.com",
      passwordHash: hash("admin123"),
      avatarColor: "#7c3aed",
      targetBand: 9,
      examDate: "",
      dailyGoalMin: 60,
      planType: "pro",
      role: "admin",
      status: "active",
    },
    {
      id: "u_superadmin",
      name: "Super Admin",
      email: "superadmin@ieltsmaster.com",
      passwordHash: hash("superadmin123"),
      avatarColor: "#0f172a",
      targetBand: 9,
      examDate: "",
      dailyGoalMin: 60,
      planType: "pro",
      role: "superadmin",
      status: "active",
    },
    {
      id: "u_s1",
      name: "Sarvar Rahimov",
      email: "sarvar.r@ielts.uz",
      passwordHash: hash("sarvar123"),
      avatarColor: "#305c8d",
      targetBand: 8,
      examDate: "2026-09-20",
      dailyGoalMin: 45,
      planType: "premium",
      role: "student",
      status: "active",
    },
    {
      id: "u_s2",
      name: "Madina Yusupova",
      email: "madina.y@ielts.uz",
      passwordHash: hash("madina123"),
      avatarColor: "#7c3aed",
      targetBand: 7.5,
      examDate: "2026-10-05",
      dailyGoalMin: 30,
      planType: "premium",
      role: "student",
      status: "active",
    },
    {
      id: "u_s3",
      name: "Jasur Toshpulatov",
      email: "jasur.t@ielts.uz",
      passwordHash: hash("jasur123"),
      avatarColor: "#0e7490",
      targetBand: 7,
      examDate: "2026-11-12",
      dailyGoalMin: 30,
      planType: "free",
      role: "student",
      status: "banned",
      bannedReason: "Spam activity",
    },
    {
      id: "u_s4",
      name: "Nilufar Azimova",
      email: "nilufar.a@ielts.uz",
      passwordHash: hash("nilufar123"),
      avatarColor: "#059669",
      targetBand: 8.5,
      examDate: "2026-08-30",
      dailyGoalMin: 60,
      planType: "pro",
      role: "student",
      status: "active",
    },
    {
      id: "u_s5",
      name: "Otabek Karimov",
      email: "otabek.k@ielts.uz",
      passwordHash: hash("otabek123"),
      avatarColor: "#d97706",
      targetBand: 6.5,
      examDate: "2026-12-01",
      dailyGoalMin: 30,
      planType: "free",
      role: "student",
      status: "pending",
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: u.passwordHash,
        avatarColor: u.avatarColor,
        targetBand: u.targetBand,
        planType: u.planType,
        role: u.role,
        status: u.status,
        bannedReason: u.bannedReason || null,
      },
      create: u,
    });
    console.log(`seeded ${u.email}`);
  }
  console.log("✅ Seed done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
