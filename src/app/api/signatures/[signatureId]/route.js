import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { signatureId } = params;
  try {
    const signature = await prisma.signature.findUnique({ where: { id: signatureId } });
    if (!signature) {
      return Response.json({ error: 'Firma no encontrada' }, { status: 404 });
    }
    // Solo el usuario asignado puede firmar
    if (signature.userId !== session.user.id) {
      return Response.json({ error: 'No autorizado para firmar' }, { status: 403 });
    }
    if (signature.signedAt) {
      return Response.json({ error: 'Ya firmado' }, { status: 400 });
    }
    await prisma.signature.update({
      where: { id: signatureId },
      data: { signedAt: new Date() },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Error al firmar' }, { status: 500 });
  }
}
