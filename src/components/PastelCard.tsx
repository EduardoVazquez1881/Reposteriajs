"use client";

import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import type { Pastel } from '@/types/pastel';

interface PastelCardProps {
  pastel: Pastel;
  onToggleFavorito: (id: string) => void;
  esFavorito: boolean;
}

export default function PastelCard({ pastel, onToggleFavorito, esFavorito }: PastelCardProps) {
  const { agregarAlCarrito } = useCarrito();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <div className="relative">
        <div className="relative w-full h-48">
          <Image
            src={pastel.imagen}
            alt={pastel.nombre}
            fill
            className="object-cover"
          />
        </div>
        <button
          onClick={() => onToggleFavorito(pastel.id)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart
            size={20}
            className={esFavorito ? "text-red-500 fill-red-500" : "text-gray-400"}
          />
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{pastel.nombre}</h3>
        <p className="text-gray-600 mt-2">{pastel.descripcion}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-pink-600 font-bold">${pastel.precio}</span>
          <button
            onClick={() => agregarAlCarrito(pastel)}
            className="bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
} 