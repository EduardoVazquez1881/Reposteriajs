import { prisma } from '@/lib/prisma';
import type { pastel } from '@prisma/client';
import type { Pastel } from '@/types/pastel';

const transformPastel = (p: pastel): Pastel => ({
  id: p.id.toString(),
  nombre: p.nombre,
  descripcion: p.descripcion ?? '',
  precio: Number(p.precio),
  imagen: p.imagen ?? '',
  destacado: p.destacado ?? false,
  etiquetas: [],
  calificacion: 0,
  stock: p.stock ?? 0,
  disponible: p.disponible ?? false,
  fecha_creacion: p.fecha_creacion?.toISOString() ?? '',
  deleted: p.deleted ?? false
});

export const pastelService = {
  // Obtener todos los pasteles
  async getAllPasteles(): Promise<Pastel[]> {
    const pasteles = await prisma.pastel.findMany({
      orderBy: {
        id: 'desc'
      }
    });

    return pasteles.map(transformPastel);
  },

  // Obtener pasteles destacados
  async getPastelesDestacados(): Promise<Pastel[]> {
    const pasteles = await prisma.pastel.findMany({
      where: {
        destacado: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    return pasteles.map(transformPastel);
  },

  // Obtener un pastel por ID
  async getPastelById(id: string): Promise<Pastel | null> {
    const pastel = await prisma.pastel.findUnique({
      where: { id: parseInt(id) }
    });

    if (!pastel) return null;

    return transformPastel(pastel);
  },

  // Crear un nuevo pastel
  async createPastel(data: Omit<pastel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pastel> {
    const pastel = await prisma.pastel.create({
      data
    });

    return transformPastel(pastel);
  },

  // Actualizar un pastel
  async updatePastel(id: string, data: Partial<pastel>): Promise<Pastel> {
    const pastel = await prisma.pastel.update({
      where: { id: parseInt(id) },
      data
    });

    return transformPastel(pastel);
  },

  // Eliminar un pastel
  async deletePastel(id: string): Promise<Pastel> {
    const pastel = await prisma.pastel.delete({
      where: { id: parseInt(id) }
    });

    return transformPastel(pastel);
  },

  // Buscar pasteles por término
  async searchPasteles(term: string): Promise<Pastel[]> {
    const pasteles = await prisma.pastel.findMany({
      where: {
        OR: [
          { nombre: { contains: term } },
          { descripcion: { contains: term } }
        ]
      }
    });

    return pasteles.map(transformPastel);
  }
}; 