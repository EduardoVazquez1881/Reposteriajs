"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/form/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Package, AlertTriangle, Plus, Search, Pencil, ChefHat } from "lucide-react";
import { ProductoDialog } from "@/components/form/ProductoDialog";
import { useSearchParams } from "next/navigation";
import IngredienteDialog from '@/components/IngredienteDialog';
import { productoService, Producto } from '@/services/productoService';
import { toast } from 'sonner';

interface Ingrediente {
  id: string;
  nombre: string;
  cantidadActual: number;
  unidad: string;
  stockMinimo: number;
  proveedor: string;
}

export default function InventarioPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("productos");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [selectedIngrediente, setSelectedIngrediente] = useState<Ingrediente | null>(null);
  const [isIngredienteDialogOpen, setIsIngredienteDialogOpen] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const productosCargados = await productoService.getProductos();
      setProductos(productosCargados);

      setIngredientes([
        {
          id: "1",
          nombre: "Harina de trigo",
          cantidadActual: 50,
          unidad: "kg",
          stockMinimo: 10,
          proveedor: "Distribuidora de Harinas S.A."
        },
        {
          id: "2",
          nombre: "Azúcar refinada",
          cantidadActual: 30,
          unidad: "kg",
          stockMinimo: 5,
          proveedor: "Azúcar del Norte"
        },
        {
          id: "3",
          nombre: "Huevos",
          cantidadActual: 200,
          unidad: "unidad",
          stockMinimo: 50,
          proveedor: "Granja Los Pinos"
        },
        {
          id: "4",
          nombre: "Mantequilla",
          cantidadActual: 20,
          unidad: "kg",
          stockMinimo: 5,
          proveedor: "Lácteos del Valle"
        },
        {
          id: "5",
          nombre: "Chocolate para repostería",
          cantidadActual: 15,
          unidad: "kg",
          stockMinimo: 3,
          proveedor: "Chocolates Selectos"
        }
      ]);

    } catch {
      setError("Error al cargar los datos");
    }
  };

  const handleOpenDialog = (producto: Producto | null = null) => {
    setSelectedProducto(producto);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedProducto(null);
    setDialogOpen(false);
  };

  const handleSaveProducto = async (producto: Producto) => {
    try {
      if (selectedProducto) {
        await productoService.updateProducto(producto);
        toast.success('Producto actualizado con éxito');
      } else {
        const productoParaCrear = { ...producto };
        delete (productoParaCrear as Partial<Producto>).id;
        await productoService.createProducto(productoParaCrear as Omit<Producto, 'id'>);
        toast.success('Producto creado con éxito');
      }
      await cargarDatos();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleEditIngrediente = (ingrediente: Ingrediente) => {
    setSelectedIngrediente(ingrediente);
    setIsIngredienteDialogOpen(true);
  };

  const handleCloseIngredienteDialog = () => {
    setSelectedIngrediente(null);
    setIsIngredienteDialogOpen(false);
  };

  const handleSaveIngrediente = (ingrediente: Ingrediente) => {
    setIngredientes(ingredientes.map(i => i.id === ingrediente.id ? ingrediente : i));
    handleCloseIngredienteDialog();
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "todos" || producto.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const filteredIngredientes = ingredientes.filter(ingrediente => 
    ingrediente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-rose-900 mb-6">Sistema de Inventario</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="productos">
              <Package className="w-4 h-4 mr-2" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="ingredientes">
              <ChefHat className="w-4 h-4 mr-2" />
              Ingredientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar productos..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pastel">Pasteles</SelectItem>
                    <SelectItem value="materia_prima">Materias Primas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProductos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell>{producto.tipo === "pastel" ? "Pastel" : "Materia Prima"}</TableCell>
                        <TableCell>{producto.stock}</TableCell>
                        <TableCell>{producto.unidad}</TableCell>
                        <TableCell>${producto.precio}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            producto.disponible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {producto.disponible ? 'Disponible' : 'No disponible'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenDialog(producto)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredientes" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar ingredientes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Ingrediente
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Ingredientes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Stock Mínimo</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredientes.map((ingrediente) => (
                      <TableRow key={ingrediente.id}>
                        <TableCell>{ingrediente.nombre}</TableCell>
                        <TableCell>{ingrediente.cantidadActual}</TableCell>
                        <TableCell>{ingrediente.unidad}</TableCell>
                        <TableCell>{ingrediente.stockMinimo}</TableCell>
                        <TableCell>{ingrediente.proveedor}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ingrediente.cantidadActual >= ingrediente.stockMinimo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {ingrediente.cantidadActual >= ingrediente.stockMinimo ? 'Suficiente' : 'Bajo Stock'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditIngrediente(ingrediente)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ProductoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          producto={selectedProducto}
          onSubmit={handleSaveProducto}
        />

        <IngredienteDialog
          isOpen={isIngredienteDialogOpen}
          onClose={handleCloseIngredienteDialog}
          onSave={handleSaveIngrediente}
          ingrediente={selectedIngrediente}
        />
      </div>
    </div>
  );
} 