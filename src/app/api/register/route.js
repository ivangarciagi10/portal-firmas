import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return Response.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }
    // Verificar si ya existe el usuario
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'El correo ya está registrado' }, { status: 400 });
    }
    // Verificar si es el primer usuario
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'CLIENT';
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Error en el registro' }, { status: 500 });
  }
}
