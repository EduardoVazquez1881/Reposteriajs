import { api } from './api';

export const pedidoService = {
  // Crear un nuevo pedido
  async createPedido(pedidoData: {
    usuarioId: number;
    total: number;
    direccionEnvio: string;
    instrucciones: string;
    items: {
      pastelId: number;
      cantidad: number;
      precio: number;
    }[];
  }) {
    const response = await api.post('/pedidos', pedidoData);
    return response.data;
  },

  // Obtener pedidos de un usuario
  async getPedidosByUsuario(usuarioId: number) {
    const response = await api.get(`/pedidos/usuario/${usuarioId}`);
    return response.data;
  },

  // Obtener un pedido por ID
  async getPedidoById(id: number) {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  // Actualizar estado del pedido
  async updatePedidoEstado(pedidoId: number, nuevoEstado: string) {
    try {
      console.log('Enviando solicitud de actualización de estado:', {
        pedidoId,
        nuevoEstado,
        url: `/pedidos/${pedidoId}/estado`
      });

      const response = await api.patch(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      
      console.log('Respuesta del servidor:', {
        status: response.status,
        data: response.data
      });

      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data;
    } catch (error: any) {
      console.error('Error en updatePedidoEstado:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Obtener todos los pedidos (para administradores)
  async getAllPedidos() {
    const response = await api.get('/pedidos');
    return response.data;
  },

  // Actualizar pedido
  async updatePedido(pedidoId: number, updateData: {
    fechaEntrega?: string;
    direccion?: string;
  }) {
    const response = await api.patch(`/pedidos/${pedidoId}`, updateData);
    return response.data;
  }
}; 