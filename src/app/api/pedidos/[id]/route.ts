import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener pedido por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { 
        id,
        deleted: false 
      },
      include: {
        USER: {
          select: {
            id: true,
            username: true,
            email: true,
            telefono: true
          }
        },
        pedido_pastel: {
          include: {
            carrito_items: {
              include: {
                pastel: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    precio: true,
                    imagen: true
                  }
                }
              }
            }
          }
        },
        pedido_personalizado: {
          include: {
            carrito_personalizado: {
              include: {
                personalizado: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    imagen_referencia: true
                  }
                }
              }
            }
          }
        },
        pago: {
          select: {
            id: true,
            monto: true,
            metodo: true,
            estado: true,
            referencia: true,
            fecha: true
          }
        }
      }
    });

    if (!pedido) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const {
      estado,
      direccion,
      telefono,
      notas,
      fechaEntrega
    } = body;

    // Verificar que el pedido existe
    const pedidoExiste = await prisma.pedido.findUnique({
      where: { 
        id,
        deleted: false 
      }
    });

    if (!pedidoExiste) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id },
      data: {
        ...(estado && { estado }),
        ...(direccion && { direccion }),
        ...(telefono && { telefono }),
        ...(notas !== undefined && { notas }),
        ...(fechaEntrega && { fechaEntrega: new Date(fechaEntrega) })
      },
      include: {
        USER: {
          select: {
            id: true,
            username: true,
            email: true,
            telefono: true
          }
        },
        pedido_pastel: {
          include: {
            carrito_items: {
              include: {
                pastel: true
              }
            }
          }
        },
        pedido_personalizado: {
          include: {
            carrito_personalizado: {
              include: {
                personalizado: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(pedidoActualizado);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar pedido (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    // Verificar que el pedido existe
    const pedidoExiste = await prisma.pedido.findUnique({
      where: { 
        id,
        deleted: false 
      }
    });

    if (!pedidoExiste) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.pedido.update({
      where: { id },
      data: { deleted: true }
    });

    return NextResponse.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}