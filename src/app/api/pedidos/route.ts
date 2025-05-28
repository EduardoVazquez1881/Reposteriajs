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

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Datos recibidos en el endpoint:', body);

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

    // Validar que el usuario existe
    const usuario = await prisma.uSER.findUnique({
      where: { id: fk_usuario }
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular total
    let total = 0;

    // Crear el pedido con transacción
    const nuevoPedido = await prisma.$transaction(async (tx) => {
      try {
        // Crear pedido principal
        const pedido = await tx.pedido.create({
          data: {
            fk_usuario,
            direccion,
            telefono,
            notas,
            fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
            total: 0, // Se actualizará después
            estado: 'pendiente'
          }
        });

        // Crear pedido_pastel para cada item regular
        for (const item of carrito_items) {
          // Verificar si el pastel existe
          const pastel = await tx.pastel.findUnique({
            where: { id: item.fk_pastel }
          });

          if (!pastel) {
            throw new Error(`El pastel con ID ${item.fk_pastel} no existe`);
          }

          // Crear el item del carrito
          const carritoItem = await tx.carrito_items.create({
            data: {
              fk_pastel: item.fk_pastel,
              cantidad: item.cantidad,
              precio_unitario: Number(pastel.precio)
            }
          });

          // Crear la relación pedido_pastel
          await tx.pedido_pastel.create({
            data: {
              fk_pedido: pedido.id,
              fk_carrito_items: carritoItem.id,
              total: Number(carritoItem.precio_unitario) * carritoItem.cantidad
            }
          });

          // Actualizar el total
          total += Number(carritoItem.precio_unitario) * carritoItem.cantidad;
        }

        // Crear pedido_personalizado para cada item personalizado
        for (const item of carrito_personalizado) {
          // Primero crear el personalizado
          const personalizado = await tx.personalizado.create({
            data: {
              fk_usuario,
              nombre: 'Pastel Personalizado',
              descripcion: notas || 'Pastel personalizado',
              imagen_referencia: item.imagen_referencia
            }
          });

          // Luego crear el carrito_personalizado
          const carritoPersonalizado = await tx.carrito_personalizado.create({
            data: {
              fk_personalizado: personalizado.id,
              cantidad: item.cantidad,
              precio_unitario: item.precio_unitario
            }
          });

          // Finalmente crear el pedido_personalizado
          await tx.pedido_personalizado.create({
            data: {
              fk_pedido: pedido.id,
              fk_carrito_personalizado: carritoPersonalizado.id,
              total: Number(carritoPersonalizado.precio_unitario) * carritoPersonalizado.cantidad,
              imagen_referencia: item.imagen_referencia
            }
          });

          total += Number(carritoPersonalizado.precio_unitario) * carritoPersonalizado.cantidad;
        }

        // Actualizar el total del pedido
        const pedidoActualizado = await tx.pedido.update({
          where: { id: pedido.id },
          data: { total }
        });

        return pedidoActualizado;
      } catch (error) {
        console.error('Error en la transacción:', error);
        throw error;
      }
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

    if (!pedidoCompleto) {
      throw new Error('Error al recuperar el pedido creado');
    }

    return NextResponse.json(pedidoCompleto, { status: 201 });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al crear el pedido';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}