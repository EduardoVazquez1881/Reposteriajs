// src/services/productoService.ts

// Define una interfaz Producto que coincida con la estructura de tus productos en el backend.
// Esta es una versión combinada de la interfaz Producto de Inventario y Pastel de Dulces Delicias.
export interface Producto {
  id: string; // O number, dependiendo de tu backend y si es autogenerado
  nombre: string;
  descripcion: string;
  tipo: 'pastel' | 'materia_prima' | string; // 'pastel' para mostrar en dulcesdelicias
  precio: number;
  stock: number;
  unidad?: string; // Puede ser opcional si solo los ingredientes tienen unidad
  imagen?: string; // URL o ruta de la imagen
  destacado?: boolean; // Opcional para la página de dulces
  disponible?: boolean; // Opcional, el stock también indica disponibilidad
  etiquetas?: string[]; // Opcional para filtrar/categorizar pasteles
  calificacion?: number; // Opcional para la página de dulces
  // Añade cualquier otro campo que tus productos tengan en la base de datos
}

// URL base de tu API para productos
// ¡Ajusta esto según la ruta real de tu API de productos!
const API_BASE_URL = '/api/productos'; // Ejemplo: /api/productos

export const productoService = {
  /**
   * Obtiene la lista de todos los productos del backend.
   * @returns Una promesa que resuelve con un array de Productos.
   */
  async getProductos(): Promise<Producto[]> {
    try {
      // Realiza la llamada HTTP GET a tu API
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        // Manejar errores de respuesta HTTP (ej. 404, 500)
        const errorBody = await response.json().catch(() => null);
        const errorMessage = errorBody?.message || response.statusText;
        console.error(`Error al obtener productos: ${response.status} - ${errorMessage}`);
        throw new Error(`Error al obtener productos: ${errorMessage}`);
      }

      const data = await response.json();
      // Aquí podrías añadir validación de datos si es necesario
      return data as Producto[]; // Castear la respuesta a tu interfaz Producto
    } catch (error) {
      console.error("Error en productoService.getProductos:", error);
      // Re-lanzar el error para que los componentes lo capturen
      throw error;
    }
  },

  /**
   * Crea un nuevo producto en el backend.
   * @param producto Los datos del producto a crear (sin el ID si es autogenerado).
   * @returns Una promesa que resuelve con el Producto creado (incluyendo su ID).
   */
  async createProducto(producto: Omit<Producto, 'id'>): Promise<Producto> {
    try {
      // Realiza la llamada HTTP POST a tu API para crear un producto
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Incluir headers de autenticación si tu API los requiere (ej. JWT)
          // 'Authorization': `Bearer ${tuToken}`,
        },
        body: JSON.stringify(producto),
      });

      if (!response.ok) {
         const errorBody = await response.json().catch(() => null);
         const errorMessage = errorBody?.message || response.statusText;
         console.error(`Error al crear producto: ${response.status} - ${errorMessage}`);
         throw new Error(`Error al crear producto: ${errorMessage}`);
      }

      const data = await response.json();
      return data as Producto; // Asume que el backend devuelve el objeto creado con ID
    } catch (error) {
      console.error("Error en productoService.createProducto:", error);
      throw error;
    }
  },

  /**
   * Actualiza un producto existente en el backend.
   * @param producto El objeto Producto con los datos actualizados (debe incluir el ID).
   * @returns Una promesa que resuelve con el Producto actualizado o vacío/void.
   */
  async updateProducto(producto: Producto): Promise<Producto> {
     // Asegúrate de que el producto tenga un ID para saber cuál actualizar
    if (!producto.id) {
        const errorMessage = "Error en updateProducto: ID del producto es requerido.";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
      // Realiza la llamada HTTP PUT o PATCH a tu API para actualizar el producto
      // Asume que tu endpoint de actualización es algo como /api/productos/:id
      const response = await fetch(`${API_BASE_URL}/${producto.id}`, {
        method: 'PUT', // O 'PATCH' si tu API usa PATCH
        headers: {
          'Content-Type': 'application/json',
          // Incluir headers de autenticación si es necesario
          // 'Authorization': `Bearer ${tuToken}`,
        },
        body: JSON.stringify(producto),
      });

      if (!response.ok) {
         const errorBody = await response.json().catch(() => null);
         const errorMessage = errorBody?.message || response.statusText;
         console.error(`Error al actualizar producto: ${response.status} - ${errorMessage}`);
         throw new Error(`Error al actualizar producto: ${errorMessage}`);
      }

      // Dependiendo de tu API:
      // Si el backend devuelve el objeto completo actualizado:
      const data = await response.json();
      return data as Producto;

      // Si el backend solo devuelve un estado de éxito (ej. 200 OK sin cuerpo, o 204 No Content):
      // return producto; // Puedes optar por devolver el objeto que intentaste guardar
      // O si la función es Promise<void>: return;
    } catch (error) {
      console.error("Error en productoService.updateProducto:", error);
      throw error;
    }
  },

  // Puedes añadir otras funciones si las necesitas, como deleteProducto, etc.
}; 