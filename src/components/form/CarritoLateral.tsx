"use client";

import Image from 'next/image';
import { ShoppingBag, X, Plus, Minus, CreditCard } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CarritoLateralProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CarritoLateral({ isOpen, setIsOpen }: CarritoLateralProps) {
  const { carrito, eliminarDelCarrito, actualizarCantidad } = useCarrito();
  const { data: session } = useSession();
  const router = useRouter();
  
  // Si el panel no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  const handleCarritoClick = () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setIsOpen(true);
  };
  
  const total = carrito.reduce((sum, item) => sum + (Number(item.precio) * (item.cantidad || 1)), 0);
  
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col">
      {/* Encabezado del panel */}
      <div className="px-4 py-3 bg-rose-50 flex justify-between items-center border-b border-rose-100">
        <div className="flex items-center gap-2 text-rose-700">
          <ShoppingBag size={20} />
          <h2 className="font-semibold text-lg">Tu Carrito</h2>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-rose-500 hover:text-rose-700"
        >
          <X size={24} />
        </button>
      </div>
      
      {/* Contenido del panel */}
      <div className="flex-grow overflow-y-auto p-4">
        {carrito.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-rose-50 p-6 rounded-full mb-4">
              <ShoppingBag size={32} className="text-rose-300" />
            </div>
            <h3 className="font-medium text-lg text-rose-900 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">
              Agrega algunos deliciosos pasteles a tu carrito para comenzar tu pedido.
            </p>
            <button 
              onClick={() => setIsOpen(false)}
              className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
            >
              Explorar Pasteles
            </button>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {carrito.map((item) => (
                <li key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                  {/* Imagen miniatura */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      width={80}
                      height={80} 
                      src={item.imagen || '/placeholder.jpg'} 
                      alt={item.nombre} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Detalles del producto */}
                  <div className="flex-grow">
                    <h4 className="font-medium text-rose-900">{item.nombre}</h4>
                    <p className="text-rose-600 font-semibold">${Number(item.precio)}</p>
                    
                    {/* Controles de cantidad */}
                    <div className="flex items-center mt-2 gap-2">
                      <button 
                        onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) - 1)}
                        className="text-gray-400 hover:text-rose-500"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="text-gray-600">{item.cantidad || 1}</span>
                      <button 
                        onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) + 1)}
                        className="text-gray-400 hover:text-rose-500"
                      >
                        <Plus size={16} />
                      </button>
                      
                      <button 
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="text-gray-400 hover:text-rose-500 ml-auto"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Resumen */}
            <div className="mt-6 bg-rose-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${total}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold">Gratis</span>
              </div>
              <div className="border-t border-rose-200 mt-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-900">Total</span>
                  <span className="font-bold text-lg text-rose-900">${total}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Pie del panel */}
      {carrito.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleCarritoClick}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-full font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            Proceder al Pago
          </button>
        </div>
      )}
    </div>
  );
}