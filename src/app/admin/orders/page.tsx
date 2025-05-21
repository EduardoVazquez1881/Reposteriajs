"use client";

import React, { useState } from 'react';
import { Search, Filter, Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/form/sidebar';

interface Order {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const PedidosVentas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Datos de ejemplo
  const orders: Order[] = [
    {
      id: 'ORD001',
      customerName: 'María González',
      date: '2024-03-15',
      total: 450.00,
      status: 'completed',
      items: [
        { name: 'Pastel de Chocolate', quantity: 1, price: 450.00 }
      ]
    },
    {
      id: 'ORD002',
      customerName: 'Juan Pérez',
      date: '2024-03-15',
      total: 850.00,
      status: 'processing',
      items: [
        { name: 'Red Velvet', quantity: 1, price: 500.00 },
        { name: 'Cupcakes (6)', quantity: 1, price: 350.00 }
      ]
    },
    {
      id: 'ORD003',
      customerName: 'Ana Martínez',
      date: '2024-03-14',
      total: 1200.00,
      status: 'pending',
      items: [
        { name: 'Pastel de Bodas', quantity: 1, price: 1200.00 }
      ]
    }
  ];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'processing':
        return <Clock size={16} />;
      case 'pending':
        return <AlertCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'processing':
        return 'En Proceso';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
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
            <button className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors">
              Nuevo Pedido
            </button>
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
                  <option value="pending">Pendientes</option>
                  <option value="processing">En proceso</option>
                  <option value="completed">Completados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Pedidos */}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
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
                      Cliente: {order.customerName}
                    </p>
                    <p className="text-gray-600">
                      Fecha: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-2xl font-bold text-rose-600">
                      ${order.total.toFixed(2)}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Productos:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-gray-800">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
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
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Package className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-500">
                No se encontraron pedidos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidosVentas; 