import { pastelService } from '@/services/pastelService';
import { CarritoLateral } from '@/components/CarritoLateral';
import { ProductosLista } from '../components/ProductosLista';

export default async function Home() {
  const pasteles = await pastelService.getAllPasteles();
  const pastelesDestacados = await pastelService.getPastelesDestacados();

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
