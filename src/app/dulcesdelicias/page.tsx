"use client"
//a
import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Heart, Search, ChevronDown, X, Star, SlidersHorizontal } from 'lucide-react';
import Sidebar from '@/components/form/sidebar';
import Image from 'next/image';
import CarritoLateral from '@/components/form/CarritoLateral';
import { useCarrito } from '@/context/CarritoContext';
import FavoritosLateral from '@/components/form/FavoritosLateral';
import CheckoutForm from '@/components/form/CheckoutForm';
import { productoService } from '@/services/productoService';
import { toast } from 'sonner';
import type { Pastel } from '@/types/pastel';

// Datos simulados basados en tu esquema de base de datos
const pastelesMock: Pastel[] = [
  {
    id: "1",
    nombre: 'Pastel de Chocolate',
    descripcion: 'El sabor profundo y la textura suave del chocolate se combinan para crear un pastel irresistible, perfecto para cualquier ocasión.',
    precio: 300,
    imagen: '/images/chocolate.jpg',
    destacado: true,
    etiquetas: ['Chocolate', 'Favoritos'],
    calificacion: 4.8,
    tipo: 'pastel',
    stock: 10,
    disponible: true,
    unidad: 'unidad'
  },
  {
    id: "2",
    nombre: 'Tarta de Fresas',
    descripcion: 'Fresas frescas sobre una base de crema pastelera y masa quebrada. Una explosión de sabor frutal.',
    precio: 280,
    imagen: '/images/fresas.jpeg',
    destacado: false,
    etiquetas: ['Frutales', 'Verano'],
    calificacion: 4.5,
    tipo: 'pastel',
    stock: 8,
    disponible: true,
    unidad: 'unidad'
  },
  {
    id: "3",
    nombre: 'Cheesecake de Frutos Rojos',
    descripcion: 'La cremosidad del cheesecake se combina con la frescura de los frutos rojos para crear un postre irresistible.',
    precio: 320,
    imagen: '/images/frutas.jpg',
    destacado: true,
    etiquetas: ['Frutales', 'Favoritos'],
    calificacion: 4.9,
    tipo: 'pastel',
    stock: 12,
    disponible: true,
    unidad: 'unidad'
  },
  {
    id: "4",
    nombre: 'Pastel de Zanahoria',
    descripcion: 'Un clásico reinventado con zanahorias frescas y un delicioso frosting de queso crema.',
    precio: 290,
    imagen: '/images/zanahoria.jpg',
    destacado: false,
    etiquetas: ['Tradicionales', 'Vegetariano'],
    calificacion: 4.7,
    tipo: 'pastel',
    stock: 6,
    disponible: true,
    unidad: 'unidad'
  },
  {
    id: "5",
    nombre: 'Tiramisú',
    descripcion: 'El postre italiano por excelencia, con capas de bizcocho empapado en café y crema de mascarpone.',
    precio: 350,
    imagen: '/images/tiramisu.jpg',
    destacado: true,
    etiquetas: ['Especiales', 'Favoritos'],
    calificacion: 4.9,
    tipo: 'pastel',
    stock: 15,
    disponible: true,
    unidad: 'unidad'
  },
  {
    id: "6",
    nombre: 'Pastel de Limón',
    descripcion: 'Un refrescante pastel de limón con un toque de menta y una base crujiente de galletas.',
    precio: 270,
    imagen: '/images/limon.jpg',
    destacado: false,
    etiquetas: ['Frutales', 'Verano'],
    calificacion: 4.6,
    tipo: 'pastel',
    stock: 9,
    disponible: true,
    unidad: 'unidad'
  }
];

const categoriasMock = ['Todos', 'Chocolate', 'Especiales', 'Tradicionales', 'Frutales', 'Favoritos', 'Minis', 'Verano'];

