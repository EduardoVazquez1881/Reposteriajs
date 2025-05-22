"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/form/sidebar';
import { Search, Filter, Package, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { pedidoService } from '@/services/pedidoService';
import { toast } from 'sonner';

interface Order {
  id: number;
  fk_usuario: number;
  total: number;
  direccion: string;
  notas: string;
  estado: string;
  fecha: string;
  USER: {
    nombre: string;
    apellido: string;
  };
  pedido_pastel: Array<{
    total: number;
    carrito_items: Array<{
      cantidad: number;
      precio_unitario: number;
      pastel: {
        nombre: string;
      };
    }>;
  }>;
}

const PedidosVentas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      console.log('Iniciando carga de pedidos...');
      const pedidos = await pedidoService.getAllPedidos();
      console.log('Pedidos recibidos:', pedidos);

      if (!Array.isArray(pedidos)) {
        console.error('Los pedidos recibidos no son un array:', pedidos);
        toast.error('Error en el formato de los datos recibidos');
        return;
      }

      const pedidosProcesados = pedidos.map((pedido: Order) => {
        console.log('Procesando pedido:', pedido);
        return {
          ...pedido,
          total: Number(pedido.total) || 0,
          pedido_pastel: pedido.pedido_pastel.map((pp: Order['pedido_pastel'][0]) => {
            console.log('Procesando pedido_pastel:', pp);
            return {
              ...pp,
              total: Number(pp.total) || 0,
              carrito_items: pp.carrito_items.map((item: Order['pedido_pastel'][0]['carrito_items'][0]) => {
                console.log('Procesando carrito_items:', item);
                return {
                  ...item,
                  precio_unitario: Number(item.precio_unitario) || 0
                };
              })
            };
          })
        };
      });

      console.log('Pedidos procesados:', pedidosProcesados);
      setOrders(pedidosProcesados);
    } catch (error) {
      console.error('Error detallado al cargar los pedidos:', error);
      if (error instanceof Error) {
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
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
    const customerName = `${order.USER.nombre} ${order.USER.apellido}`.toLowerCase();
    const matchesSearch = customerName.includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-rose-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-rose-700">
              Pedidos y Ventas
            </h1>
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
                  <option value="pendiente">Pendientes</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="completado">Completados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <p className="text-gray-500">Cargando pedidos...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <Package className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-gray-500">
                  No se encontraron pedidos
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="text-rose-500" size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Pedido #{order.id}
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        Cliente: {order.USER.nombre} {order.USER.apellido}
                      </p>
                      <p className="text-gray-600">
                        Fecha: {new Date(order.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-rose-600">
                        ${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                        {getStatusIcon(order.estado)}
                        {getStatusText(order.estado)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                    <div className="space-y-2">
                      {order.pedido_pastel.map((pedidoPastel, index) => (
                        pedidoPastel.carrito_items.map((item, itemIndex) => (
                          <div key={`${index}-${itemIndex}`} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.cantidad}x {item.pastel.nombre}
                            </span>
                            <span className="text-gray-800">
                              ${typeof item.precio_unitario === 'number' ? item.precio_unitario.toFixed(2) : '0.00'}
                            </span>
                          </div>
                        ))
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Ver Detalles
                    </button>
                    <button className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
                      Actualizar Estado
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PedidosVentas; 