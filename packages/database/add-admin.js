const { PrismaClient, Role } = require("@prisma/client");
const crypto = require("crypto");

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const prisma = new PrismaClient();

async function addAdmin() {
  const adminEmail = "admin@genielight-co.com";
  const adminPassword = "Admin@Genie2026!";
  const passwordHash = hashPassword(adminPassword);

  console.log("Upserting admin account...");
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
      name: "Eng. Ahmed Mostafa (Admin)",
    },
    create: {
      email: adminEmail,
      name: "Eng. Ahmed Mostafa (Admin)",
      passwordHash,
      phone: "+20 101 479 4281",
      company: "Genie Light",
      role: Role.ADMIN,
    },
  });

  console.log("Admin account created/updated successfully:");
  console.log({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  // Also add a convenient admin@genielight.com alias just in case
  const secondaryAdminEmail = "admin@genielight.com";
  const secondaryAdmin = await prisma.user.upsert({
    where: { email: secondaryAdminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
      name: "Genie Admin",
    },
    create: {
      email: secondaryAdminEmail,
      name: "Genie Admin",
      passwordHash,
      phone: "+20 100 000 0000",
      company: "Genie Light",
      role: Role.ADMIN,
    },
  });

  console.log("Secondary admin account created/updated successfully:");
  console.log({
    id: secondaryAdmin.id,
    email: secondaryAdmin.email,
    name: secondaryAdmin.name,
    role: secondaryAdmin.role,
  });
}

addAdmin()
  .catch((e) => {
    console.error("Error adding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
