"use client"
import React, { useState, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/form/sidebar';
import {
  Cake,
  Palette,
  Sandwich,
  Upload,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { pedidoService } from '@/services/pedidoService';
import { toast } from 'sonner';

// Definición de tipos e interfaces
type CakeSize = 'small' | 'medium' | 'large';
type CakeType = 'vanilla' | 'chocolate' | 'redvelvet' | 'carrot';
type FillingType = 'chocolate' | 'strawberry' | 'dulcedeleche' | 'bavarian';
type FrostingType = 'buttercream' | 'chocolate' | 'vanilla' | 'cream';
type DietaryRestriction = 'gluten-free' | 'dairy-free' | 'sugar-free' | 'vegan';

interface CakeOption {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  color?: string;
}

interface Step {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface PedidoPersonalizado {
  id: number;
  estado: string;
  fecha: string | null;
  direccion: string | null;
  total: number;
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
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const App: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<CakeSize | null>(null);
  const [selectedLayers, setSelectedLayers] = useState<number>(1);
  const [selectedCake, setSelectedCake] = useState<CakeType | null>(null);
  const [selectedFilling, setSelectedFilling] = useState<FillingType | null>(null);
  const [selectedFrosting, setSelectedFrosting] = useState<FrostingType | null>(null);
  const [restrictions, setRestrictions] = useState<DietaryRestriction[]>([]);
  const [customImage, setCustomImage] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [pedidoEnviado, setPedidoEnviado] = useState<PedidoPersonalizado | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Datos con tipado correcto
  const sizes: CakeOption[] = [
    { id: 'small', name: 'Pequeño', desc: '10-12 personas', price: 350 },
    { id: 'medium', name: 'Mediano', desc: '15-20 personas', price: 500 },
    { id: 'large', name: 'Grande', desc: '25-30 personas', price: 750 },
  ];

  const cakeTypes: CakeOption[] = [
    { id: 'vanilla', name: 'Vainilla', color: 'bg-amber-50' },
    { id: 'chocolate', name: 'Chocolate', color: 'bg-amber-900' },
    { id: 'redvelvet', name: 'Red Velvet', color: 'bg-red-600' },
    { id: 'carrot', name: 'Zanahoria', color: 'bg-orange-400' },
  ];

  const fillings: CakeOption[] = [
    { id: 'chocolate', name: 'Ganache de Chocolate', color: 'bg-amber-900' },
    { id: 'strawberry', name: 'Mermelada de Fresa', color: 'bg-red-400' },
    { id: 'dulcedeleche', name: 'Dulce de Leche', color: 'bg-amber-600' },
    { id: 'bavarian', name: 'Crema Bavaresa', color: 'bg-yellow-50' },
  ];

  const frostings: CakeOption[] = [
    { id: 'buttercream', name: 'Buttercream', color: 'bg-amber-100' },
    { id: 'chocolate', name: 'Chocolate', color: 'bg-amber-800' },
    { id: 'vanilla', name: 'Vainilla', color: 'bg-yellow-50' },
    { id: 'cream', name: 'Crema Batida', color: 'bg-gray-50' },
  ];

  const dietaryRestrictions: CakeOption[] = [
    { id: 'gluten-free', name: 'Sin Gluten' },
    { id: 'dairy-free', name: 'Sin Lácteos' },
    { id: 'sugar-free', name: 'Sin Azúcar' },
    { id: 'vegan', name: 'Vegano' },
  ];

  const steps: Step[] = [
    { title: 'Tamaño y Pisos', icon: Cake },
    { title: 'Sabores', icon: Sandwich },
    { title: 'Decoración', icon: Palette },
    { title: 'Restricciones', icon: AlertOctagon },
  ];

  // Handlers con tipado adecuado
  const toggleRestriction = (restrictionId: DietaryRestriction): void => {
    setRestrictions(prev =>
      prev.includes(restrictionId)
        ? prev.filter(id => id !== restrictionId)
        : [...prev, restrictionId]
    );
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      setCustomImage(e.target.files[0]);
    }
  };

  const nextStep = (): void => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = (): void => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return selectedSize !== null;
      case 1:
        return selectedCake !== null && selectedFilling !== null;
      case 2:
        return selectedFrosting !== null;
      default:
        return true;
    }
  };

  // Función para calcular el precio total
  const calcularPrecioTotal = (): number => {
    let precio = 0;
    
    // Precio base según tamaño
    const sizeOption = sizes.find(s => s.id === selectedSize);
    if (sizeOption?.price) {
      precio += sizeOption.price;
    }

    // Precio adicional por pisos
    precio += (selectedLayers - 1) * 200;

    // Precios adicionales por tipo de pastel, relleno y frosting
    if (selectedCake === 'redvelvet') precio += 50;
    if (selectedFilling === 'dulcedeleche') precio += 30;
    if (selectedFrosting === 'buttercream') precio += 40;

    return precio;
  };

  const submitOrder = async (): Promise<void> => {
    try {
      // Validar que el usuario esté autenticado
      if (!session?.user?.id) {
        toast.error('Debes iniciar sesión para realizar un pedido');
        return;
      }

      // Validar que todos los campos necesarios estén seleccionados
      if (!selectedSize || !selectedCake || !selectedFilling || !selectedFrosting) {
        toast.error('Por favor, completa todos los campos requeridos');
        return;
      }

      const pedidoData = {
        fk_usuario: parseInt(session.user.id),
        total: calcularPrecioTotal(),
        direccion: 'Dirección por confirmar',
        notas: `Pastel personalizado: ${selectedSize} ${selectedLayers} pisos, ${selectedCake} con ${selectedFilling}, ${selectedFrosting}. Restricciones: ${restrictions.join(', ') || 'Ninguna'}`,
        carrito_items: [],
        carrito_personalizado: [{
          id: 1, // ID temporal para el carrito personalizado
          cantidad: 1,
          precio_unitario: calcularPrecioTotal(),
          imagen_referencia: customImage ? URL.createObjectURL(customImage) : undefined
        }]
      };
      const response = await pedidoService.createPedido(pedidoData);
      if (!response) throw new Error('No se recibió respuesta del servidor');
      setPedidoEnviado(response);
      toast.success('¡Pedido personalizado realizado con éxito!');
      router.push(`/personalized/estado/${response.id}`);
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      console.error('Error al crear el pedido:', err);
      
      if (err.response?.status === 400) {
        toast.error('Faltan datos requeridos en el pedido');
      } else if (err.response?.status === 401) {
        toast.error('Debes iniciar sesión para realizar un pedido');
      } else if (err.response?.status === 500) {
        toast.error('Error en el servidor. Por favor, intenta más tarde');
      } else {
        toast.error(err.message || 'Hubo un error al procesar tu pedido. Por favor, intenta nuevamente');
      }
    }
  };

  const handleCancelarPedido = async (pedidoId: number) => {
    try {
      await pedidoService.updateEstadoPedido(pedidoId, 'cancelado');
      toast.success('Pedido cancelado exitosamente');
      // Actualizar el estado local si es necesario
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      console.error('Error al cancelar pedido:', err);
      toast.error(err.message || 'Error al cancelar el pedido');
    }
  };

  const finalizarPedido = async (): Promise<void> => {
    if (pedidoEnviado) {
      try {
        // Aquí iría la lógica para finalizar el pedido en la base de datos
        setPedidoEnviado({ ...pedidoEnviado, estado: 'completado' });
        toast.success('Pedido finalizado exitosamente.');
        router.push(`/personalized/estado/${pedidoEnviado.id}`);
      } catch (error) {
        console.error('Error al finalizar el pedido:', error);
        toast.error('Hubo un error al finalizar el pedido.');
      }
    }
  };

  return (
    <div className='flex'>
      <Sidebar />
      <div className='items-center justify-center content-center flex-1/2 mx-14'>
        <div className="bg-[#fdf2f8] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent)] py-12 content-center justify-center items-center flex-1 rounded-2xl shadow-2xl">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              Personaliza tu Pastel
            </h1>
            <p className="text-center text-gray-600 mb-12">
              Crea el pastel de tus sueños paso a paso
            </p>

            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-12 relative">
              <div className="absolute h-1 bg-gray-200 top-1/2 -translate-y-1/2 left-0 right-0 z-0" />
              <div 
                className="absolute h-1 bg-pink-500 top-1/2 -translate-y-1/2 left-0 z-0 transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className={`relative flex flex-col items-center gap-2 ${
                      index <= currentStep ? 'text-pink-500' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-pink-500 text-white'
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium hidden md:block">{step.title}</span>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300">
              {currentStep === 0 && (
                <div className="space-y-8">
                  {/* Tamaño */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Selecciona el Tamaño</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {sizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size.id as CakeSize)}
                          className={`group relative p-6 rounded-2xl transition-all duration-300 ${
                            selectedSize === size.id
                              ? 'bg-pink-50 border-2 border-pink-500'
                              : 'bg-gray-50 hover:bg-pink-50/50 border-2 border-transparent'
                          }`}
                        >
                          <h3 className="text-xl font-semibold mb-1">{size.name}</h3>
                          <p className="text-gray-600 mb-4">{size.desc}</p>
                          <p className="text-2xl font-bold text-pink-600">${size.price} MXN</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Pisos */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Número de Pisos</h2>
                    <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-2xl">
                      <button
                        onClick={() => setSelectedLayers(Math.max(1, selectedLayers - 1))}
                        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-pink-50 transition-colors"
                        aria-label="Reducir pisos"
                      >
                        -
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-gray-800">{selectedLayers}</span>
                        <span className="text-gray-600">pisos</span>
                      </div>
                      <button
                        onClick={() => setSelectedLayers(Math.min(4, selectedLayers + 1))}
                        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-pink-50 transition-colors"
                        aria-label="Aumentar pisos"
                      >
                        +
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Tipo de Pan */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Tipo de Pan</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {cakeTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedCake(type.id as CakeType)}
                          className={`p-6 rounded-2xl transition-all duration-300 ${
                            selectedCake === type.id
                              ? 'bg-pink-50 border-2 border-pink-500'
                              : 'bg-gray-50 hover:bg-pink-50/50 border-2 border-transparent'
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg ${type.color} mb-4 shadow-inner`} />
                          <p className="font-medium text-lg">{type.name}</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Relleno */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Relleno</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {fillings.map((filling) => (
                        <button
                          key={filling.id}
                          onClick={() => setSelectedFilling(filling.id as FillingType)}
                          className={`p-6 rounded-2xl transition-all duration-300 ${
                            selectedFilling === filling.id
                              ? 'bg-pink-50 border-2 border-pink-500'
                              : 'bg-gray-50 hover:bg-pink-50/50 border-2 border-transparent'
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg ${filling.color} mb-4 shadow-inner`} />
                          <p className="font-medium text-lg">{filling.name}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Betún */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Betún</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {frostings.map((frosting) => (
                        <button
                          key={frosting.id}
                          onClick={() => setSelectedFrosting(frosting.id as FrostingType)}
                          className={`p-6 rounded-2xl transition-all duration-300 ${
                            selectedFrosting === frosting.id
                              ? 'bg-pink-50 border-2 border-pink-500'
                              : 'bg-gray-50 hover:bg-pink-50/50 border-2 border-transparent'
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg ${frosting.color} mb-4 shadow-inner`} />
                          <p className="font-medium text-lg">{frosting.name}</p>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Decoración Personalizada */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Decoración Personalizada</h2>
                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                      <div className="max-w-sm mx-auto">
                        <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-6">
                          <Upload className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-gray-600 mb-6">
                          Sube una imagen de referencia para tu decoración
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="custom-decoration"
                        />
                        <label
                          htmlFor="custom-decoration"
                          className="inline-block px-8 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-colors cursor-pointer shadow-md hover:shadow-lg"
                        >
                          Seleccionar Imagen
                        </label>
                        {customImage && (
                          <p className="mt-4 text-sm text-gray-600">
                            Imagen seleccionada: {customImage.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Restricciones Alimentarias */}
                  <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Restricciones Alimentarias</h2>
                    <p className="text-gray-600">Selecciona las restricciones alimentarias que apliquen</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {dietaryRestrictions.map((restriction) => (
                        <button
                          key={restriction.id}
                          onClick={() => toggleRestriction(restriction.id as DietaryRestriction)}
                          className={`p-6 rounded-2xl transition-all duration-300 ${
                            restrictions.includes(restriction.id as DietaryRestriction)
                              ? 'bg-pink-50 border-2 border-pink-500'
                              : 'bg-gray-50 hover:bg-pink-50/50 border-2 border-transparent'
                          }`}
                        >
                          <p className="font-medium text-lg">{restriction.name}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              <div className="flex justify-between mt-12 pt-6 border-t border-gray-100">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Anterior
                  </button>
                )}
                <button
                  onClick={currentStep === steps.length - 1 ? submitOrder : nextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-8 py-3 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg ml-auto ${
                    currentStep === steps.length - 1
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  } ${!validateStep(currentStep) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {currentStep === steps.length - 1 ? 'Finalizar Pedido' : 'Siguiente'}
                </button>
              </div>
            </div>

            {/* Sección de Pedido Enviado */}
            {pedidoEnviado && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">Estado del Pedido</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${
                      pedidoEnviado.estado === 'pendiente' ? 'text-yellow-600' :
                      pedidoEnviado.estado === 'en_proceso' ? 'text-blue-600' :
                      pedidoEnviado.estado === 'completado' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {pedidoEnviado.estado.charAt(0).toUpperCase() + pedidoEnviado.estado.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Precio Total:</span>
                    <span className="font-medium text-rose-600">${pedidoEnviado.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fecha de Entrega:</span>
                    <span className="font-medium">{pedidoEnviado.fecha ? new Date(pedidoEnviado.fecha).toLocaleDateString() : 'Por definir'}</span>
                  </div>
                  {mostrarDetalles && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <h4 className="font-medium mb-2">Detalles del Pedido:</h4>
                      <p className="text-gray-600">{pedidoEnviado.descripcion}</p>
                    </div>
                  )}
                  <div className="flex gap-3 mt-6">
                    <Button
                      onClick={() => setMostrarDetalles(!mostrarDetalles)}
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      <Eye size={18} />
                      {mostrarDetalles ? 'Ocultar Detalles' : 'Ver Detalles'}
                    </Button>
                    {pedidoEnviado.estado === 'pendiente' && (
                      <>
                        <Button
                          onClick={finalizarPedido}
                          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                        >
                          <CheckCircle2 size={18} />
                          Finalizar Pedido
                        </Button>
                        <Button
                          onClick={() => handleCancelarPedido(pedidoEnviado.id)}
                          className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                        >
                          <XCircle size={18} />
                          Cancelar Pedido
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;