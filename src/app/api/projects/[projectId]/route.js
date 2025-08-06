import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { projectId } = await params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { signatures: true },
    });
    if (!project) {
      return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    // Si es cliente, solo puede ver su propio proyecto
    if (session.user.role === 'CLIENT' && project.ownerId !== session.user.id) {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }
    return Response.json(project);
  } catch (error) {
    return Response.json({ error: 'Error al obtener proyecto' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { projectId } = await params;
  const data = await req.json();
  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }
    // Solo el dueño o admin pueden editar
    if (session.user.role !== 'ADMIN' && project.ownerId !== session.user.id) {
      return Response.json({ error: 'No autorizado' }, { status: 403 });
    }
    // Eliminar firmas anteriores
    await prisma.signature.deleteMany({ where: { projectId } });
    // Preparar nuevas firmas con token si es necesario
    const signaturesWithToken = (data.signatures || []).map(sig => {
      if (!sig.userId) {
        return { ...sig, token: sig.token || randomBytes(24).toString('hex') };
      }
      return sig;
    });
    // Actualizar proyecto y crear nuevas firmas
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        type: data.type,
        clientCompany: data.clientCompany,
        keyUser: data.keyUser,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        realEndDate: data.realEndDate ? new Date(data.realEndDate) : undefined,
        scopeObjectives: data.scopeObjectives,
        comments: data.comments,
        ownerId: data.ownerId,
        signatures: {
          create: signaturesWithToken
        }
      },
      include: { signatures: true }
    });
    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: 'Error al actualizar proyecto' }, { status: 500 });
  }
} 