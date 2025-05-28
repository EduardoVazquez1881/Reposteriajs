"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Sidebar from '@/components/form/sidebar';
import { CheckCircle2, XCircle, Eye, Package, Calendar, MapPin, DollarSign, Edit2, Save, X } from 'lucide-react';
import { pedidoService } from '@/services/pedidoService';

// Agregar la interfaz Pedido al inicio del archivo, después de los imports
interface Pedido {
  id: number;
  estado: string;
  fecha: string | null;
  direccion: string | null;
  total: number;
  precio?: number;
  instrucciones?: string;
  descripcion?: string;
  pedido_pastel: Array<{
    id: number;
    carrito_items: Array<{
      id: number;
      cantidad: number;
      precio_unitario: number;
      pastel?: {
        nombre: string;
      };
    }>;
  }>;
}

interface ErrorResponse {
  message?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

interface CarritoItem {
  id: number;
  cantidad: number;
  precio_unitario: number;
  pastel?: {
    nombre: string;
  };
}

interface PedidoPastel {
  id: number;
  carrito_items: CarritoItem[];
}

export default function EstadoPedidoPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [pedido, setPedido] = useState<Pedido | null>(null);
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
        console.log('Pedido cargado:', data);
        
        // Asegurarse de que la fecha se maneje correctamente
        if (data) {
          // Usar fechaEntrega si está disponible, de lo contrario usar fecha
          const fechaPedido = data.fechaEntrega || data.fecha;
          if (fechaPedido) {
            // Actualizar también el estado de nuevaFecha para mantener consistencia
            setNuevaFecha(new Date(fechaPedido).toISOString().split('T')[0]);
          }
          setPedido({
            ...data,
            fecha: fechaPedido
          });
        }
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        toast.error("No se pudo cargar el pedido");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPedido();
  }, [id]);

  const handleFinalizarPedido = async () => {
    if (!pedido) {
      toast.error('No hay pedido para finalizar');
      return;
    }
    
    // Validar que el pedido no esté ya en proceso o cancelado
    if (pedido.estado === 'en_proceso') {
      toast.error('Este pedido ya está en proceso');
      return;
    }
    if (pedido.estado === 'cancelado') {
      toast.error('No se puede procesar un pedido cancelado');
      return;
    }

    // Validar que tenga fecha de entrega
    if (!pedido.fecha) {
      toast.error('Debes establecer una fecha de entrega antes de procesar el pedido');
      return;
    }

    // Validar que tenga dirección
    if (!pedido.direccion) {
      toast.error('Debes establecer una dirección de entrega antes de procesar el pedido');
      return;
    }
    
    // Confirmar antes de procesar
    const confirmar = window.confirm('¿Estás seguro de que deseas procesar este pedido? El pedido será enviado a la sección de pedidos para su seguimiento.');
    if (!confirmar) return;

    setIsUpdating(true);
    try {
      console.log('Intentando procesar pedido:', { 
        id: pedido.id, 
        estadoActual: pedido.estado,
        pedidoCompleto: pedido 
      });
      
      const pedidoActualizado = await pedidoService.updateEstadoPedido(pedido.id, 'en_proceso');
      
      if (!pedidoActualizado) {
        throw new Error('No se recibió respuesta del servidor');
      }

      console.log('Pedido actualizado exitosamente:', pedidoActualizado);
      
      // Actualizar el estado local del pedido
      setPedido(pedidoActualizado);
      toast.success('Pedido enviado a procesamiento exitosamente');
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push('/personalized');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error al procesar el pedido:', {
        error,
        pedidoId: pedido.id,
        estadoActual: pedido.estado
      });
      
      let errorMessage = 'Error al procesar el pedido';
      const err = error as ErrorResponse;
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
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
      await pedidoService.updateEstadoPedido(pedido.id, 'cancelado');
      setPedido({ ...pedido, estado: 'cancelado' });
      toast.success('Pedido cancelado exitosamente');
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      console.error('Error al cancelar pedido:', err);
      toast.error(err.message || 'Error al cancelar el pedido');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActualizarFecha = async () => {
    if (!pedido || !nuevaFecha) {
      setErrorFecha('Por favor selecciona una fecha');
      return;
    }

    try {
      // Validar la fecha antes de enviarla
      const fechaSeleccionada = new Date(nuevaFecha + 'T12:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaSeleccionada < hoy) {
        setErrorFecha('La fecha no puede ser anterior a hoy');
        return;
      }

      const fechaMaxima = new Date();
      fechaMaxima.setDate(fechaMaxima.getDate() + 30);
      if (fechaSeleccionada > fechaMaxima) {
        setErrorFecha('La fecha no puede ser más de 30 días en el futuro');
        return;
      }

      setErrorFecha('');
      setIsUpdating(true);
      
      // Formatear la fecha en formato ISO para el servidor
      const fechaISO = fechaSeleccionada.toISOString();
      console.log('Actualizando fecha del pedido:', { 
        id: pedido.id, 
        nuevaFecha, 
        fechaISO,
        pedidoActual: pedido 
      });
      
      // Actualizar el pedido con la nueva fecha
      const pedidoActualizado = await pedidoService.updatePedido(pedido.id, {
        fechaEntrega: fechaISO
      });
      
      console.log('Pedido actualizado:', pedidoActualizado);
      
      // Actualizar el estado local con la nueva fecha
      if (pedidoActualizado) {
        // Asegurarse de que la fecha se actualice correctamente en el estado local
        const fechaActualizada = pedidoActualizado.fechaEntrega || pedidoActualizado.fecha;
        setPedido({
          ...pedidoActualizado,
          fecha: fechaActualizada
        });
        
        // Actualizar también el input de fecha para mantener la consistencia
        if (fechaActualizada) {
          setNuevaFecha(new Date(fechaActualizada).toISOString().split('T')[0]);
        }
        
        setEditandoFecha(false);
        toast.success('Fecha de entrega actualizada exitosamente');
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      console.error('Error al actualizar la fecha:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Error al actualizar la fecha';
      setErrorFecha(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Función auxiliar para formatear la fecha
  const formatearFecha = (fecha: string | Date | null) => {
    if (!fecha) return 'Por definir';
    try {
      const fechaObj = new Date(fecha);
      if (isNaN(fechaObj.getTime())) {
        console.error('Fecha inválida:', fecha);
        return 'Fecha inválida';
      }
      // Ajustar la fecha para la zona horaria local
      fechaObj.setMinutes(fechaObj.getMinutes() + fechaObj.getTimezoneOffset());
      return fechaObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
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
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      console.error('Error al actualizar la dirección:', err);
      toast.error(err.message || 'Error al actualizar la dirección');
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
                        setErrorFecha('');
                      }}
                      className="text-pink-600 hover:text-pink-700"
                      title="Editar fecha de entrega"
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
                        max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      />
                      <button
                        onClick={handleActualizarFecha}
                        disabled={isUpdating || !nuevaFecha}
                        className="p-2 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Guardar fecha"
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
                        title="Cancelar edición"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    {errorFecha && (
                      <p className="text-sm text-red-500">{errorFecha}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      La fecha debe ser entre hoy y los próximos 30 días
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-medium">
                    {formatearFecha(pedido.fecha)}
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
                      {pedido.pedido_pastel.map((pp: PedidoPastel, idx: number) => {
                        return (
                          <div key={pp.id || idx} className="mb-2 p-2 border rounded">
                            {pp.carrito_items && pp.carrito_items.length > 0 ? (
                              pp.carrito_items.map((item: CarritoItem, i: number) => {
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

            {pedido.estado !== 'en_proceso' && pedido.estado !== 'cancelado' && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleFinalizarPedido}
                  disabled={isUpdating || !pedido.fecha || !pedido.direccion}
                  className={`flex-1 flex items-center justify-center gap-2 ${
                    !pedido.fecha || !pedido.direccion 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      {!pedido.fecha || !pedido.direccion 
                        ? 'Completa los datos requeridos' 
                        : 'Enviar a Procesamiento'}
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