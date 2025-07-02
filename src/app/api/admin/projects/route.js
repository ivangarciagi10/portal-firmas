import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      clientCompany: true,
      keyUser: true,
      startDate: true,
      plannedEndDate: true,
      realEndDate: true,
      owner: { select: { name: true, email: true } },
      signatures: true,
      comments: true
    },
    orderBy: { startDate: 'desc' }
  });
  return Response.json(projects);
} 