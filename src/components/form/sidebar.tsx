"use client";
import React, { useState, useRef, useEffect } from 'react';
import { X, Home, ShoppingCart, Phone, CircleUserRound, PackageSearch, UserPen, HelpCircle, AlignJustify, User, LogOut, Settings, ChevronUp, ClipboardList, BarChart3, Package, FileEdit, Gift, Star, Plus, Minus } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { DefaultSession } from 'next-auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCarrito } from '@/context/CarritoContext';

interface SidebarProps {
  children?: React.ReactNode;
}

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      role?: string;
      rol?: string;
    } & DefaultSession['user'];
  }
}

function Sidebar({ children }: SidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const { data: session, status } = useSession();
  const { carrito, eliminarDelCarrito, actualizarCantidad, total, limpiarCarrito } = useCarrito();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Validar si es admin con la sesión
  const isAdmin = session?.user?.rol === 'admin' || session?.user?.role === 'admin';

  const router = useRouter();

  type MenuItem = {
    icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    text: string;
    href?: string;
    spacing?: string;
    divider?: boolean;
    onClick?: () => void;
    badge?: number;
  };

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

  const adminMenuItems: MenuItem[] = [
    { icon: ClipboardList, text: 'Pedidos y Ventas', href: '/admin/orders' },
    { icon: Package, text: 'Inventario', href: '/inventario' },
    { icon: FileEdit, text: 'Gestión de Contenido', href: '/admin/gestion-contenido' },
    { icon: BarChart3, text: 'Estadísticas', href: '/admin/stats' },
    { icon: Gift, text: 'Ofertas y Descuentos', href: '/admin/ofertas' },
    { icon: Star, text: 'Delicoins', href: '/admin/delicoins' },
  ];

  const menuItems = isAdmin 
    ? [...regularMenuItems, { divider: true, text: 'Administración' }, ...adminMenuItems] 
    : regularMenuItems;

  const userMenuItems = [
    { icon: User, text: 'Perfil', action: () => router.push(`/user/${session?.user?.id}`) },
    { icon: Settings, text: 'Configuración', action: () => router.push('/settings') },
    { icon: LogOut, text: 'Cerrar sesión', action: () => signOut({ callbackUrl: '/auth/login' }) },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && event.target instanceof Node && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                      {item.icon && (
                        <item.icon size={24} className="text-rose-700" />
                      )}
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
                      src="/images/pensando.jpg"  
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
              
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100">
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-rose-100 rounded-tl-lg rounded-tr-lg last:rounded-bl-lg last:rounded-br-lg"
                    >
                      {item.icon && <item.icon size={20} className="text-rose-700" />}
                      <span className="text-gray-900">{item.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">
              <Link href="/auth/login" className="text-rose-600 font-semibold hover:underline">Iniciar sesión</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-h-screen p-4 transition-all duration-300" style={{ marginLeft: sidebarOpen && !isCollapsed ? 240 : isCollapsed ? 72 : 0 }}>
        {children}
      </main>

      {/* Carrito overlay */}
      {carritoAbierto && (
        <aside 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end transition-all duration-300"
          onClick={() => setCarritoAbierto(false)}
        >
          <div 
            className="w-96 bg-white h-full p-6 overflow-y-auto shadow-2xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Carrito de Compras</h2>
              <button 
                onClick={() => setCarritoAbierto(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <ShoppingCart size={48} className="mb-4 text-gray-400" />
                <p className="text-lg">Tu carrito está vacío</p>
                <p className="text-sm mt-2">¡Agrega algunos deliciosos pasteles!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {carrito.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.imagen || '/img/default-pastel.jpg'}
                          alt={item.nombre}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 80px) 100vw, 80px"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                            <p className="text-rose-600 font-medium">${item.precio}</p>
                          </div>
                          <button 
                            onClick={() => eliminarDelCarrito(item.id)} 
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <button 
                            className="p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) - 1)}
                            disabled={(item.cantidad || 1) <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-medium text-gray-700 min-w-[24px] text-center">
                            {item.cantidad || 1}
                          </span>
                          <button 
                            className="p-1.5 bg-rose-100 text-rose-600 rounded-full hover:bg-rose-200 transition-colors" 
                            onClick={() => actualizarCantidad(item.id, (item.cantidad || 1) + 1)}
                          >
                            <Plus size={16} />
                          </button>
                          <span className="ml-auto text-sm text-gray-600">
                            ${((item.cantidad || 1) * item.precio).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="font-bold text-rose-600">${total}</span>
                  </div>
                  <button 
                    className="w-full py-3 px-4 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    onClick={() => {
                      router.push('/checkout/ticket');
                      setCarritoAbierto(false);
                    }}
                  >
                    <ShoppingCart size={20} />
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

export default Sidebar;
