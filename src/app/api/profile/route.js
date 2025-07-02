import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const userId = session.user.id;
  const { name, email, empresa, puesto } = await req.json();
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { name, email, empresa, puesto }
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Error al actualizar datos' }, { status: 500 });
  }
} 