"use client";

import { Trash2, X, Heart } from 'lucide-react';
import Image from 'next/image';

interface Favorito {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

interface FavoritosLateralProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  favoritos: Favorito[];
  onEliminarFavorito: (id: number) => void;
}

export default function FavoritosLateral({ isOpen, setIsOpen, favoritos, onEliminarFavorito }: FavoritosLateralProps) {
  return (
    <>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Heart className="text-rose-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-800">Favoritos</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto h-[calc(100vh-120px)]">
              {favoritos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Heart size={48} className="mb-4 text-gray-400" />
                  <p className="text-lg">No tienes favoritos</p>
                  <p className="text-sm mt-2">¡Agrega tus pasteles favoritos!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favoritos.map((favorito) => (
                    <div 
                      key={favorito.id} 
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={favorito.imagen || '/img/default-pastel.jpg'}
                          alt={favorito.nombre}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 80px) 100vw, 80px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{favorito.nombre}</h3>
                            <p className="text-rose-600 font-medium">${favorito.precio}</p>
                          </div>
                          <button
                            onClick={() => onEliminarFavorito(favorito.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
} 