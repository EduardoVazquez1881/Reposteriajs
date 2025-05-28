"use client";

import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/form/sidebar';

interface Oferta {
  id: string;
  nombre: string;
  descripcion: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  tipo: 'flash' | 'categoria';
  categoria?: string;
}

export default function AdminOfertasPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [editingOferta, setEditingOferta] = useState<Oferta | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOferta?.id) {
      // Actualizar oferta existente
      setOfertas(ofertas.map(o => o.id === editingOferta.id ? editingOferta : o));
      toast.success('Oferta actualizada correctamente');
    } else {
      // Crear nueva oferta
      const nuevaOferta: Oferta = {
        id: Date.now().toString(),
        nombre: editingOferta?.nombre || '',
        descripcion: editingOferta?.descripcion || '',
        descuento: editingOferta?.descuento || 0,
        fechaInicio: editingOferta?.fechaInicio || '',
        fechaFin: editingOferta?.fechaFin || '',
        activa: true,
        tipo: editingOferta?.tipo || 'flash',
        categoria: editingOferta?.categoria
      };
      setOfertas([...ofertas, nuevaOferta]);
      toast.success('Oferta creada correctamente');
    }
    setShowForm(false);
    setEditingOferta(null);
  };

  const handleDelete = (id: string) => {
    setOfertas(ofertas.filter(o => o.id !== id));
    toast.success('Oferta eliminada correctamente');
  };

  const handleNewOferta = () => {
    setEditingOferta({
      id: '',
      nombre: '',
      descripcion: '',
      descuento: 0,
      fechaInicio: '',
      fechaFin: '',
      activa: true,
      tipo: 'flash'
    });
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen bg-rose-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-rose-900">Gestión de Ofertas y Descuentos</h1>
          <button
            onClick={handleNewOferta}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Oferta
          </button>
        </div>

        {/* Formulario de Oferta */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {editingOferta?.id ? 'Editar Oferta' : 'Nueva Oferta'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingOferta(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editingOferta?.nombre || ''}
                      onChange={(e) => setEditingOferta(prev => prev ? {...prev, nombre: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingOferta?.descuento || 0}
                      onChange={(e) => setEditingOferta(prev => prev ? {...prev, descuento: Number(e.target.value)} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={editingOferta?.descripcion || ''}
                    onChange={(e) => setEditingOferta(prev => prev ? {...prev, descripcion: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Inicio
                    </label>
                    <input
                      type="datetime-local"
                      value={editingOferta?.fechaInicio || ''}
                      onChange={(e) => setEditingOferta(prev => prev ? {...prev, fechaInicio: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Fin
                    </label>
                    <input
                      type="datetime-local"
                      value={editingOferta?.fechaFin || ''}
                      onChange={(e) => setEditingOferta(prev => prev ? {...prev, fechaFin: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Oferta
                  </label>
                  <select
                    value={editingOferta?.tipo || 'flash'}
                    onChange={(e) => setEditingOferta(prev => prev ? {...prev, tipo: e.target.value as 'flash' | 'categoria'} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="flash">Oferta Flash</option>
                    <option value="categoria">Descuento por Categoría</option>
                  </select>
                </div>

                {editingOferta?.tipo === 'categoria' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={editingOferta?.categoria || ''}
                      onChange={(e) => setEditingOferta(prev => prev ? {...prev, categoria: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar categoría</option>
                      <option value="Chocolate">Chocolate</option>
                      <option value="Frutales">Frutales</option>
                      <option value="Especiales">Especiales</option>
                      <option value="Tradicionales">Tradicionales</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingOferta(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors flex items-center gap-2"
                  >
                    <Save size={20} />
                    {editingOferta?.id ? 'Guardar Cambios' : 'Crear Oferta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Ofertas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fechas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ofertas.map((oferta) => (
                  <tr key={oferta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{oferta.nombre}</div>
                      <div className="text-sm text-gray-500">{oferta.descripcion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose-100 text-rose-800">
                        {oferta.descuento}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {oferta.tipo === 'flash' ? 'Oferta Flash' : 'Descuento por Categoría'}
                      </span>
                      {oferta.categoria && (
                        <span className="text-sm text-gray-500 block">{oferta.categoria}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Inicio: {new Date(oferta.fechaInicio).toLocaleDateString()}</div>
                      <div>Fin: {new Date(oferta.fechaFin).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        oferta.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {oferta.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingOferta(oferta);
                          setShowForm(true);
                        }}
                        className="text-rose-600 hover:text-rose-900 mr-4"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(oferta.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 