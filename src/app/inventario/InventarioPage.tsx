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
import { Package, AlertTriangle, Plus, Search, Pencil, ChefHat, ShoppingCart } from "lucide-react";
import { ProductoDialog } from "@/components/form/ProductoDialog";
import { useSearchParams } from "next/navigation";
import IngredienteDialog from '@/components/IngredienteDialog';

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  precio: number;
  stock: number;
  unidad: string;
  imagen?: string;
  destacado: boolean;
  disponible: boolean;
}

interface Ingrediente {
  id: string;
  nombre: string;
  cantidadActual: number;
  unidad: string;
  stockMinimo: number;
  proveedor: string;
}

interface PedidoPersonalizado {
  id: string;
  clienteId: string;
  descripcion: string;
  fechaEntrega: Date;
  estado: string;
  precio: number;
  productos: Producto[];
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
  const [pedidos, setPedidos] = useState<PedidoPersonalizado[]>([]);
  // const [loading, setLoading] = useState(true);
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
      // Aquí irían las llamadas a la API para cargar los datos
      // Por ahora usaremos datos de ejemplo
      setProductos([
        {
          id: "1",
          nombre: "Pastel de Chocolate",
          descripcion: "Delicioso pastel de chocolate con cobertura",
          tipo: "pastel",
          stock: 5,
          unidad: "unidad",
          precio: 450.00,
          imagen: "/pastel-chocolate.jpg",
          destacado: true,
          disponible: true
        },
        {
          id: "2",
          nombre: "Harina",
          descripcion: "Harina de trigo para repostería",
          tipo: "materia_prima",
          stock: 10,
          unidad: "kg",
          precio: 45.00,
          imagen: "/harina.jpg",
          destacado: false,
          disponible: true
        }
      ]);

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

      setPedidos([
        {
          id: "1",
          clienteId: "cliente1",
          descripcion: "Pastel de cumpleaños con temática de superhéroes",
          fechaEntrega: new Date("2024-03-20"),
          estado: "pendiente",
          precio: 1200.00,
          productos: [
            {
              id: "1",
              nombre: "Pastel de Chocolate",
              descripcion: "Delicioso pastel de chocolate con cobertura",
              tipo: "pastel",
              stock: 1,
              unidad: "unidad",
              precio: 450.00,
              destacado: true,
              disponible: true
            }
          ]
        }
      ]);

      // setLoading(false);
    } catch {
      setError("Error al cargar los datos");
      // setLoading(false);
    }
  };
  const handleCreateProducto = async (data: Producto) => {
    try {
      // Aquí iría la llamada a la API para crear el producto
      console.log("Crear producto:", data);
      // Por ahora solo actualizamos el estado local
      setProductos([...productos, data]);
      setDialogOpen(false);
    } catch {
      setError("Error al crear el producto");
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

  const handleSaveProducto = (producto: Producto) => {
    if (selectedProducto) {
      // Editar producto existente
      setProductos(productos.map(p => p.id === producto.id ? producto : p));
    } else {
      // Crear nuevo producto
      handleCreateProducto(producto);
    }
    handleCloseDialog();
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
    // Lógica para guardar el ingrediente (reemplazar con llamada a API)
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

  const filteredPedidos = pedidos.filter(pedido => 
    pedido.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
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
            <TabsTrigger value="pedidos">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Pedidos Personalizados
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

          <TabsContent value="pedidos" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar pedidos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Pedido
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Pedidos Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Fecha Entrega</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Productos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPedidos.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell>{pedido.descripcion}</TableCell>
                        <TableCell>{pedido.fechaEntrega.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            pedido.estado === 'pendiente' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : pedido.estado === 'en_proceso'
                              ? 'bg-blue-100 text-blue-800'
                              : pedido.estado === 'completado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>${pedido.precio}</TableCell>
                        <TableCell>
                          <ul className="list-disc list-inside">
                            {pedido.productos.map(producto => (
                              <li key={producto.id}>{producto.nombre}</li>
                            ))}
                          </ul>
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