export default function DulcesDelicias() {
  const [pasteles, setPasteles] = useState<Pastel[]>(pastelesMock);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [ordenPrecio, setOrdenPrecio] = useState<'asc' | 'desc' | null>(null);
  const [favoritosAbierto, setFavoritosAbierto] = useState(false);
  const [favoritos, setFavoritos] = useState<Pastel[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const { carrito, agregarAlCarrito } = useCarrito();
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  
  // Efecto para guardar los pasteles en el inventario
  useEffect(() => {
    const guardarPastelesEnInventario = async () => {
      try {
        // Intentar cargar productos existentes
        const productosExistentes = await productoService.getProductos();
        
        // Para cada pastel en pastelesMock
        for (const pastel of pastelesMock) {
          // Verificar si el pastel ya existe en el inventario
          const pastelExiste = productosExistentes.some(p => p.id === pastel.id);
          
          if (!pastelExiste) {
            // Si no existe, crearlo en el inventario
            try {
              const productoParaCrear = {
                ...pastel,
                tipo: pastel.tipo || 'pastel',
                stock: pastel.stock || 0
              };
              await productoService.createProducto(productoParaCrear);
              console.log(`Pastel ${pastel.nombre} guardado en inventario`);
            } catch (error) {
              console.error(`Error al guardar pastel ${pastel.nombre}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error al guardar pasteles en inventario:', error);
        toast.error('Error al sincronizar con inventario');
      }
    };

    guardarPastelesEnInventario();
  }, []); // Se ejecuta solo al montar el componente

  // Filtrar pasteles por categoría y búsqueda
  useEffect(() => {
    let pastelesActualizados = [...pastelesMock];
    
    // Filtrar por categoría
    if (categoriaActiva !== 'Todos') {
      pastelesActualizados = pastelesActualizados.filter(
        pastel => pastel.etiquetas.includes(categoriaActiva)
      );
    }
    
    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
      pastelesActualizados = pastelesActualizados.filter(
        pastel => 
          pastel.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          pastel.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
          pastel.etiquetas.some(tag => tag.toLowerCase().includes(busqueda.toLowerCase()))
      );
    }
    
    // Ordenar por precio
    if (ordenPrecio === 'asc') {
      pastelesActualizados.sort((a, b) => a.precio - b.precio);
    } else if (ordenPrecio === 'desc') {
      pastelesActualizados.sort((a, b) => b.precio - a.precio);
    }
    
    setPasteles(pastelesActualizados);
  }, [categoriaActiva, busqueda, ordenPrecio]);

  // Función para agregar al carrito
 const handleAgregarAlCarrito = useCallback((pastel: Pastel) => {
  agregarAlCarrito(pastel);
  setCarritoAbierto(true);
}, [agregarAlCarrito]);

  // Función para alternar el estado de favorito
  const toggleFavorito = (pastel: Pastel) => {
    if (favoritos.some(fav => fav.id === pastel.id)) {
      setFavoritos(favoritos.filter(fav => fav.id !== pastel.id));
    } else {
      setFavoritos([...favoritos, pastel]);
    }
  };

  // Función para eliminar de favoritos
  const eliminarFavorito = (id: string) => {
    setFavoritos(favoritos.filter(fav => fav.id !== id));
  };
  
  // Componente para la tarjeta de producto
  const TarjetaProducto = ({ pastel, onAgregarAlCarrito }: { pastel: Pastel, onAgregarAlCarrito: () => void }) => {
    const esFavorito = favoritos.some(fav => fav.id === pastel.id);
    
    return (
      <div className='group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
        <div className='relative overflow-hidden'>
          <Image 
            src={pastel.imagen} 
            alt={pastel.nombre} 
            width={800}
            height={288}
            className='w-full h-72 object-cover transform group-hover:scale-105 transition-transform duration-500'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6'>
            <button 
              onClick={onAgregarAlCarrito}
              className='bg-pink-600 text-white py-2 px-4 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:bg-pink-700'
            >
              Añadir al Carrito
            </button>
          </div>
          <div className='absolute top-4 right-4 flex flex-col gap-2'>
            {pastel.destacado && (
              <span className='bg-yellow-400 text-yellow-800 text-xs font-bold py-1 px-2 rounded-full'>
                Destacado
              </span>
            )}
            <button 
              onClick={() => toggleFavorito(pastel)}
              className={`p-2 rounded-full transition-colors duration-300 ${
                esFavorito ? 'bg-pink-100 text-pink-600' : 'bg-white/80 text-gray-400'
              }`}
            >
              <Heart className={esFavorito ? 'fill-pink-600' : ''} size={16} />
            </button>
          </div>
        </div>
        <div className='p-4'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='text-xl font-semibold text-rose-900 group-hover:text-pink-600 transition-colors duration-300'>
              {pastel.nombre}
            </h3>
            <span className='text-pink-600 font-bold text-lg'>
              ${pastel.precio}
            </span>
          </div>
          
          <div className='flex items-center mb-2'>
            <div className='flex text-yellow-400'>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  size={14}
                  className={i < Math.floor(pastel.calificacion) ? 'fill-yellow-400' : ''}
                />
              ))}
            </div>
            <span className='text-gray-500 text-sm ml-1'>({pastel.calificacion})</span>
          </div>

          <p className='text-gray-600 mb-2 line-clamp-3'>
            {pastel.descripcion}
          </p>

          <div className='mt-4 flex justify-between items-center'>
            <div className='flex flex-wrap gap-2'>
              {pastel.etiquetas.map((etiqueta, index) => (
                <span 
                  key={index}
                  className='bg-rose-100 text-rose-900 text-xs rounded-full py-1 px-3 hover:scale-105 hover:text-rose-600 transition-transform duration-300'
                >
                  {etiqueta}
                </span>
              ))}
            </div>
            <button 
              onClick={onAgregarAlCarrito}
              className='text-rose-600 hover:text-rose-500 hover:scale-110 transition-all duration-300'
            >
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='flex min-h-screen bg-rose-50'>
      <Sidebar />

      <div className='flex-1'>      
        <div className='container mx-auto px-4 py-8'>
          {/* Header con título y carrito */}
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold text-rose-900'>Nuestros Deliciosos Pasteles</h1>
          </div>
          
          {/* Botones fijos de Favoritos y Carrito */}
          <div className='fixed top-6 right-6 flex gap-3 z-40'>
            <button 
              onClick={() => setFavoritosAbierto(true)}
              className='bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-rose-600 hover:bg-rose-50 relative'
            >
              <Heart size={24} className={favoritos.length > 0 ? 'fill-current' : ''} />
              {favoritos.length > 0 && (
                <span className='absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {favoritos.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setCarritoAbierto(true)}
              className='bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-rose-600 hover:bg-rose-50 relative'
            >
              <ShoppingBag size={24} />
              {carrito.length > 0 && (
                <span className='absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                  {carrito.reduce((total, item) => total + (item.cantidad || 1), 0)}
                </span>
              )}
            </button>
          </div>
          
          {/* Sección de búsqueda y filtros */}
          <div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
            <div className='flex flex-col md:flex-row gap-4 mb-4'>
              <div className='relative flex-1'>
                <Search size={18} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input 
                  type="text" 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className='bg-rose-50 rounded-full py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all' 
                  placeholder='Buscar pastel, sabor o categoría...' 
                />
                {busqueda && (
                  <button 
                    onClick={() => setBusqueda('')}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className='flex gap-2'>
                <button 
                  onClick={() => setMostrarFiltro(!mostrarFiltro)}
                  className='flex items-center gap-1 bg-rose-100 text-rose-700 px-4 py-2 rounded-full hover:bg-rose-200 transition-colors'
                >
                  <SlidersHorizontal size={16} />
                  Filtros
                  <ChevronDown size={16} className={`transform transition-transform ${mostrarFiltro ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Opciones de filtro expandibles */}
            {mostrarFiltro && (
              <div className='pt-4 border-t border-gray-100'>
                <div className='flex flex-wrap gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Ordenar por precio</label>
                    <div className='flex gap-2'>
                      <button 
                        onClick={() => setOrdenPrecio('asc')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          ordenPrecio === 'asc' 
                            ? 'bg-pink-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Menor a mayor
                      </button>
                      <button 
                        onClick={() => setOrdenPrecio('desc')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          ordenPrecio === 'desc' 
                            ? 'bg-pink-600 text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Mayor a menor
                      </button>
                      {ordenPrecio && (
                        <button 
                          onClick={() => setOrdenPrecio(null)}
                          className='px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200'
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Categorías */}
          <div className='flex flex-wrap gap-2 mb-8 overflow-x-auto py-2'>
            {categoriasMock.map((categoria) => (
              <button 
                key={categoria}
                onClick={() => setCategoriaActiva(categoria)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  categoriaActiva === categoria
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white shadow-md hover:shadow-lg'
                }`}
              >
                {categoria}   
              </button>
            ))}
          </div>
          
          {/* Resultados */}
          {pasteles.length > 0 ? (
            <>
              {/* Conteo de resultados */}
              <div className='mb-6'>
                <p className='text-gray-500'>
                  Mostrando {pasteles.length} {pasteles.length === 1 ? 'resultado' : 'resultados'}
                  {categoriaActiva !== 'Todos' && ` para "${categoriaActiva}"`}
                  {busqueda && ` con "${busqueda}"`}
                </p>
              </div>
              
              {/* Grid de productos */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {pasteles.map((pastel) => (
                  <TarjetaProducto 
                    key={pastel.id} 
                    pastel={pastel} 
                    onAgregarAlCarrito={() => handleAgregarAlCarrito(pastel)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className='text-center py-16'>
              <div className='text-rose-300 mb-4'>
                <ShoppingBag size={64} className='mx-auto' />
              </div>
              <h3 className='text-xl font-semibold text-rose-900 mb-2'>No se encontraron productos</h3>
              <p className='text-gray-500 mb-6'>
                No hay pasteles que coincidan con tu búsqueda. Intenta con otros términos o explora todas las categorías.
              </p>
              <button 
                onClick={() => {
                  setCategoriaActiva('Todos');
                  setBusqueda('');
                  setOrdenPrecio(null);
                }}
                className='bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all'
              >
                Ver todos los pasteles
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Carrito Lateral */}
      <CarritoLateral 
        isOpen={carritoAbierto} 
        setIsOpen={setCarritoAbierto} 
      />

      {/* Favoritos Lateral */}
      <FavoritosLateral
        isOpen={favoritosAbierto}
        setIsOpen={setFavoritosAbierto}
        favoritos={favoritos}
        onEliminarFavorito={eliminarFavorito}
      />

      {/* Formulario de Pago */}
      <CheckoutForm
        isOpen={checkoutAbierto}
        setIsOpen={setCheckoutAbierto}
      />

      {/* Overlay para cerrar los paneles al hacer clic fuera */}
      {(carritoAbierto || favoritosAbierto || checkoutAbierto) && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => {
            setCarritoAbierto(false);
            setFavoritosAbierto(false);
            setCheckoutAbierto(false);
          }}
        />
      )}
    </div>
  );
}