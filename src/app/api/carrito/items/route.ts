import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fk_pastel, cantidad, precio_unitario } = body;

    // Validaciones básicas
    if (!fk_pastel || !cantidad || !precio_unitario) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el pastel existe
    const pastel = await prisma.pastel.findUnique({
      where: { id: fk_pastel }
    });

    if (!pastel) {
      return NextResponse.json(
        { error: 'El pastel no existe' },
        { status: 404 }
      );
    }

    // Crear el item del carrito
    const carritoItem = await prisma.carrito_items.create({
      data: {
        fk_pastel,
        cantidad,
        precio_unitario: Number(precio_unitario)
      }
    });

    return NextResponse.json(carritoItem);
  } catch (error) {
    console.error('Error al crear item del carrito:', error);
    return NextResponse.json(
      { error: 'Error al crear item del carrito' },
      { status: 500 }
    );
  }
} 