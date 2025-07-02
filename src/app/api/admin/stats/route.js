import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }
  const totalUsuarios = await prisma.user.count();
  const totalProyectos = await prisma.project.count();
  const totalFirmas = await prisma.signature.count();
  return Response.json({
    totalUsuarios,
    totalProyectos,
    totalFirmas
  });
} 