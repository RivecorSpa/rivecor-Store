const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@rivecor.com";
  const password = "1234";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      active: true,
    },
    create: {
      name: "Administrador Rivecor",
      email,
      password: hashedPassword,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("Admin creado:");
  console.log("Email:", email);
  console.log("Password:", password);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());