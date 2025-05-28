import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface WhereClause {
  deleted: boolean;
  estado?: string;
  fk_usuario?: number;
  fecha?: {
    gte: Date;
    lte: Date;
  };
}

// GET - Obtener todos los pedidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const usuario = searchParams.get('usuario');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    const whereClause: WhereClause = {
      deleted: false
    };

    if (estado && estado !== 'all') {
      whereClause.estado = estado;
    }

    if (usuario) {
      whereClause.fk_usuario = parseInt(usuario);
    }

    if (fechaInicio && fechaFin) {
      whereClause.fecha = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin)
      };
    }

    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
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
            fecha: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

interface ErrorResponse {
  message: string;
  status?: number;
}

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fk_usuario,
      direccion,
      telefono,
      notas,
      fechaEntrega,
      carrito_items = [],
      carrito_personalizado = []
    } = body;

    // Validaciones básicas
    if (!fk_usuario) {
      return NextResponse.json(
        { error: 'Usuario requerido' },
        { status: 400 }
      );
    }

    if (carrito_items.length === 0 && carrito_personalizado.length === 0) {
      return NextResponse.json(
        { error: 'El pedido debe tener al menos un producto' },
        { status: 400 }
      );
    }

    // Calcular total
    let total = 0;

    // Calcular total de pasteles regulares
    for (const item of carrito_items) {
      const pastel = await prisma.pastel.findUnique({
        where: { id: item.fk_pastel }
      });
      if (pastel) {
        total += Number(pastel.precio) * item.cantidad;
      }
    }

    // Calcular total de pasteles personalizados
    for (const item of carrito_personalizado) {
      total += Number(item.precio_unitario || 0) * item.cantidad;
    }

    // Crear el pedido con transacción
    const nuevoPedido = await prisma.$transaction(async (tx) => {
      // Crear pedido principal
      const pedido = await tx.pedido.create({
        data: {
          fk_usuario,
          direccion,
          telefono,
          notas,
          fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
          total,
          estado: 'pendiente'
        }
      });

      // Crear pedido_pastel para cada item regular
      for (const item of carrito_items) {
        const carritoItem = await tx.carrito_items.findUnique({
          where: { id: item.id }
        });

        if (carritoItem) {
          await tx.pedido_pastel.create({
            data: {
              fk_pedido: pedido.id,
              fk_carrito_items: carritoItem.id,
              total: Number(carritoItem.precio_unitario) * carritoItem.cantidad
            }
          });
        }
      }

      // Crear pedido_personalizado para cada item personalizado
      for (const item of carrito_personalizado) {
        const carritoPersonalizado = await tx.carrito_personalizado.findUnique({
          where: { id: item.id }
        });

        if (carritoPersonalizado) {
          await tx.pedido_personalizado.create({
            data: {
              fk_pedido: pedido.id,
              fk_carrito_personalizado: carritoPersonalizado.id,
              total: Number(carritoPersonalizado.precio_unitario) * carritoPersonalizado.cantidad,
              imagen_referencia: item.imagen_referencia
            }
          });
        }
      }

      return pedido;
    });

    // Obtener el pedido completo para retornar
    const pedidoCompleto = await prisma.pedido.findUnique({
      where: { id: nuevoPedido.id },
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

    return NextResponse.json(pedidoCompleto, { status: 201 });
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    console.error('Error al crear pedido:', err);
    return NextResponse.json(
      { error: err.message || 'Error al crear el pedido' },
      { status: err.status || 500 }
    );
  }
}