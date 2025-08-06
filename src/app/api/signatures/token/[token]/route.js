import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const { token } = await params;
  try {
    const signature = await prisma.signature.findUnique({ where: { token } });
    if (!signature) {
      return Response.json({ error: 'Firma no encontrada' }, { status: 404 });
    }
    return Response.json(signature);
  } catch (error) {
    console.error('Error en GET /api/signatures/token/[token]:', error);
    return Response.json({ error: 'Error al obtener firma', details: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const { token } = await params;
  try {
    const signature = await prisma.signature.findUnique({ where: { token } });
    if (!signature) {
      return Response.json({ error: 'Firma no encontrada' }, { status: 404 });
    }
    if (signature.signedAt || signature.estado === 'REJECTED') {
      return Response.json({ error: 'Ya firmado o rechazado' }, { status: 400 });
    }
    const body = await req.json();
    if (body.estado === 'REJECTED') {
      await prisma.signature.update({
        where: { token },
        data: {
          estado: 'REJECTED',
          motivoRechazo: body.motivoRechazo,
          comentario: body.comentario,
        },
      });
      return Response.json({ rejected: true });
    } else if (body.estado === 'ACCEPTED') {
      await prisma.signature.update({
        where: { token },
        data: {
          estado: 'ACCEPTED',
          signedAt: new Date(),
          comentario: body.comentario,
          nombreCompleto: body.nombreCompleto,
          // signatureImage no longer required - simplified review process
          calificacionGeneral: body.calificacionGeneral,
          calidadDesarrollo: body.calidadDesarrollo,
          comunicacion: body.comunicacion,
          cumplimientoTiempos: body.cumplimientoTiempos,
          recomendacion: body.recomendacion,
          feedback: body.feedback,
        },
      });
      return Response.json({ success: true });
    } else {
      return Response.json({ error: 'Estado inválido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en POST /api/signatures/token/[token]:', error);
    return Response.json({ error: 'Error al firmar', details: error.message }, { status: 500 });
  }
}
