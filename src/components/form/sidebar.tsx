"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Home, ShoppingCart, Phone, CircleUserRound, PackageSearch, UserPen, HelpCircle, AlignJustify, User, LogOut, Settings, ChevronUp, ClipboardList, BarChart3, Package, FileEdit, Gift, Star, Plus, Minus } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { DefaultSession } from 'next-auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCarrito } from '@/context/CarritoContext';

interface SidebarProps {
  children?: React.ReactNode;
}
// Extend the DefaultSession type to include the `id` property
declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      role?: string; // Campo role para identificar administradores en inglés
      rol?: string;  // Campo rol para identificar administradores en español
    } & DefaultSession['user'];
  }
}

function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const { data: session, status } = useSession();
  const { carrito, eliminarDelCarrito, actualizarCantidad, total } = useCarrito();
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Temporalmente forzamos isAdmin a true para desarrollo
  const isAdmin = true; // Cambiado de la verificación original a true

  const router = useRouter();

  // Debug para mostrar información sobre la estructura de la sesión
  console.log("Estado de sesión:", status);
  console.log("Valor de rol:", session?.user?.rol);
  console.log("Valor de role:", session?.user?.role);

  // Define a type for menu items to include optional spacing and divider
  type MenuItem = {
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    text: string;
    href?: string;
    spacing?: string;
    divider?: boolean;
    onClick?: () => void;
    badge?: number;
  };

  // Menú para usuarios regulares
  const regularMenuItems: MenuItem[] = [
    { icon: Home, text: 'Inicio', href: '/' },
    { icon: PackageSearch, text: 'Productos', href: '/dulcesdelicias' },
    { 
      icon: ShoppingCart, 
      text: 'Carrito', 
      href: '#',
      onClick: () => setCarritoAbierto(true),
      badge: carrito.reduce((total, item) => total + (item.cantidad || 1), 0)
    },
    { icon: UserPen, text: 'Personalizado', href: '/personalized' },
    { icon: Phone, text: 'Contacto', href: '/contacto' },
    { icon: HelpCircle, text: 'Ayuda', href: '/ayuda', spacing: 'mt-auto' },
  ];

  // Menú adicional para administradores
  const adminMenuItems: MenuItem[] = [
    { icon: ClipboardList, text: 'Pedidos y Ventas', href: '/admin/orders' },
    { icon: Package, text: 'Inventario', href: '/inventario' },
    { icon: FileEdit, text: 'Gestión de Contenido', href: '/admin/gestion-contenido' },
    { icon: BarChart3, text: 'Estadísticas', href: '/admin/stats' },
    { icon: Gift, text: 'Ofertas y Descuentos', href: '/admin/ofertas' },
    { icon: Star, text: 'Delicoins', href: '/admin/delicoins' },
  ];

  // Combinamos los menús según el rol del usuario
  const menuItems = isAdmin 
    ? [...regularMenuItems, { divider: true, text: 'Administración' }, ...adminMenuItems] 
    : regularMenuItems;

  const userMenuItems = [
    { icon: User, text: 'Perfil', action: () => router.push(`/user/${session?.user?.id}`) },
    { icon: Settings, text: 'Configuración', action: () => router.push('/settings') },
    { icon: LogOut, text: 'Cerrar sesión', action: () => signOut({ callbackUrl: '/auth/login' }) },
  ];

  useEffect(() => {
    // Para debugging - verifica los datos de la sesión
    if (status === "authenticated" && session?.user) {
      console.log("Datos de sesión:", session.user);
      console.log("¿Es administrador?:", isAdmin);
    }
    
    function handleClickOutside(event: MouseEvent) {
      // Verificar si event.target es un Node
      if (userMenuRef.current && event.target instanceof Node && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef, isAdmin, session?.user, status]);

  const handleCarritoClick = () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    setCarritoAbierto(true);
  };

  return (
    <div className="flex">
      {/* Sidebar Fixed */}
      <aside 
        className={`
          fixed left-0 top-0 bottom-0 z-50
          bg-[#fdf2f8] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent)] 
          flex flex-col h-screen transition-all duration-300 ease-in-out rounded-r-lg
          shadow-2xl border-white/80
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-18' : 'w-60'}
        `}
      >
        <div className="p-4 border-b border-[#fcc5df] flex items-center justify-between rounded-xl drop-shadow-sm">
          <Image  
            src="/img/logo.png"  
            alt="Dulces Delicias Logo"  
            width={80}
            height={80}
            className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}
          />

          <div className="flex items-center">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block text-gray-300 hover:text-white transition-colors mx-2"
            >
              {isCollapsed ? <AlignJustify size={24} /> : <AlignJustify size={20} />}
            </button>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="my-4 space-y-4">
            {menuItems.map((item, index) => (
              item.divider ? (
                // Separador con título para sección de administración
                <li key={`divider-${index}`} className={`pt-4 pb-2 ${isCollapsed ? 'hidden' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="h-0.5 flex-grow bg-rose-200/50 rounded-full"></div>
                    <span className="text-xs font-medium text-rose-800">{item.text}</span>
                    <div className="h-0.5 flex-grow bg-rose-200/50 rounded-full"></div>
                  </div>
                </li>
              ) : (
                <li key={index} className="relative group">
                  <Link
                    href={item.href || '#'}
                    onClick={item.onClick}
                    className={`
                      flex items-center gap-3 p-2 rounded-xl hover:bg-rose-100/50 transition-all duration-300
                      ${item.spacing || ''}
                    `}
                  >
                    <div className="relative">
                      <item.icon size={24} className="text-rose-700" />
                      {item.badge && item.badge > 0 && (
                        <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="text-gray-900">{item.text}</span>
                    )}
                  </Link>
                </li>
              )
            ))}
          </ul>
        </nav>

        {/* User section with drop-up menu */}
        <div className={`p-4 border-t rounded-2xl shadow-xl border-[#fcc5df] ${isCollapsed ? 'px-2' : 'px-4'} relative`} ref={userMenuRef}>
          {status === "authenticated" && session?.user ? (
            <>
              <div 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center p-2 border-b-2 border-white/50 rounded-xl gap-3 hover:border-rose-700 transition-all duration-500 cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="bg-rose-100 p-2 rounded-full">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="User profile"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <CircleUserRound size={24} className="text-rose-700"/>
                  )}
                </div>
                
                {!isCollapsed && (
                  <div className="truncate flex-1">
                    <p className="font-medium text-gray-900">
                      {session.user.name || 'Usuario'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.user.email}
                    </p>
                  </div>
                )}
                
                <ChevronUp 
                  size={20} 
                  className={`transform transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </div>
              
              {/* Drop-up menu */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100">
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <item.icon size={20} className="text-gray-500" />
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-3 p-2 border-b-2 border-white/50 rounded-xl hover:border-rose-700 transition-all duration-500"
            >
              <CircleUserRound size={24} className="text-rose-700" />
              {!isCollapsed && (
                <span className="text-gray-900">Iniciar sesión</span>
              )}
            </Link>
          )}
        </div>
      </aside>

      {/* Carrito en Sidebar */}
      {carritoAbierto && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setCarritoAbierto(false)}>
          <div 
            className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-50 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Encabezado del carrito */}
            <div className="px-4 py-3 bg-rose-50 flex justify-between items-center border-b border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <ShoppingCart size={20} />
                <h2 className="font-semibold text-lg">Tu Carrito</h2>
              </div>
              <button 
                onClick={() => setCarritoAbierto(false)}
                className="text-rose-500 hover:text-rose-700"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Contenido del carrito */}
            <div className="flex-grow overflow-y-auto p-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="bg-rose-50 p-6 rounded-full mb-4">
                    <ShoppingCart size={32} className="text-rose-300" />
                  </div>
                  <h3 className="font-medium text-lg text-rose-900 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-500 mb-6">
                    Parece que aún no has añadido ningún delicioso pastel a tu carrito.
                  </p>
                  <button 
                    onClick={() => setCarritoAbierto(false)}
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
                            src={item.imagen} 
                            alt={item.nombre} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Detalles del producto */}
                        <div className="flex-grow">
                          <h4 className="font-medium text-rose-900">{item.nombre}</h4>
                          <p className="text-rose-600 font-semibold">${item.precio}</p>
                          
                          {/* Control de cantidad */}
                          <div className="flex items-center mt-2">
                            <button 
                              onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="mx-2 w-8 text-center">{item.cantidad || 1}</span>
                            <button 
                              onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md"
                            >
                              <Plus size={14} />
                            </button>
                            
                            <button 
                              onClick={() => eliminarDelCarrito(item.id)}
                              className="ml-auto text-gray-400 hover:text-rose-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Resumen del pedido */}
                  <div className="mt-6 bg-rose-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${total}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Envío:</span>
                      <span className="font-medium">$50</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-rose-900 pt-2 border-t border-rose-200">
                      <span>Total:</span>
                      <span>${total + 50}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Pie del carrito */}
            {carrito.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-full font-medium hover:shadow-lg transition-all">
                  Proceder al Pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="bg-white shadow-sm p-4 flex lg:hidden items-center">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 hover:text-gray-900 duration-500"
        >
          <Menu size={24} />
        </button>
      </header>
      
      {/* Main Content with Scroll */}
      <div 
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen 
            ? isCollapsed 
              ? 'lg:ml-18' 
              : 'lg:ml-60' 
            : 'lg:ml-0'
        }`}
      >
        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;