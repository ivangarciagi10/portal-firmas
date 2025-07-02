const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'clientegeneral@demo.com';
  const name = 'Cliente General';
  const role = 'CLIENT';

  // Si ya existe, no lo crea de nuevo
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name,
        email,
        role
      }
    });
    console.log('Usuario Cliente General creado');
  } else {
    console.log('Usuario Cliente General ya existe');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 