import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Producto } from "@/services/productoService"

interface ProductoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto | null
  onSubmit: (data: Producto) => void
}

export function ProductoDialog({ open, onOpenChange, producto, onSubmit }: ProductoDialogProps) {
  const [formData, setFormData] = React.useState({
    nombre: "",
    descripcion: "",
    tipo: "pastel",
    precio: "",
    stock: "",
    unidad: "unidad",
    imagen: "",
    destacado: false,
    disponible: true
  })

  React.useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        tipo: producto.tipo,
        precio: producto.precio.toString(),
        stock: producto.stock.toString(),
        unidad: producto.unidad || "unidad",
        imagen: producto.imagen || "",
        destacado: producto.destacado || false,
        disponible: producto.disponible || true
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        tipo: "pastel",
        precio: "",
        stock: "",
        unidad: "unidad",
        imagen: "",
        destacado: false,
        disponible: true
      })
    }
  }, [producto])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data: Producto = {
      id: producto?.id || Date.now().toString(),
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      unidad: formData.unidad,
      imagen: formData.imagen || undefined,
      destacado: formData.destacado,
      disponible: formData.disponible
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pastel">Pastel</SelectItem>
                <SelectItem value="materia_prima">Materia Prima</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unidad">Unidad</Label>
            <Select
              value={formData.unidad}
              onValueChange={(value) => setFormData({ ...formData, unidad: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar unidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unidad">Unidad</SelectItem>
                <SelectItem value="kg">Kilogramo</SelectItem>
                <SelectItem value="ml">Mililitro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imagen">URL de la imagen</Label>
            <Input
              id="imagen"
              value={formData.imagen}
              onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="destacado"
              checked={formData.destacado}
              onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="destacado">Destacado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="disponible">Disponible</Label>
          </div>
          <DialogFooter>
            <Button type="submit">{producto ? "Guardar cambios" : "Crear producto"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 