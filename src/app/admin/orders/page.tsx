"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/form/sidebar';
import { Search, Filter, Package, CheckCircle, Clock, AlertCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { pedidoService } from '@/services/pedidoService';
import { toast } from 'sonner';
import Image from 'next/image';

interface Order {
  id: number;
  fk_usuario: number;
  total: number;
  direccion: string;
  telefono: string;
  notas: string;
  estado: string;
  fecha: string;
  fechaEntrega: string | null;
  USER: {
    id: number;
    username: string;
    email: string;
    telefono: string;
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
        precio: number;
        imagen: string;
      };
    };
  }>;
  pedido_personalizado: Array<{
    id: number;
    total: number;
    imagen_referencia: string | null;
    carrito_personalizado: {
      id: number;
      cantidad: number;
      precio_unitario: number;
      personalizado: {
        id: number;
        nombre: string;
        descripcion: string;
        imagen_referencia: string;
      };
    };
  }>;
  pago: Array<{
    id: number;
    monto: number;
    metodo: string;
    estado: string;
    fecha: string;
  }>;
}

const PedidosVentas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const cargarPedidos = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de pedidos...');
      
      const filters = statusFilter !== 'all' ? { estado: statusFilter } : undefined;
      const pedidos = await pedidoService.getAllPedidos(filters);
      
      console.log('Pedidos recibidos:', pedidos);

      if (!Array.isArray(pedidos)) {
        console.error('Los pedidos recibidos no son un array:', pedidos);
        toast.error('Error en el formato de los datos recibidos');
        return;
      }

      const pedidosProcesados = pedidos.map((pedido: Order) => {
        console.log('Procesando pedido:', pedido);
        const fechaPedido = pedido.fechaEntrega || pedido.fecha;
        return {
          ...pedido,
          fecha: fechaPedido,
          total: Number(pedido.total) || 0,
          pedido_pastel: pedido.pedido_pastel.map((pp) => ({
            ...pp,
            total: Number(pp.total) || 0,
            carrito_items: {
              ...pp.carrito_items,
              precio_unitario: Number(pp.carrito_items.precio_unitario) || 0
            }
          })),
          pedido_personalizado: pedido.pedido_personalizado.map((pp) => ({
            ...pp,
            total: Number(pp.total) || 0,
            carrito_personalizado: {
              ...pp.carrito_personalizado,
              precio_unitario: Number(pp.carrito_personalizado.precio_unitario) || 0
            }
          }))
        };
      });

      console.log('Pedidos procesados:', pedidosProcesados);
      setOrders(pedidosProcesados);
    } catch (error) {
      console.error('Error detallado al cargar los pedidos:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        toast.error(`Error al cargar los pedidos: ${error.message}`);
      } else {
        toast.error('Error al cargar los pedidos');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      
      // Obtener el pedido actual antes de actualizarlo
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        throw new Error('Pedido no encontrado');
      }

      // Si el pedido se está marcando como completado, verificar que no esté ya completado
      if (newStatus === 'completado' && currentOrder.estado === 'completado') {
        toast.info('Este pedido ya está marcado como completado');
        return;
      }

      // Actualizar el estado del pedido
      await pedidoService.updateEstadoPedido(orderId, newStatus);

      // Si el pedido se está marcando como completado, mostrar mensajes especiales
      if (newStatus === 'completado') {
        toast.success(`Pedido #${orderId} marcado como completado y agregado a las estadísticas`);
        toast.info('El total de ventas se ha actualizado en la página de Estadísticas');
      } else {
        toast.success('Estado del pedido actualizado correctamente');
      }

      // Recargar la lista de pedidos
      await cargarPedidos();

    } catch (error) {
      console.error('Error al actualizar estado:', error);
      if (error instanceof Error) {
        toast.error(`Error al actualizar el estado del pedido: ${error.message}`);
      } else {
        toast.error('Error al actualizar el estado del pedido');
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este pedido?')) {
      return;
    }

    try {
      await pedidoService.deletePedido(orderId);
      toast.success('Pedido eliminado correctamente');
      await cargarPedidos(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      toast.error('Error al eliminar el pedido');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completado':
        return <CheckCircle size={16} />;
      case 'en_proceso':
        return <Clock size={16} />;
      case 'pendiente':
        return <AlertCircle size={16} />;
      case 'cancelado':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completado':
        return 'Completado';
      case 'en_proceso':
        return 'En Proceso';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.USER?.username || ''} ${order.USER?.email || ''}`.toLowerCase();
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Por definir';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateString);
        return 'Fecha inválida';
      }
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatusUpdateModal = ({ order }: { order: Order }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Actualizar Estado del Pedido #{order.id}</h3>
        <div className="space-y-2">
          {['pendiente', 'en_proceso', 'completado', 'cancelado'].map((status) => (
            <button
              key={status}
              onClick={() => {
                if (status === 'completado' && order.estado !== 'completado') {
                  if (!confirm('¿Está seguro de marcar este pedido como completado? Este pedido se agregará a las estadísticas.')) {
                    return;
                  }
                }
                handleUpdateStatus(order.id, status);
                setShowModal(false);
                setSelectedOrder(null);
              }}
              disabled={updatingStatus === order.id}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                order.estado === status 
                  ? 'bg-rose-100 border-2 border-rose-500' 
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${updatingStatus === order.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <span className="font-medium">{getStatusText(status)}</span>
                {order.estado === status && <span className="text-sm text-gray-500">(Actual)</span>}
                {status === 'completado' && order.estado !== 'completado' && (
                  <span className="text-xs text-green-600 ml-auto">(Se agregará a estadísticas)</span>
                )}
              </div>
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedOrder(null);
            }}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  const OrderDetailModal = ({ order }: { order: Order }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-rose-700">Detalle del Pedido #{order.id}</h2>
            <button
              onClick={() => {
                setShowDetailModal(false);
                setSelectedOrder(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información del Cliente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Información del Cliente</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Nombre:</span> {order.USER?.username || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {order.USER?.email || 'N/A'}</p>
                <p><span className="font-medium">Teléfono:</span> {order.USER?.telefono || order.telefono || 'N/A'}</p>
                <p><span className="font-medium">Dirección:</span> {order.direccion || 'N/A'}</p>
              </div>
            </div>

            {/* Información del Pedido */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">Información del Pedido</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Fecha de Entrega:</span> {formatDate(order.fechaEntrega)}</p>
                <p><span className="font-medium">Pedido en:</span> {getCurrentDate()}</p>
                <p><span className="font-medium">Estado:</span> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                    {getStatusText(order.estado)}
                  </span>
                </p>
                <p><span className="font-medium">Total:</span> {formatCurrency(order.total)}</p>
                {order.notas && (
                  <p><span className="font-medium">Notas:</span> {order.notas}</p>
                )}
              </div>
            </div>
          </div>

          {/* Productos del Pedido */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3">Productos del Pedido</h3>
            
            {/* Pasteles */}
            {order.pedido_pastel && order.pedido_pastel.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-md mb-2 text-rose-600">Pasteles</h4>
                <div className="space-y-2">
                  {order.pedido_pastel.map((pedidoPastel, index) => (
                    <div key={index} className="bg-white border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {pedidoPastel.carrito_items.pastel.imagen && (
                            <div className="relative w-12 h-12">
                              <Image 
                                src={pedidoPastel.carrito_items.pastel.imagen} 
                                alt={pedidoPastel.carrito_items.pastel.nombre}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{pedidoPastel.carrito_items.pastel.nombre}</p>
                            <p className="text-sm text-gray-600">
                              Cantidad: {pedidoPastel.carrito_items.cantidad} x {formatCurrency(pedidoPastel.carrito_items.precio_unitario)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(pedidoPastel.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pasteles Personalizados */}
            {order.pedido_personalizado && order.pedido_personalizado.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-md mb-2 text-rose-600">Pasteles Personalizados</h4>
                <div className="space-y-2">
                  {order.pedido_personalizado.map((pedidoPersonalizado, index) => (
                    <div key={index} className="bg-white border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {(pedidoPersonalizado.imagen_referencia || pedidoPersonalizado.carrito_personalizado.personalizado.imagen_referencia) && (
                            <div className="relative w-12 h-12">
                              <Image 
                                src={pedidoPersonalizado.imagen_referencia || pedidoPersonalizado.carrito_personalizado.personalizado.imagen_referencia} 
                                alt={pedidoPersonalizado.carrito_personalizado.personalizado.nombre}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{pedidoPersonalizado.carrito_personalizado.personalizado.nombre}</p>
                            <p className="text-sm text-gray-600">{pedidoPersonalizado.carrito_personalizado.personalizado.descripcion}</p>
                            <p className="text-sm text-gray-600">
                              Cantidad: {pedidoPersonalizado.carrito_personalizado.cantidad} x {formatCurrency(pedidoPersonalizado.carrito_personalizado.precio_unitario)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(pedidoPersonalizado.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Información de Pago */}
          {order.pago && order.pago.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Información de Pago</h3>
              <div className="space-y-2">
                {order.pago.map((pago, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p><span className="font-medium">Método:</span> {pago.metodo}</p>
                        <p><span className="font-medium">Fecha:</span> {formatDate(pago.fecha)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(pago.monto)}</p>
                        <p className={`text-sm px-2 py-1 rounded ${
                          pago.estado === 'completado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {pago.estado}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-rose-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-rose-700">
              Pedidos y Ventas
            </h1>
            <div className="text-sm text-gray-600">
              Total de pedidos: {filteredOrders.length}
            </div>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por cliente o ID de pedido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay pedidos</h3>
              <p className="text-gray-500">No se encontraron pedidos con los filtros aplicados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-rose-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                        Pedido
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-rose-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                          {order.notas && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {order.notas}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.USER?.username || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.USER?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.fechaEntrega ? (
                            <>
                              <div>Entrega: {formatDate(order.fechaEntrega)}</div>
                              <div className="text-xs text-gray-500">Visto: {getCurrentDate()}</div>
                            </>
                          ) : (
                            <>
                              <div>{formatDate(order.fecha)}</div>
                              <div className="text-xs text-gray-500">Visto: {getCurrentDate()}</div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                            {getStatusIcon(order.estado)}
                            {getStatusText(order.estado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900 transition-colors"
                              title="Actualizar estado"
                              disabled={updatingStatus === order.id}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Eliminar pedido"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Resumen de Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {['pendiente', 'en_proceso', 'completado', 'cancelado'].map((status) => {
              const count = orders.filter(order => order.estado === status).length;
              const total = orders
                .filter(order => order.estado === status)
                .reduce((sum, order) => sum + order.total, 0);
              
              return (
                <div key={status} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(status)}
                    <h3 className="font-semibold text-gray-700">{getStatusText(status)}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showModal && selectedOrder && <StatusUpdateModal order={selectedOrder} />}
      {showDetailModal && selectedOrder && <OrderDetailModal order={selectedOrder} />}
    </div>
  );
};

export default PedidosVentas;