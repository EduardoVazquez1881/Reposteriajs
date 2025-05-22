"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Sidebar from '@/components/form/sidebar';
import { CheckCircle2, XCircle, Eye, Package, Calendar, MapPin, DollarSign, Edit2, Save, X } from 'lucide-react';
import { pedidoService } from '@/services/pedidoService';

export default function EstadoPedidoPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editandoFecha, setEditandoFecha] = useState(false);
  const [editandoDireccion, setEditandoDireccion] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [errorFecha, setErrorFecha] = useState('');

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const pedidoId = typeof id === 'string' ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : undefined;
        if (!pedidoId) return;
        const data = await pedidoService.getPedidoById(pedidoId);
        if (data.fecha) {
          data.fechaEntrega = data.fecha;
        }
        setPedido(data);
      } catch (error) {
        toast.error("No se pudo cargar el pedido");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPedido();
  }, [id]);

  const handleFinalizarPedido = async () => {
    if (!pedido) return;
    
    // Confirmar antes de finalizar
    const confirmar = window.confirm('¿Estás seguro de que deseas finalizar este pedido? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    setIsUpdating(true);
    try {
      // Verificar que el pedido no esté ya completado o cancelado
      if (pedido.estado === 'completado') {
        toast.error('Este pedido ya está finalizado');
        setIsUpdating(false);
        return;
      }
      if (pedido.estado === 'cancelado') {
        toast.error('No se puede finalizar un pedido cancelado');
        setIsUpdating(false);
        return;
      }

      console.log('Intentando finalizar pedido:', { 
        id: pedido.id, 
        estadoActual: pedido.estado,
        pedidoCompleto: pedido 
      });
      
      const pedidoActualizado = await pedidoService.updatePedidoEstado(pedido.id, 'completado');
      console.log('Respuesta del servidor:', pedidoActualizado);
      
      if (!pedidoActualizado) {
        throw new Error('No se recibió respuesta del servidor');
      }
      
      // Actualizar el estado local del pedido
      setPedido((prevPedido: typeof pedido) => ({ ...prevPedido, estado: 'completado' }));
      toast.success('Pedido finalizado exitosamente');
      
      // Opcional: redirigir después de un breve delay
      setTimeout(() => {
        router.push('/personalized');
      }, 2000);
    } catch (error: any) {
      console.error('Error detallado al finalizar el pedido:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        pedidoId: pedido.id,
        estadoActual: pedido.estado
      });
      
      let errorMessage = 'Error al finalizar el pedido';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelarPedido = async () => {
    if (!pedido) return;
    setIsUpdating(true);
    try {
      await pedidoService.updatePedidoEstado(pedido.id, 'cancelado');
      setPedido({ ...pedido, estado: 'cancelado' });
      toast.success('Pedido cancelado exitosamente');
    } catch (error) {
      toast.error('Error al cancelar el pedido');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActualizarFecha = async () => {
    if (!pedido || !nuevaFecha) {
      setErrorFecha('Por favor selecciona una fecha');
      return;
    }

    // Validar que la fecha no sea anterior a hoy
    const fechaSeleccionada = new Date(nuevaFecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      setErrorFecha('La fecha no puede ser anterior a hoy');
      return;
    }

    setErrorFecha('');
    setIsUpdating(true);
    
    try {
      const pedidoActualizado = await pedidoService.updatePedido(pedido.id, {
        fechaEntrega: nuevaFecha
      });
      
      if (pedidoActualizado.fecha) {
        pedidoActualizado.fechaEntrega = pedidoActualizado.fecha;
      }
      
      setPedido(pedidoActualizado);
      setEditandoFecha(false);
      toast.success('Fecha de entrega actualizada exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar la fecha:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar la fecha';
      setErrorFecha(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActualizarDireccion = async () => {
    if (!pedido || !nuevaDireccion) return;
    setIsUpdating(true);
    try {
      const pedidoActualizado = await pedidoService.updatePedido(pedido.id, {
        direccion: nuevaDireccion
      });
      setPedido(pedidoActualizado);
      setEditandoDireccion(false);
      toast.success('Dirección actualizada exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar la dirección:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar la dirección');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontró el pedido</h3>
          <p className="mt-1 text-sm text-gray-500">El pedido que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={() => router.push('/personalized')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            Volver a pedidos personalizados
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex'>
      <Sidebar />
      <div className='flex-1 p-8'>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Estado de tu Pedido</h1>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              pedido.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
              pedido.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
              pedido.estado === 'completado' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1).replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign size={20} />
                  <span className="font-medium">Precio Total</span>
                </div>
                <p className="text-2xl font-bold text-pink-600">${pedido.total || pedido.precio}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between text-gray-600 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span className="font-medium">Fecha de Entrega</span>
                  </div>
                  {pedido.estado === 'pendiente' && !editandoFecha && (
                    <button
                      onClick={() => {
                        setEditandoFecha(true);
                        setNuevaFecha(pedido.fecha ? new Date(pedido.fecha).toISOString().split('T')[0] : '');
                      }}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
                {editandoFecha ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={nuevaFecha}
                        onChange={(e) => {
                          setNuevaFecha(e.target.value);
                          setErrorFecha('');
                        }}
                        className={`flex-1 p-2 border rounded-md ${errorFecha ? 'border-red-500' : 'border-gray-300'}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <button
                        onClick={handleActualizarFecha}
                        disabled={isUpdating || !nuevaFecha}
                        className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600"></div>
                        ) : (
                          <Save size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditandoFecha(false);
                          setErrorFecha('');
                          if (pedido.fecha) {
                            setNuevaFecha(new Date(pedido.fecha).toISOString().split('T')[0]);
                          }
                        }}
                        disabled={isUpdating}
                        className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {errorFecha && (
                      <p className="text-sm text-red-500">{errorFecha}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg font-medium">
                    {pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Por definir'}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <div className="flex items-center justify-between text-gray-600 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={20} />
                    <span className="font-medium">Dirección de Entrega</span>
                  </div>
                  {pedido.estado === 'pendiente' && !editandoDireccion && (
                    <button
                      onClick={() => {
                        setEditandoDireccion(true);
                        setNuevaDireccion(pedido.direccion || '');
                      }}
                      className="text-pink-600 hover:text-pink-700"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </div>
                {editandoDireccion ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={nuevaDireccion}
                      onChange={(e) => setNuevaDireccion(e.target.value)}
                      placeholder="Ingresa la dirección de entrega"
                      className="flex-1 p-2 border rounded-md"
                    />
                    <button
                      onClick={handleActualizarDireccion}
                      disabled={isUpdating}
                      className="p-2 text-green-600 hover:text-green-700"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => setEditandoDireccion(false)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <p className="text-lg">{pedido.direccion || 'Por confirmar'}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={() => setMostrarDetalles(!mostrarDetalles)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Eye size={20} />
                <span className="font-medium">
                  {mostrarDetalles ? 'Ocultar Detalles' : 'Ver Detalles del Pedido'}
                </span>
              </button>

              {mostrarDetalles && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Detalles del Pedido:</h4>
                  {pedido.instrucciones ? (
                    <ul className="text-gray-600 mb-4 list-disc list-inside">
                      {pedido.instrucciones.split(',').map(function(detalle: string, idx: number) {
                        return <li key={idx}>{detalle.trim()}</li>;
                      })}
                    </ul>
                  ) : (
                    <p className="text-gray-600 whitespace-pre-line mb-4">{pedido.descripcion}</p>
                  )}
                  {pedido.pedido_pastel && pedido.pedido_pastel.length > 0 && (
                    <div>
                      <h5 className="font-semibold mb-2">Pasteles seleccionados:</h5>
                      {pedido.pedido_pastel.map(function(pp: any, idx: number) {
                        return (
                          <div key={pp.id || idx} className="mb-2 p-2 border rounded">
                            {pp.carrito_items && pp.carrito_items.length > 0 ? (
                              pp.carrito_items.map(function(item: any, i: number) {
                                return (
                                  <div key={item.id || i} className="mb-2">
                                    <span className="font-medium">Nombre:</span> {item.pastel?.nombre || 'Sin nombre'}<br />
                                    <span className="font-medium">Cantidad:</span> {item.cantidad}<br />
                                    <span className="font-medium">Precio unitario:</span> ${item.precio_unitario}<br />
                                  </div>
                                );
                              })
                            ) : (
                              <span>No hay detalles de pastel.</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {pedido.estado === 'pendiente' && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleFinalizarPedido}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Finalizar Pedido
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancelarPedido}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle size={20} />
                  Cancelar Pedido
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/personalized')}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                ← Volver a pedidos personalizados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 