import { pastelService } from '@/services/pastelService';
import { CarritoLateral } from '@/components/CarritoLateral';
import { ProductosLista } from '../components/ProductosLista';
import type { Pastel } from '@/types/pastel';

export default async function Home() {
  const rawPasteles = await pastelService.getAllPasteles();
  const rawDestacados = await pastelService.getPastelesDestacados();

  // Transformar datos para que cumplan con Pastel
  const pasteles: Pastel[] = rawPasteles.map(p => ({
    id: p.id,
    nombre: p.nombre ?? '',
    descripcion: p.descripcion ?? '',
    precio: Number(p.precio) || 0,       // Decimal a number
    imagen: p.imagen ?? '',
    destacado: Boolean(p.destacado),
    etiquetas: [],                       // Define según lógica real
    calificacion: 0,                    // Define según lógica real

    // Opcionales
    stock: p.stock ?? 0,
    disponible: p.disponible ?? false,
    fecha_creacion: p.fecha_creacion ? p.fecha_creacion.toISOString() : '',
    deleted: p.deleted ?? false,
  }));

  const pastelesDestacados: Pastel[] = rawDestacados.map(p => ({
    id: p.id,
    nombre: p.nombre ?? '',
    descripcion: p.descripcion ?? '',
    precio: Number(p.precio) || 0,
    imagen: p.imagen ?? '',
    destacado: Boolean(p.destacado),
    etiquetas: [],
    calificacion: 0,

    stock: p.stock ?? 0,
    disponible: p.disponible ?? false,
    fecha_creacion: p.fecha_creacion ? p.fecha_creacion.toISOString() : '',
    deleted: p.deleted ?? false,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <ProductosLista 
          pasteles={pasteles} 
          pastelesDestacados={pastelesDestacados} 
        />
      </div>
      <CarritoLateral />
    </main>
  );
}
