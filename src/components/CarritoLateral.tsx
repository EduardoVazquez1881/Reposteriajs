"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCarrito } from '@/context/CarritoContext';
import { pedidoService } from '@/services/pedidoService';

export function CarritoLateral() {
  const { carrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito } = useCarrito();
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const total = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Aquí normalmente obtendríamos el ID del usuario de la sesión
      const usuarioId = 1; // Por ahora usamos un ID fijo

      await pedidoService.createPedido({
        fk_usuario: usuarioId,
        direccion: direccionEnvio,
        notas: instrucciones,
        carrito_items: carrito.map(item => ({
          id: 0, // El ID será asignado por el backend
          fk_pastel: parseInt(item.id),
          cantidad: item.cantidad || 1
        })),
        carrito_personalizado: []
      });

      limpiarCarrito();
      setShowCheckout(false);
      setIsOpen(false);
      setDireccionEnvio('');
      setInstrucciones('');
      
      // Aquí podrías mostrar un mensaje de éxito
      alert('¡Pedido realizado con éxito!');
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {carrito.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {carrito.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Carrito de Compras</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
              {carrito.length === 0 ? (
                <p className="text-center text-gray-500">Tu carrito está vacío</p>
              ) : (
                <div className="space-y-4">
                  {carrito.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-2 border rounded-lg">
                      <div className="relative w-20 h-20">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.nombre}</h3>
                        <p className="text-pink-600 font-bold">${item.precio}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span>{item.cantidad || 1}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-pink-600">${total}</span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
                disabled={carrito.length === 0}
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        </>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCheckout}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección de Envío
                    </label>
                    <input
                      type="text"
                      required
                      value={direccionEnvio}
                      onChange={(e) => setDireccionEnvio(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Ingresa tu dirección completa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instrucciones Especiales
                    </label>
                    <textarea
                      value={instrucciones}
                      onChange={(e) => setInstrucciones(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Alergias, preferencias, etc."
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Total a Pagar</span>
                      <span className="text-2xl font-bold text-pink-600">${total}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-pink-600 text-white py-3 rounded-lg transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
                      }`}
                    >
                      {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 