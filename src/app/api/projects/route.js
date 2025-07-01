import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const user = session.user;
  let projects = [];
  if (user.role === 'ADMIN') {
    projects = await prisma.project.findMany({ include: { signatures: true } });
  } else if (user.role === 'CLIENT') {
    projects = await prisma.project.findMany({ where: { ownerId: user.id }, include: { signatures: true } });
  } else {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }
  return Response.json(projects);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }
  
  const data = await req.json();
  const {
    name,
    type,
    clientCompany,
    keyUser,
    startDate,
    plannedEndDate,
    realEndDate,
    scopeObjectives,
    comments,
    ownerId,
    signatures
  } = data;
  
  // Validar campos requeridos
  if (!name || !type || !clientCompany || !keyUser || !startDate || !plannedEndDate || !scopeObjectives) {
    return Response.json({ 
      error: 'Faltan campos requeridos',
      required: ['name', 'type', 'clientCompany', 'keyUser', 'startDate', 'plannedEndDate', 'scopeObjectives']
    }, { status: 400 });
  }
  
  try {
    // Generar token para firmas de invitados
    const signaturesWithToken = (signatures || []).map(sig => {
      if (!sig.userId) {
        // Generar token único con timestamp para evitar duplicados
        const timestamp = Date.now().toString(36);
        const random = randomBytes(16).toString('hex');
        return { ...sig, token: `${timestamp}-${random}` };
      }
      return sig;
    });
    const project = await prisma.project.create({
      data: {
        name,
        type,
        clientCompany,
        keyUser,
        startDate: startDate ? new Date(startDate) : new Date(),
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : new Date(),
        realEndDate: realEndDate ? new Date(realEndDate) : null,
        scopeObjectives,
        comments,
        ownerId,
        signatures: {
          create: signaturesWithToken
        }
      },
      include: { signatures: true }
    });
    return Response.json(project);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    return Response.json({ 
      error: 'Error al crear proyecto', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }
  let id;
  if (req.method === 'DELETE') {
    // Next.js App Router: id por query param o body
    const url = new URL(req.url, 'http://localhost');
    id = url.searchParams.get('id');
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
  }
  if (!id) {
    return Response.json({ error: 'ID de proyecto requerido' }, { status: 400 });
  }
  try {
    await prisma.project.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Error al borrar proyecto' }, { status: 500 });
  }
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'No autorizado' }, { status: 403 });
  }
  const data = await req.json();
  const {
    id,
    name,
    type,
    clientCompany,
    keyUser,
    startDate,
    plannedEndDate,
    realEndDate,
    scopeObjectives,
    comments,
    ownerId,
    signatures
  } = data;
  if (!id) {
    return Response.json({ error: 'ID de proyecto requerido' }, { status: 400 });
  }
  try {
    // Eliminar firmas anteriores y crear nuevas (simplificado)
    await prisma.signature.deleteMany({ where: { projectId: id } });
    const signaturesWithToken = (signatures || []).map(sig => {
      if (!sig.userId) {
        // Generar token único con timestamp para evitar duplicados
        const timestamp = Date.now().toString(36);
        const random = randomBytes(16).toString('hex');
        return { ...sig, token: sig.token || `${timestamp}-${random}` };
      }
      return sig;
    });
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        type,
        clientCompany,
        keyUser,
        startDate: new Date(startDate),
        plannedEndDate: new Date(plannedEndDate),
        realEndDate: realEndDate ? new Date(realEndDate) : null,
        scopeObjectives,
        comments,
        ownerId,
        signatures: {
          create: signaturesWithToken
        }
      },
      include: { signatures: true }
    });
    return Response.json(project);
  } catch (error) {
    console.error('Error al editar proyecto:', error);
    return Response.json({ 
      error: 'Error al editar proyecto', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 