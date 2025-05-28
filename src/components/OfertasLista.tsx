"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Heart, Star, Clock } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import type { Pastel } from '@/types/pastel';

interface OfertasListaProps {
  pasteles: Pastel[];
}

export default function OfertasLista({ pasteles }: OfertasListaProps) {
  const { agregarAlCarrito } = useCarrito();
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const toggleFavorito = (id: string) => {
    setFavoritos(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id)
        : [...prev, id]
    );
  };

  const calcularDescuento = (precio: number, descuento: number) => {
    return precio - (precio * (descuento / 100));
  };

  return (
    <div className="space-y-8">
      {/* Sección de Ofertas Flash */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-rose-900">Ofertas Flash</h2>
          <div className="flex items-center gap-2 text-rose-600">
            <Clock size={20} />
            <span className="text-sm font-medium">Termina en: 23:59:59</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pasteles.map(pastel => (
            <div key={pastel.id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
              <div className="relative">
                <div className="relative h-48">
                  <Image
                    src={pastel.imagen}
                    alt={pastel.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -30% OFF
                  </span>
                </div>
                <button
                  onClick={() => toggleFavorito(pastel.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <Heart
                    size={20}
                    className={favoritos.includes(pastel.id) ? "text-rose-500 fill-rose-500" : "text-gray-400"}
                  />
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{pastel.nombre}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pastel.descripcion}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(pastel.calificacion) ? "fill-yellow-400" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-sm">({pastel.calificacion})</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-gray-500 line-through text-sm">
                      ${pastel.precio}
                    </p>
                    <p className="text-rose-600 font-bold text-xl">
                      ${calcularDescuento(pastel.precio, 30)}
                    </p>
                  </div>
                  <button
                    onClick={() => agregarAlCarrito(pastel)}
                    className="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={20} />
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de Descuentos por Categoría */}
      <section>
        <h2 className="text-2xl font-bold text-rose-900 mb-6">Descuentos por Categoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Chocolate', 'Frutales', 'Especiales', 'Tradicionales'].map((categoria) => (
            <div key={categoria} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{categoria}</h3>
              <p className="text-rose-600 font-bold text-2xl mb-4">-20%</p>
              <button className="text-rose-600 hover:text-rose-700 font-medium">
                Ver productos
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
} 