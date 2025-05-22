import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id },
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

    if (!pedido) {
      return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    return NextResponse.json({ message: 'Error al obtener el pedido' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { fechaEntrega, direccion } = body;

    console.log('Datos recibidos en PATCH:', { 
      id, 
      fechaEntrega, 
      direccion,
      body 
    });

    // Validar que al menos uno de los campos esté presente
    if (!fechaEntrega && !direccion) {
      return NextResponse.json({ message: 'Se requiere al menos un campo para actualizar' }, { status: 400 });
    }

    // Construir el objeto de actualización
    const updateData: any = {};
    
    if (fechaEntrega) {
      try {
        // Validar que la fecha sea válida
        const fecha = new Date(fechaEntrega);
        if (isNaN(fecha.getTime())) {
          console.error('Fecha inválida recibida:', fechaEntrega);
          return NextResponse.json({ message: 'Fecha inválida' }, { status: 400 });
        }
        
        // Usar el campo fecha en lugar de fechaEntrega
        updateData.fecha = fecha;
        console.log('Fecha procesada para actualización:', updateData.fecha);
      } catch (error) {
        console.error('Error al procesar la fecha:', error);
        return NextResponse.json({ 
          message: 'Error al procesar la fecha',
          error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 400 });
      }
    }
    
    if (direccion) {
      updateData.direccion = direccion;
    }

    console.log('Intentando actualizar pedido con datos:', {
      id,
      updateData
    });

    try {
      const pedido = await prisma.pedido.update({
        where: { id },
        data: updateData,
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

      // Transformar la respuesta para mantener la compatibilidad con el frontend
      const pedidoResponse = {
        ...pedido,
        fechaEntrega: pedido.fecha // Usar el campo fecha como fechaEntrega en la respuesta
      };

      console.log('Pedido actualizado exitosamente:', {
        id: pedido.id,
        fecha: pedido.fecha,
        estado: pedido.estado
      });

      return NextResponse.json(pedidoResponse);
    } catch (dbError) {
      console.error('Error de base de datos al actualizar:', {
        error: dbError,
        code: (dbError as any).code,
        meta: (dbError as any).meta
      });
      
      return NextResponse.json({ 
        message: 'Error al actualizar en la base de datos',
        error: dbError instanceof Error ? dbError.message : 'Error desconocido',
        details: (dbError as any).meta || {}
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error general en PATCH:', error);
    return NextResponse.json(
      { 
        message: 'Error al actualizar el pedido',
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
} 