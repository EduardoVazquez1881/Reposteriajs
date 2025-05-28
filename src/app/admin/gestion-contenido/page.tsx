"use client"
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/form/sidebar';
import { Plus, Edit, Trash2, Tag, Layers, ListTree, Cake } from 'lucide-react';
import Image from 'next/image';
import { Categoria, Subcategoria, Etiqueta, Pastel } from '@/services/contentService';
import { toast } from 'sonner';
import { Prisma } from '@prisma/client';

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('categories');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [currentItem, setCurrentItem] = useState<ModalItem | null>(null);

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategoria[]>([]);
  
  const [tags, setTags] = useState<Etiqueta[]>([]);
  const [pasteles, setPasteles] = useState<Pastel[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [categoriasRes, subcategoriasRes, etiquetasRes, pastelesRes] = await Promise.all([
        fetch('/api/content?type=categories'),
        fetch('/api/content?type=subcategories'),
        fetch('/api/content?type=tags'),
        fetch('/api/content?type=pasteles')
      ]);

      if (!categoriasRes.ok || !subcategoriasRes.ok || !etiquetasRes.ok || !pastelesRes.ok) {
        throw new Error('Error al cargar los datos');
      }

      const [categoriasData, subcategoriasData, etiquetasData, pastelesData] = await Promise.all([
        categoriasRes.json(),
        subcategoriasRes.json(),
        etiquetasRes.json(),
        pastelesRes.json()
      ]);

      setCategories(categoriasData);
      setSubcategories(subcategoriasData);
      setTags(etiquetasData);
      setPasteles(pastelesData);
    } catch (error) {
      console.error('Error al cargar los datos:', error);
      toast.error('Error al cargar los datos');
    }
  };

  type ModalItem = Categoria | Subcategoria | Etiqueta | Pastel | { [key: string]: unknown };

  const handleOpenModal = (
    type: 'create' | 'edit',
    item?: ModalItem
  ) => {
    setModalType(type);
    setCurrentItem(item ? {...item} : {
      etiquetas: []
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, type: 'category' | 'subcategory' | 'tag' | 'pastel') => {
    try {
      const res = await fetch(`/api/content?type=${type}s&id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Error al eliminar');
      }

      switch(type) {
        case 'category':
          setCategories(categories.filter(cat => cat.id !== id));
          break;
        case 'subcategory':
          setSubcategories(subcategories.filter(subcat => subcat.id !== id));
          break;
        case 'tag':
          setTags(tags.filter(tag => tag.id !== id));
          break;
        case 'pastel':
          setPasteles(pasteles.filter(pastel => pastel.id !== id));
          break;
      }
      toast.success('Elemento eliminado con éxito');
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const type = activeTab === 'categories' ? 'categories' :
                  activeTab === 'subcategories' ? 'subcategories' :
                  activeTab === 'tags' ? 'tags' : 'pasteles';

      // Preparar los datos para enviar
      const dataToSend = { ...currentItem };
      
      // Convertir Prisma.Decimal a string para la serialización
      if (activeTab === 'subcategories' && 'precio_adicional' in dataToSend) {
        dataToSend.precio_adicional = dataToSend.precio_adicional?.toString();
      }
      
      if (activeTab === 'pasteles' && 'precio' in dataToSend) {
        dataToSend.precio = dataToSend.precio?.toString();
      }

      const method = modalType === 'create' ? 'POST' : 'PUT';
      const res = await fetch(`/api/content?type=${type}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      const data = await res.json();

      if (modalType === 'create') {
        if (activeTab === 'categories') {
          setCategories([...categories, data]);
        } else if (activeTab === 'subcategories') {
          setSubcategories([...subcategories, data]);
        } else if (activeTab === 'tags') {
          setTags([...tags, data]);
        } else if (activeTab === 'pasteles') {
          setPasteles([...pasteles, data]);
        }
        toast.success(`${activeTab === 'categories' ? 'Categoría' : 
                      activeTab === 'subcategories' ? 'Subcategoría' : 
                      activeTab === 'tags' ? 'Etiqueta' : 'Pastel'} creado con éxito`);
      } else {
        if (activeTab === 'categories') {
          setCategories(categories.map(item => item.id === data.id ? data : item));
        } else if (activeTab === 'subcategories') {
          setSubcategories(subcategories.map(item => item.id === data.id ? data : item));
        } else if (activeTab === 'tags') {
          setTags(tags.map(item => item.id === data.id ? data : item));
        } else if (activeTab === 'pasteles') {
          setPasteles(pasteles.map(item => item.id === data.id ? data : item));
        }
        toast.success(`${activeTab === 'categories' ? 'Categoría' : 
                      activeTab === 'subcategories' ? 'Subcategoría' : 
                      activeTab === 'tags' ? 'Etiqueta' : 'Pastel'} actualizado con éxito`);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar los cambios');
    }
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  };

  const getTagNames = (tagIds: number[]) => {
    return tagIds.map(id => {
      const tag = tags.find(t => t.id === id);
      return tag ? tag.nombre : '';
    }).filter(name => name !== '');
  };

  const formatPrice = (price: Prisma.Decimal | null | undefined): string => {
    if (!price) return '0.00';
    try {
      return Number(price).toFixed(2);
    } catch (error) {
      console.error('Error al formatear precio:', error);
      return '0.00';
    }
  };

  return (
    <div className='flex min-h-screen bg-rose-50'>
      <Sidebar />
      <div className='flex-1 h-52'>
        <div className='mx-auto p-4 '>
        <div className="">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-6 rounded-t-2xl">
          <h1 className="text-2xl font-bold">Gestión de Contenido</h1>
        </div>
        
        {/* Pestañas */}
        <div className="bg-white border-b border-gray-200 rounded-b-xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-500 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers size={16} />
                  <span>Categorías</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('subcategories')}
                className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'subcategories'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-500 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ListTree size={16} />
                  <span>Subcategorías</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('tags')}
                className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'tags'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-500 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span>Etiquetas</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('pasteles')}
                className={`px-4 py-4 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'pasteles'
                    ? 'text-rose-600 border-b-2 border-rose-600'
                    : 'text-gray-500 hover:text-rose-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Cake size={16} />
                  <span>Pasteles</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Botón de agregar */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">
                {activeTab === 'categories' ? 'Categorías' : 
                 activeTab === 'subcategories' ? 'Subcategorías' : 
                 activeTab === 'tags' ? 'Etiquetas' : 'Pasteles'}
              </h2>
              <button
                onClick={() => handleOpenModal('create')}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
              >
                <Plus size={16} />
                Agregar {activeTab === 'categories' ? 'Categoría' : 
                        activeTab === 'subcategories' ? 'Subcategoría' : 
                        activeTab === 'tags' ? 'Etiqueta' : 'Pastel'}
              </button>
            </div>
            
            {/* Tablas */}
            {activeTab === 'categories' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{category.nombre}</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{category.descripcion || 'Sin descripción'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border border-gray-300" 
                              style={{ backgroundColor: category.color || '#f472b6' }}
                            />
                            <span className="text-xs text-gray-500">{category.color || '#f472b6'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal('edit', category)}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(category.id, 'category')}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No hay categorías disponibles. Haga clic en &quot;Agregar Categoría&quot; para crear una nueva.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'subcategories' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subcategories.map((subcat) => (
                      <tr key={subcat.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{subcat.nombre || 'Sin nombre'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {categories.find(c => c.id === subcat.fk_categoria)?.nombre || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{subcat.detalles || 'Sin detalles'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">${formatPrice(subcat.precio_adicional)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal('edit', subcat)}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(subcat.id, 'subcategory')}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {subcategories.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No hay subcategorías disponibles. Haga clic en &quot;Agregar Subcategoría&quot; para crear una nueva.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'tags' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tags.map((tag) => (
                      <tr key={tag.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{tag.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded-full border border-gray-300" 
                              style={{ backgroundColor: tag.color || '#f472b6' }}
                            />
                            <span className="text-xs text-gray-500">{tag.color || '#f472b6'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal('edit', tag)}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(tag.id, 'tag')}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {tags.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                          No hay etiquetas disponibles. Haga clic en &quot;Agregar Etiqueta&quot; para crear una nueva.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeTab === 'pasteles' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etiquetas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destacado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pasteles.map((pastel) => (
                      <tr key={pastel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{pastel.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">${formatPrice(pastel.precio)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {pastel.etiquetas && getTagNames(pastel.etiquetas).map((tagName, index) => (
                              <span 
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {tagName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{pastel.stock || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                            pastel.destacado ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pastel.destacado ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                            pastel.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pastel.disponible ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                          {formatDate(pastel.fecha_creacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal('edit', pastel)}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              onClick={() => handleDelete(pastel.id, 'pastel')}
                              className="flex items-center gap-1 text-sm px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {pasteles.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          No hay pasteles disponibles. Haga clic en &quot;Agregar Pastel&quot; para crear uno nuevo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50">
            <div className={`bg-white rounded-lg shadow-xl mx-4 my-8 ${
              activeTab === 'pasteles' ? 'w-full max-w-4xl' : 'w-full max-w-lg'
            }`}>
              <div className="p-6 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">
                  {modalType === 'create' 
                    ? `Agregar ${activeTab === 'categories' ? 'Categoría' : activeTab === 'subcategories' ? 'Subcategoría' : activeTab === 'tags' ? 'Etiqueta' : 'Pastel'}`
                    : `Editar ${activeTab === 'categories' ? 'Categoría' : activeTab === 'subcategories' ? 'Subcategoría' : activeTab === 'tags' ? 'Etiqueta' : 'Pastel'}`}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className={`space-y-4 ${activeTab === 'pasteles' ? 'grid grid-cols-2 gap-4' : ''}`}>
                    <div className={activeTab === 'pasteles' ? 'col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={currentItem?.nombre !== undefined ? String(currentItem.nombre) : ''}
                        onChange={(e) => setCurrentItem({...currentItem, nombre: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                    </div>
                    
                    {(activeTab === 'categories' || activeTab === 'pasteles') && (
                      <div className={activeTab === 'pasteles' ? 'col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <textarea
                          value={'descripcion' in (currentItem ?? {}) ? String((currentItem as Categoria | Pastel).descripcion ?? '') : ''}
                          onChange={(e) => setCurrentItem({...currentItem, descripcion: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                          rows={3}
                        />
                      </div>
                    )}
                    
                    {activeTab === 'subcategories' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Detalles</label>
                          <textarea
                            value={'detalles' in (currentItem ?? {}) ? String((currentItem as Subcategoria).detalles ?? '') : ''}
                            onChange={(e) => setCurrentItem({...currentItem, detalles: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                            rows={2}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                          <select
                            value={activeTab === 'subcategories' && currentItem && 'fk_categoria' in currentItem ? String(currentItem.fk_categoria ?? '') : ''}
                            onChange={(e) => setCurrentItem({
                              ...currentItem, 
                              fk_categoria: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                            required
                          >
                            <option value="">Seleccione una categoría</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">Precio Adicional</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentItem && 'precio_adicional' in currentItem ? 
                              Number((currentItem as Subcategoria).precio_adicional) : ''}
                            onChange={(e) => {
                              if (currentItem && 'precio_adicional' in currentItem) {
                                const value = e.target.value ? new Prisma.Decimal(e.target.value) : null;
                                setCurrentItem({ ...currentItem, precio_adicional: value });
                              }
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </>
                    )}
                    
                    {activeTab === 'pasteles' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                            <input
                              type="number"
                              value={('precio' in (currentItem ?? {})) ? 
                                (currentItem as Pastel).precio?.toString() ?? '0' : '0'}
                              onChange={(e) => setCurrentItem({
                                ...currentItem, 
                                precio: new Prisma.Decimal(e.target.value || '0')
                              })}
                              className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                              step="0.01"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                          <input
                            type="number"
                            value={('stock' in (currentItem ?? {})) ? Number((currentItem as Pastel).stock ?? 0) : 0}
                            onChange={(e) => setCurrentItem({
                              ...currentItem, 
                              stock: parseInt(e.target.value)
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                            min="0"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
                          <select
                            multiple
                            value={activeTab === 'pasteles' && currentItem && 'etiquetas' in currentItem ? (currentItem.etiquetas as number[]).map(String) : []}
                            onChange={(e) => {
                              const options = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                              setCurrentItem({
                                ...currentItem,
                                etiquetas: options
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 h-32"
                          >
                            {tags.map(tag => (
                              <option key={tag.id} value={tag.id} className="py-1">
                                {tag.nombre}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">Mantén presionado Ctrl (Windows) o Command (Mac) para seleccionar múltiples opciones.</p>
                        </div>
                        
                        <div className="col-span-2 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="destacado"
                              checked={('destacado' in (currentItem ?? {})) ? Boolean((currentItem as Pastel).destacado) : false}
                              onChange={(e) => setCurrentItem({
                                ...currentItem,
                                destacado: e.target.checked
                              })}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <label htmlFor="destacado" className="ml-2 block text-sm text-gray-700">
                              Destacado
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="disponible"
                              checked={activeTab === 'pasteles' && currentItem && 'disponible' in currentItem ? Boolean(currentItem.disponible) : false}
                              onChange={(e) => setCurrentItem({
                                ...currentItem,
                                ...(activeTab === 'pasteles' ? { disponible: e.target.checked } : {})
                              })}
                              className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                            />
                            <label htmlFor="disponible" className="ml-2 block text-sm text-gray-700">
                              Disponible
                            </label>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={('imagen' in (currentItem ?? {})) ? String((currentItem as Pastel).imagen ?? '') : ''}
                              onChange={(e) => setCurrentItem({...currentItem, imagen: e.target.value})}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            {('imagen' in (currentItem ?? {})) && (currentItem as Pastel).imagen && (
                              <div className="w-24 h-24 border border-gray-300 rounded-md overflow-hidden">
                                <Image 
                                  src={(currentItem as Pastel).imagen || '/placeholder.jpg'} 
                                  alt={(currentItem as Pastel).nombre}
                                  width={100}
                                  height={100}
                                  className="object-cover rounded"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Ingresa una URL de imagen válida (https://...)
                          </p>
                        </div>
                      </>
                    )}
                    
                    {(activeTab === 'categories' || activeTab === 'subcategories' || activeTab === 'tags') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={currentItem && 'color' in currentItem ? currentItem.color as string : '#f472b6'}
                            onChange={(e) => setCurrentItem({...currentItem, color: e.target.value})}
                            className="w-10 h-10 rounded-md border border-gray-300"
                          />
                          <input
                            type="text"
                            value={currentItem && 'color' in currentItem ? currentItem.color as string : '#f472b6'}
                            onChange={(e) => setCurrentItem({...currentItem, color: e.target.value})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
                            pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                            placeholder="#f472b6"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      {modalType === 'create' ? 'Crear' : 'Guardar cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

        </div>

      </div>
      
    </div>
  );
}