interface PedidoFilters {
  estado?: string;
  usuario?: number;
  fechaInicio?: string;
  fechaFin?: string;
}

interface CreatePedidoData {
  fk_usuario: number;
  direccion?: string;
  telefono?: string;
  notas?: string;
  fechaEntrega?: string;
  carrito_items: Array<{
    id: number;
    fk_pastel: number;
    cantidad: number;
  }>;
  carrito_personalizado: Array<{
    id: number;
    cantidad: number;
    precio_unitario: number;
    imagen_referencia?: string;
  }>;
}

interface UpdatePedidoData {
  estado?: string;
  direccion?: string;
  telefono?: string;
  notas?: string;
  fechaEntrega?: string;
  fecha?: string;
}

class PedidoService {
  private baseUrl = '/api/pedidos';

  // Función auxiliar para validar y normalizar fechas
  private normalizeDate(date: string | Date | null): string | undefined {
    if (!date) return undefined;
    
    try {
      const dateObj = new Date(date);
      
      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        throw new Error('Fecha inválida');
      }

      // Validar que la fecha no sea anterior a hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (dateObj < hoy) {
        throw new Error('La fecha no puede ser anterior a hoy');
      }

      // Validar que la fecha no sea más de 30 días en el futuro
      const fechaMaxima = new Date();
      fechaMaxima.setDate(fechaMaxima.getDate() + 30);
      if (dateObj > fechaMaxima) {
        throw new Error('La fecha no puede ser más de 30 días en el futuro');
      }

      // Asegurar que la fecha se guarde en formato ISO con la zona horaria local
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}T12:00:00.000Z`;
    } catch (error) {
      console.error('Error al normalizar fecha:', error);
      throw error;
    }
  }

  async getAllPedidos(filters?: PedidoFilters) {
    try {
      let url = this.baseUrl;
      
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.estado && filters.estado !== 'all') {
          params.append('estado', filters.estado);
        }
        if (filters.usuario) {
          params.append('usuario', filters.usuario.toString());
        }
        if (filters.fechaInicio) {
          params.append('fechaInicio', filters.fechaInicio);
        }
        if (filters.fechaFin) {
          params.append('fechaFin', filters.fechaFin);
        }
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Asegurarse de que las fechas se manejen correctamente en todos los pedidos
      if (Array.isArray(data)) {
        return data.map(pedido => ({
          ...pedido,
          fecha: pedido.fechaEntrega || pedido.fecha,
          fechaEntrega: pedido.fechaEntrega || pedido.fecha
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  }

  async getPedidoById(id: number) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Pedido no encontrado');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw error;
    }
  }

  async createPedido(pedidoData: CreatePedidoData) {
    try {
      // Normalizar la fecha de entrega si está presente
      const normalizedData = { ...pedidoData };
      if (pedidoData.fechaEntrega) {
        normalizedData.fechaEntrega = this.normalizeDate(pedidoData.fechaEntrega);
      }

      console.log('Enviando datos del pedido:', normalizedData);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error en la respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.error || data.message || `Error ${response.status}: ${response.statusText}`);
      }

      console.log('Pedido creado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }

  async updatePedido(id: number, updateData: UpdatePedidoData) {
    try {
      // Normalizar la fecha de entrega si está presente
      const normalizedData = { ...updateData };
      
      // Si se está actualizando la fecha de entrega, asegurarse de que se normalice correctamente
      if (updateData.fechaEntrega) {
        const fechaNormalizada = this.normalizeDate(updateData.fechaEntrega);
        if (fechaNormalizada) {
          normalizedData.fechaEntrega = fechaNormalizada;
          // Asegurarse de que fecha también se actualice para mantener consistencia
          normalizedData.fecha = fechaNormalizada;
        }
      }

      console.log('Actualizando pedido con datos normalizados:', {
        id,
        datosOriginales: updateData,
        datosNormalizados: normalizedData
      });

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en la respuesta del servidor:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Asegurarse de que la fecha se mantenga consistente en la respuesta
      if (data.fechaEntrega) {
        data.fecha = data.fechaEntrega;
      } else if (normalizedData.fechaEntrega) {
        // Si el servidor no devolvió fechaEntrega pero la enviamos, asegurarnos de que se mantenga
        data.fechaEntrega = normalizedData.fechaEntrega;
        data.fecha = normalizedData.fechaEntrega;
      }
      
      console.log('Pedido actualizado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      throw error;
    }
  }

  async deletePedido(id: number) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      throw error;
    }
  }

  async updateEstadoPedido(id: number, nuevoEstado: string) {
    try {
      console.log('Actualizando estado del pedido:', { id, nuevoEstado });
      
      // Obtener el pedido actual primero para preservar la fecha de entrega
      const pedidoActual = await this.getPedidoById(id);
      
      // Validar que el pedido tenga fecha de entrega si se está completando
      if (nuevoEstado === 'completado') {
        // Usar fechaEntrega o fecha como fecha de entrega
        const fechaEntrega = pedidoActual.fechaEntrega || pedidoActual.fecha;
        if (!fechaEntrega) {
          throw new Error('No se puede completar un pedido sin fecha de entrega');
        }

        const updateData = {
          estado: nuevoEstado,
          fechaEntrega: fechaEntrega, // Usar la fecha existente
          fecha: fechaEntrega // Mantener consistencia con fecha
        };

        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Error al actualizar estado:', {
            status: response.status,
            statusText: response.statusText,
            data
          });
          throw new Error(data.error || data.message || `Error ${response.status}: ${response.statusText}`);
        }

        // Asegurarse de que la fecha se mantenga consistente en la respuesta
        if (data.fechaEntrega) {
          data.fecha = data.fechaEntrega;
        }

        console.log('Estado actualizado exitosamente:', data);
        return data;
      } else {
        // Para otros estados, solo actualizar el estado
        const updateData = {
          estado: nuevoEstado,
          fechaEntrega: pedidoActual.fechaEntrega, // Preservar la fecha de entrega existente
          fecha: pedidoActual.fecha // Preservar la fecha original
        };

        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Error al actualizar estado:', {
            status: response.status,
            statusText: response.statusText,
            data
          });
          throw new Error(data.error || data.message || `Error ${response.status}: ${response.statusText}`);
        }

        console.log('Estado actualizado exitosamente:', data);
        return data;
      }
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw error;
    }
  }
}

export const pedidoService = new PedidoService();