"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pedidoService } from '@/services/pedidoService';
import { toast } from 'sonner';
import { CreditCard, Package, Calendar, MapPin, ArrowLeft, Printer } from 'lucide-react';
import Image from 'next/image';

interface PedidoDetalle {
  id: number;
  estado: string;
  fecha: string;
  fechaEntrega: string | null;
  total: number;
  direccion: string | null;
  telefono: string | null;
  notas: string | null;
  USER: {
    id: number;
    username: string;
    email: string;
    telefono: string | null;
  };
  pedido_pastel: Array<{
    id: number;
    total: number;
    carrito_items: {
      id: number;
      cantidad: number;
      precio_unitario: number;
      pastel: {
        id: number;
        nombre: string;
        descripcion: string | null;
        precio: number;
        imagen: string | null;
      };
    };
  }>;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerandoTicket, setIsGenerandoTicket] = useState(false);

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        if (!params.id) return;
        
        const pedidoData = await pedidoService.getPedidoById(Number(params.id));
        setPedido(pedidoData);
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        toast.error('Error al cargar los detalles del pedido');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    cargarPedido();
  }, [params.id, router]);

  const imprimirTicket = () => {
    if (!pedido) return;
    
    setIsGenerandoTicket(true);
    try {
      const fecha = new Date().toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const contenido = [
        '=== DULCES DELICIAS ===',
        '=== TICKET DE PEDIDO ===',
        `Fecha: ${fecha}`,
        `No. Pedido: ${pedido.id}`,
        '------------------------',
        'DETALLES DEL CLIENTE:',
        `Nombre: ${pedido.USER.username}`,
        `Email: ${pedido.USER.email}`,
        `Teléfono: ${pedido.USER.telefono || 'No especificado'}`,
        '------------------------',
        'PRODUCTOS:',
        ...pedido.pedido_pastel.map(item => [
          `${item.carrito_items.pastel.nombre}`,
          `Cantidad: ${item.carrito_items.cantidad}`,
          `Precio unitario: $${item.carrito_items.precio_unitario}`,
          `Subtotal: $${Number(item.carrito_items.precio_unitario) * item.carrito_items.cantidad}`,
          '------------------------'
        ]).flat(),
        'INFORMACIÓN DE ENTREGA:',
        `Dirección: ${pedido.direccion || 'Por definir'}`,
        `Fecha de entrega: ${pedido.fechaEntrega 
          ? new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : 'Por definir'}`,
        pedido.notas ? `Notas: ${pedido.notas}` : '',
        '------------------------',
        'RESUMEN DE PAGO:',
        `Subtotal: $${pedido.total}`,
        `Envío: Gratis`,
        `Total: $${pedido.total}`,
        '------------------------',
        '¡GRACIAS POR TU PEDIDO!',
        'Te mantendremos informado sobre el estado de tu pedido.',
        '=== DULCES DELICIAS ==='
      ].join('\n');

      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pedido-${pedido.id}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Ticket generado exitosamente');
    } catch (error) {
      console.error('Error al generar el ticket:', error);
      toast.error('Error al generar el ticket');
    } finally {
      setIsGenerandoTicket(false);
    }
  };

  const handlePago = async () => {
    if (!pedido) return;

    setIsProcessing(true);
    try {
      toast.success('¡Pago procesado exitosamente!');
      router.push('/dulcesdelicias');
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      toast.error('Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pedido no encontrado</h2>
          <button
            onClick={() => router.push('/')}
            className="text-pink-600 hover:text-pink-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Encabezado */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Revisa los detalles de tu pedido y completa el pago</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Detalles del pedido */}
          <div className="md:col-span-2 space-y-6">
            {/* Resumen del pedido */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>
              <div className="space-y-4">
                {pedido.pedido_pastel.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.carrito_items.pastel.imagen || '/placeholder.jpg'}
                        alt={item.carrito_items.pastel.nombre}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900">{item.carrito_items.pastel.nombre}</h3>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.carrito_items.cantidad}
                      </p>
                      <p className="text-pink-600 font-semibold">
                        ${Number(item.carrito_items.precio_unitario) * item.carrito_items.cantidad}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información de entrega */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Entrega</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-pink-500 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Dirección de Entrega</p>
                    <p className="text-gray-600">{pedido.direccion || 'Por definir'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-pink-500 mt-1" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Fecha de Entrega</p>
                    <p className="text-gray-600">
                      {pedido.fechaEntrega 
                        ? new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Por definir'}
                    </p>
                  </div>
                </div>
                {pedido.notas && (
                  <div className="flex items-start gap-3">
                    <Package className="text-pink-500 mt-1" size={20} />
                    <div>
                      <p className="font-medium text-gray-900">Notas</p>
                      <p className="text-gray-600">{pedido.notas}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumen de pago */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Pago</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${pedido.total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>Gratis</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-pink-600">${pedido.total}</span>
                  </div>
                </div>

                <button
                  onClick={imprimirTicket}
                  disabled={isGenerandoTicket}
                  className="w-full bg-white border-2 border-pink-600 text-pink-600 py-3 rounded-full font-medium hover:bg-pink-50 transition-all flex items-center justify-center gap-2"
                >
                  <Printer size={20} />
                  {isGenerandoTicket ? 'Generando...' : 'Imprimir Ticket'}
                </button>

                <button
                  onClick={handlePago}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-full font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={20} />
                  {isProcessing ? 'Procesando...' : 'Pagar Ahora'}
                </button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Puedes imprimir tu ticket antes de proceder con el pago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 