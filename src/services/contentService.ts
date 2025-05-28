import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  color: string | null;
}

export interface Subcategoria {
  id: number;
  fk_categoria: number;
  nombre: string;
  detalles: string | null;
  precio_adicional: Prisma.Decimal | null;
  color: string | null;
}

export interface Etiqueta {
  id: number;
  nombre: string;
  color: string | null;
}

export interface Pastel {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: Prisma.Decimal;
  imagen: string | null;
  destacado: boolean | null;
  stock: number | null;
  disponible: boolean | null;
  fecha_creacion: Date | null;
  etiquetas: number[];
}

class ContentService {
  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    try {
      return await prisma.categoria.findMany();
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error('Error al obtener categorías');
    }
  }

  async createCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    try {
      return await prisma.categoria.create({
        data: {
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          color: categoria.color
        }
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw new Error('Error al crear categoría');
    }
  }

  async updateCategoria(categoria: Categoria): Promise<Categoria> {
    try {
      return await prisma.categoria.update({
        where: { id: categoria.id },
        data: {
          nombre: categoria.nombre,
          descripcion: categoria.descripcion,
          color: categoria.color
        }
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw new Error('Error al actualizar categoría');
    }
  }

  async deleteCategoria(id: number): Promise<void> {
    try {
      await prisma.categoria.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw new Error('Error al eliminar categoría');
    }
  }

  // Subcategorías
  async getSubcategorias(): Promise<Subcategoria[]> {
    try {
      const subcategorias = await prisma.subcategoria.findMany();
      return subcategorias.map(subcat => ({
        id: subcat.id,
        fk_categoria: subcat.fk_categoria || 0,
        nombre: subcat.nombre || '',
        detalles: subcat.detalles,
        precio_adicional: subcat.precio_adicional,
        color: subcat.color
      }));
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      throw new Error('Error al obtener subcategorías');
    }
  }

  async createSubcategoria(subcategoria: Omit<Subcategoria, 'id'>): Promise<Subcategoria> {
    try {
      const created = await prisma.subcategoria.create({
        data: {
          fk_categoria: subcategoria.fk_categoria,
          nombre: subcategoria.nombre,
          detalles: subcategoria.detalles,
          precio_adicional: subcategoria.precio_adicional,
          color: subcategoria.color
        }
      });
      return {
        id: created.id,
        fk_categoria: created.fk_categoria || 0,
        nombre: created.nombre || '',
        detalles: created.detalles,
        precio_adicional: created.precio_adicional,
        color: created.color
      };
    } catch (error) {
      console.error('Error al crear subcategoría:', error);
      throw new Error('Error al crear subcategoría');
    }
  }

  async updateSubcategoria(subcategoria: Subcategoria): Promise<Subcategoria> {
    try {
      const updated = await prisma.subcategoria.update({
        where: { id: subcategoria.id },
        data: {
          fk_categoria: subcategoria.fk_categoria,
          nombre: subcategoria.nombre,
          detalles: subcategoria.detalles,
          precio_adicional: subcategoria.precio_adicional,
          color: subcategoria.color
        }
      });
      return {
        id: updated.id,
        fk_categoria: updated.fk_categoria || 0,
        nombre: updated.nombre || '',
        detalles: updated.detalles,
        precio_adicional: updated.precio_adicional,
        color: updated.color
      };
    } catch (error) {
      console.error('Error al actualizar subcategoría:', error);
      throw new Error('Error al actualizar subcategoría');
    }
  }

  async deleteSubcategoria(id: number): Promise<void> {
    try {
      await prisma.subcategoria.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      throw new Error('Error al eliminar subcategoría');
    }
  }

  // Etiquetas
  async getEtiquetas(): Promise<Etiqueta[]> {
    try {
      return await prisma.etiquetas.findMany();
    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
      throw new Error('Error al obtener etiquetas');
    }
  }

  async createEtiqueta(etiqueta: Omit<Etiqueta, 'id'>): Promise<Etiqueta> {
    try {
      return await prisma.etiquetas.create({
        data: {
          nombre: etiqueta.nombre,
          color: etiqueta.color
        }
      });
    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      throw new Error('Error al crear etiqueta');
    }
  }

  async updateEtiqueta(etiqueta: Etiqueta): Promise<Etiqueta> {
    try {
      return await prisma.etiquetas.update({
        where: { id: etiqueta.id },
        data: {
          nombre: etiqueta.nombre,
          color: etiqueta.color
        }
      });
    } catch (error) {
      console.error('Error al actualizar etiqueta:', error);
      throw new Error('Error al actualizar etiqueta');
    }
  }

  async deleteEtiqueta(id: number): Promise<void> {
    try {
      await prisma.etiquetas.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      throw new Error('Error al eliminar etiqueta');
    }
  }

  // Pasteles
  async getPasteles(): Promise<Pastel[]> {
    try {
      const pasteles = await prisma.pastel.findMany({
        include: {
          pastel_etiqueta: {
            include: {
              etiquetas: true
            }
          }
        }
      });

      return pasteles.map(pastel => ({
        id: pastel.id,
        nombre: pastel.nombre,
        descripcion: pastel.descripcion,
        precio: pastel.precio,
        imagen: pastel.imagen,
        destacado: pastel.destacado,
        stock: pastel.stock,
        disponible: pastel.disponible,
        fecha_creacion: pastel.fecha_creacion,
        etiquetas: pastel.pastel_etiqueta.map(pe => pe.etiquetas.id)
      }));
    } catch (error) {
      console.error('Error al obtener pasteles:', error);
      throw new Error('Error al obtener pasteles');
    }
  }

  async createPastel(pastel: Omit<Pastel, 'id'>): Promise<Pastel> {
    try {
      const { etiquetas, imagen, ...pastelData } = pastel;
      
      // Validar la URL de la imagen si existe
      if (imagen && !imagen.startsWith('http')) {
        throw new Error('La URL de la imagen debe comenzar con http:// o https://');
      }
      
      // Crear el pastel con sus etiquetas
      const nuevoPastel = await prisma.pastel.create({
        data: {
          ...pastelData,
          imagen: imagen || null, // Asegurar que sea null si no hay imagen
          fecha_creacion: new Date(),
          pastel_etiqueta: {
            create: etiquetas.map(etiquetaId => ({
              etiquetas: {
                connect: { id: etiquetaId }
              }
            }))
          }
        },
        include: {
          pastel_etiqueta: {
            include: {
              etiquetas: true
            }
          }
        }
      });

      // Mapear la respuesta al formato esperado
      return {
        id: nuevoPastel.id,
        nombre: nuevoPastel.nombre,
        descripcion: nuevoPastel.descripcion,
        precio: nuevoPastel.precio,
        imagen: nuevoPastel.imagen,
        destacado: nuevoPastel.destacado,
        stock: nuevoPastel.stock,
        disponible: nuevoPastel.disponible,
        fecha_creacion: nuevoPastel.fecha_creacion,
        etiquetas: nuevoPastel.pastel_etiqueta.map(pe => pe.etiquetas.id)
      };
    } catch (error) {
      console.error('Error al crear pastel:', error);
      throw new Error('Error al crear pastel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async updatePastel(pastel: Pastel): Promise<Pastel> {
    try {
      const { etiquetas, imagen, ...pastelData } = pastel;

      // Validar la URL de la imagen si existe
      if (imagen && !imagen.startsWith('http')) {
        throw new Error('La URL de la imagen debe comenzar con http:// o https://');
      }

      // Actualizar el pastel y sus etiquetas
      const pastelActualizado = await prisma.pastel.update({
        where: { id: pastel.id },
        data: {
          ...pastelData,
          imagen: imagen || null, // Asegurar que sea null si no hay imagen
          pastel_etiqueta: {
            deleteMany: {},
            create: etiquetas.map(etiquetaId => ({
              etiquetas: {
                connect: { id: etiquetaId }
              }
            }))
          }
        },
        include: {
          pastel_etiqueta: {
            include: {
              etiquetas: true
            }
          }
        }
      });

      // Mapear la respuesta al formato esperado
      return {
        id: pastelActualizado.id,
        nombre: pastelActualizado.nombre,
        descripcion: pastelActualizado.descripcion,
        precio: pastelActualizado.precio,
        imagen: pastelActualizado.imagen,
        destacado: pastelActualizado.destacado,
        stock: pastelActualizado.stock,
        disponible: pastelActualizado.disponible,
        fecha_creacion: pastelActualizado.fecha_creacion,
        etiquetas: pastelActualizado.pastel_etiqueta.map(pe => pe.etiquetas.id)
      };
    } catch (error) {
      console.error('Error al actualizar pastel:', error);
      throw new Error('Error al actualizar pastel: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }

  async deletePastel(id: number): Promise<void> {
    try {
      await prisma.pastel.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error al eliminar pastel:', error);
      throw new Error('Error al eliminar pastel');
    }
  }
}

export const contentService = new ContentService(); 