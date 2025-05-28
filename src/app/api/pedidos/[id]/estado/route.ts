import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { estado } = body;
    console.log('Datos recibidos:', { id, estado, body });

    if (!estado) {
      console.error('Estado no proporcionado en la solicitud');
      return NextResponse.json({ message: 'Estado requerido' }, { status: 400 });
    }

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['pendiente', 'en_proceso', 'completado', 'cancelado'];
    if (!estadosPermitidos.includes(estado)) {
      console.error('Estado no válido:', estado);
      return NextResponse.json({ 
        message: 'Estado no válido', 
        estadosPermitidos 
      }, { status: 400 });
    }

    // Verificar que el pedido existe antes de actualizarlo
    const pedidoExistente = await prisma.pedido.findUnique({
      where: { id }
    });

    if (!pedidoExistente) {
      console.error('Pedido no encontrado:', id);
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    console.log('Estado actual del pedido:', { 
      id, 
      estadoActual: pedidoExistente.estado,
      nuevoEstado: estado 
    });

    const pedido = await prisma.pedido.update({
      where: { id },
      data: { estado },
      include: {
        pedido_pastel: {
          include: {
            carrito_items: {
              include: {
                pastel: true
              }
            }
          }
        },
        USER: true
      }
    });

    console.log('Pedido actualizado exitosamente:', {
      id: pedido.id,
      estadoAnterior: pedidoExistente.estado,
      estadoNuevo: pedido.estado
    });

    return NextResponse.json(pedido);
  } catch (error: unknown) {
    console.error('Error general al actualizar el estado del pedido:', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        message: 'Error al actualizar el estado del pedido',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 