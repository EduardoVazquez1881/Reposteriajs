/*import { prisma } from '@/lib/prisma';

export const pedidoPersonalizadoService = {
  // Crear un nuevo pedido personalizado
  async createPedidoPersonalizado(pedidoData: {
    clienteId: string;
    descripcion: string;
    fechaEntrega: Date;
    estado: string;
    precio: number;
    productos: {
      nombre: string;
      descripcion: string;
      tipo: string;
      stock: number;
      unidad: string;
      precio: number;
      destacado: boolean;
      disponible: boolean;
    }[];
  }) {
    try {
      // Primero creamos el pedido personalizado
      const pedido = await prisma.pedidoPersonalizado.create({
        data: {
          clienteId: pedidoData.clienteId,
          descripcion: pedidoData.descripcion,
          fechaEntrega: pedidoData.fechaEntrega,
          estado: pedidoData.estado,
          precio: pedidoData.precio,
        },
      });

      // Luego creamos los productos asociados
      for (const producto of pedidoData.productos) {
        const productoCreado = await prisma.producto.create({
          data: {
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            tipo: producto.tipo,
            precio: producto.precio,
            stock: producto.stock,
            unidad: producto.unidad,
            destacado: producto.destacado,
            disponible: producto.disponible,
          },
        });

        // Finalmente, creamos la relación entre el pedido y el producto
        await prisma.pedidoProducto.create({
          data: {
            pedidoId: pedido.id,
            productoId: productoCreado.id,
            cantidad: 1,
            precio: producto.precio,
          },
        });
      }

      return pedido;
    } catch (error) {
      console.error('Error al crear el pedido personalizado:', error);
      throw error;
    }
  },

  // Obtener todos los pedidos personalizados
  async getAllPedidosPersonalizados() {
    return await prisma.pedidoPersonalizado.findMany({
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
        cliente: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  // Obtener un pedido personalizado por ID
  async getPedidoPersonalizadoById(id: string) {
    return await prisma.pedidoPersonalizado.findUnique({
      where: { id },
      include: {
        productos: {
          include: {
            producto: true,
          },
        },
        cliente: true,
      },
    });
  },

  // Actualizar estado del pedido personalizado
  async updatePedidoPersonalizadoEstado(id: string, nuevoEstado: string) {
    return await prisma.pedidoPersonalizado.update({
      where: { id },
      data: { estado: nuevoEstado },
    });
  },
}; 
*/

// src/services/pedidoPersonalizadoService.ts

// Servicio temporalmente deshabilitado
export const pedidoPersonalizadoService = {
  /**
   * createPedidoPersonalizado: deshabilitado temporalmente.
   * Lanza error si llega a usarse, para que sepas que debe reactivarse.
   */
  async createPedidoPersonalizado() {
    throw new Error('pedidoPersonalizadoService deshabilitado temporalmente');
  }
};
