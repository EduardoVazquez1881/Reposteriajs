import { pastelService } from '@/services/pastelService';
import OfertasLista from '@/components/OfertasLista';
import { CarritoLateral } from '@/components/CarritoLateral';

export default async function OfertasPage() {
  const pasteles = await pastelService.getAllPasteles();

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-rose-900 mb-2">Ofertas y Descuentos</h1>
          <p className="text-gray-600">
            Aprovecha nuestras mejores ofertas y descuentos especiales en tus pasteles favoritos
          </p>
        </div>

        <OfertasLista pasteles={pasteles} />
      </div>
      <CarritoLateral />
    </main>
  );
} 