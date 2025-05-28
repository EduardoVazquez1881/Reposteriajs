"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/form/sidebar';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { pedidoService } from '@/services/pedidoService';
import { toast } from 'sonner';

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

const Estadisticas = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    cargarPedidos();
  }, [timeRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      cargarPedidos();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const cargarPedidos = async () => {
    try {
      const pedidos = await pedidoService.getAllPedidos();

      // Asegurarnos de que el campo 'total' sea numérico
      const pedidosNumericos = pedidos.map((pedido: Order) => ({
        ...pedido,
        total: Number(pedido.total) || 0,
      }));

      setOrders(pedidosNumericos);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar los datos');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Por definir';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredOrders = () => {
    const now = new Date();
    const filtered = orders.filter(order => order.estado === 'completado');
    
    switch (timeRange) {
      case '7dias':
        return filtered.filter(order => {
          const orderDate = new Date(order.fecha);
          const diffTime = Math.abs(now.getTime() - orderDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        });
      case '30dias':
        return filtered.filter(order => {
          const orderDate = new Date(order.fecha);
          const diffTime = Math.abs(now.getTime() - orderDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30;
        });
      case '90dias':
        return filtered.filter(order => {
          const orderDate = new Date(order.fecha);
          const diffTime = Math.abs(now.getTime() - orderDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 90;
        });
      case 'año':
        return filtered.filter(order => {
          const orderDate = new Date(order.fecha);
          return orderDate.getFullYear() === now.getFullYear();
        });
      default:
        return filtered;
    }
  };

  const exportToTxt = async () => {
    const completedOrders = getFilteredOrders();
    if (completedOrders.length === 0) {
      toast.error('No hay ventas completadas para exportar');
      return;
    }

    // Confirmar antes de exportar y eliminar
    if (!confirm(`¿Está seguro de que desea exportar y eliminar ${completedOrders.length} pedidos completados? Esta acción no se puede deshacer.`)) {
      return;
    }

    let content = 'REPORTE DE VENTAS COMPLETADAS\n';
    content += '=============================\n\n';
    content += `Fecha de generación: ${new Date().toLocaleString('es-CO')}\n`;
    content += `Período: ${timeRange === '7dias' ? 'Últimos 7 días' : 
                          timeRange === '30dias' ? 'Últimos 30 días' :
                          timeRange === '90dias' ? 'Últimos 90 días' : 'Este año'}\n\n`;

    let totalVentas = 0;
    let totalProductos = 0;

    completedOrders.forEach(order => {
      content += `Pedido #${order.id}\n`;
      content += `Fecha: ${formatDate(order.fecha)}\n`;
      content += `Cliente: ${order.USER?.username || 'N/A'}\n`;
      content += `Email: ${order.USER?.email || 'N/A'}\n`;
      content += `Total: ${formatCurrency(order.total)}\n`;
      
      if (order.pedido_pastel.length > 0) {
        content += '\nProductos:\n';
        order.pedido_pastel.forEach(pedido => {
          content += `- ${pedido.carrito_items.pastel.nombre}\n`;
          content += `  Cantidad: ${pedido.carrito_items.cantidad}\n`;
          content += `  Precio unitario: ${formatCurrency(pedido.carrito_items.precio_unitario)}\n`;
          content += `  Subtotal: ${formatCurrency(pedido.total)}\n`;
          totalProductos += pedido.carrito_items.cantidad;
        });
      }

      if (order.pedido_personalizado.length > 0) {
        content += '\nPedidos Personalizados:\n';
        order.pedido_personalizado.forEach(pedido => {
          content += `- ${pedido.carrito_personalizado.personalizado.nombre}\n`;
          content += `  Descripción: ${pedido.carrito_personalizado.personalizado.descripcion}\n`;
          content += `  Cantidad: ${pedido.carrito_personalizado.cantidad}\n`;
          content += `  Precio unitario: ${formatCurrency(pedido.carrito_personalizado.precio_unitario)}\n`;
          content += `  Subtotal: ${formatCurrency(pedido.total)}\n`;
          totalProductos += pedido.carrito_personalizado.cantidad;
        });
      }

      content += '\n------------------------\n\n';
      totalVentas += order.total;
    });

    content += `RESUMEN\n`;
    content += `========\n`;
    content += `Total de pedidos: ${completedOrders.length}\n`;
    content += `Total de productos vendidos: ${totalProductos}\n`;
    content += `Total de ventas: ${formatCurrency(totalVentas)}\n`;

    try {
      // Exportar el archivo
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ventas_completadas_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Eliminar los pedidos completados
      const deletePromises = completedOrders.map(order => 
        pedidoService.deletePedido(order.id)
      );
      await Promise.all(deletePromises);

      // Recargar los pedidos para actualizar la vista
      await cargarPedidos();
      
      toast.success(`Se exportaron y eliminaron ${completedOrders.length} pedidos completados correctamente`);
    } catch (error) {
      console.error('Error al exportar o eliminar pedidos:', error);
      toast.error('Error al procesar los pedidos. Por favor, intente nuevamente.');
    }
  };

  const completedOrders = getFilteredOrders();

  // Calculamos el total de ventas sumando el 'total' de *todos* los pedidos completados en el rango de tiempo seleccionado
  const totalVentas = completedOrders.reduce((sum, order) => sum + order.total, 0);
  
  const totalProductos = completedOrders.reduce((sum, order) => {
    const pasteles = order.pedido_pastel.reduce((acc, pedido) => acc + pedido.carrito_items.cantidad, 0);
    const personalizados = order.pedido_personalizado.reduce((acc, pedido) => acc + pedido.carrito_personalizado.cantidad, 0);
    return sum + pasteles + personalizados;
  }, 0);

  const metrics = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(totalVentas),
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Pedidos Completados',
      value: completedOrders.length.toString(),
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Clientes Únicos',
      value: new Set(completedOrders.map(order => order.USER?.id)).size.toString(),
      change: '+5.7%',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Productos Vendidos',
      value: totalProductos.toString(),
      change: '+15.3%',
      icon: Package,
      color: 'bg-orange-500'
    }
  ];

  const topProducts = completedOrders.reduce((acc, order) => {
    // Procesar pasteles
    order.pedido_pastel.forEach(pedido => {
      const nombre = pedido.carrito_items.pastel.nombre;
      const ventas = pedido.carrito_items.cantidad;
      const revenue = pedido.total;
      
      if (!acc[nombre]) {
        acc[nombre] = { sales: 0, revenue: 0 };
      }
      acc[nombre].sales += ventas;
      acc[nombre].revenue += revenue;
    });

    // Procesar pedidos personalizados
    order.pedido_personalizado.forEach(pedido => {
      const nombre = pedido.carrito_personalizado.personalizado.nombre;
      const ventas = pedido.carrito_personalizado.cantidad;
      const revenue = pedido.total;
      
      if (!acc[nombre]) {
        acc[nombre] = { sales: 0, revenue: 0 };
      }
      acc[nombre].sales += ventas;
      acc[nombre].revenue += revenue;
    });

    return acc;
  }, {} as Record<string, { sales: number; revenue: number }>);

  const topProductsArray = Object.entries(topProducts)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  return (
    <div className="flex min-h-screen bg-rose-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-rose-700">
                Estadísticas
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
              </p>
            </div>
            <div className="flex gap-4">
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7dias">Últimos 7 días</option>
                <option value="30dias">Últimos 30 días</option>
                <option value="90dias">Últimos 90 días</option>
                <option value="año">Este año</option>
              </select>
              <button 
                onClick={exportToTxt}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
              >
                <TrendingUp size={20} />
                Exportar
              </button>
              <button
                onClick={() => cargarPedidos()}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                title="Actualizar datos"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${metric.color}`}>
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-500 text-sm font-medium">
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm mb-1">
                  {metric.title}
                </h3>
                <p className="text-2xl font-bold text-gray-800">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Productos Más Vendidos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Productos Más Vendidos
              </h2>
              <div className="space-y-4">
                {topProductsArray.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.sales} ventas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ingresos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Últimas Ventas Completadas
              </h2>
              <div className="space-y-4">
                {completedOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="p-2 rounded-lg bg-green-100">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800">
                        Pedido #{order.id} - {order.USER?.username || 'Cliente'}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-gray-600">
                          {formatCurrency(order.total)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gráficos (placeholder) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Ventas por Día
              </h2>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de ventas</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Distribución de Ventas
              </h2>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de distribución</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas; 