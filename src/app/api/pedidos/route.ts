import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validar datos requeridos
    if (!data.usuarioId || !data.total || !data.direccionEnvio) {
      return NextResponse.json(
        { message: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Crear el pedido
    const pedido = await prisma.pedido.create({
      data: {
        fk_usuario: data.usuarioId,
        total: data.total,
        direccion: data.direccionEnvio,
        notas: data.instrucciones,
        estado: 'pendiente',
        pedido_pastel: {
          create: data.items.map((item: any) => ({
            total: item.precio * item.cantidad,
            carrito_items: {
              create: {
                fk_pastel: item.pastelId,
                cantidad: item.cantidad,
                precio_unitario: item.precio
              }
            }
          }))
        }
      },
      include: {
        pedido_pastel: {
          include: {
            carrito_items: true
          }
        }
      }
    });

    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return NextResponse.json(
      { message: 'Error al procesar el pedido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
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
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    return NextResponse.json(
      { message: 'Error al obtener los pedidos' },
      { status: 500 }
    );
  }
}
