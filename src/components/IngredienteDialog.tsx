import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Ingrediente {
  id: string;
  nombre: string;
  cantidadActual: number;
  unidad: string;
  stockMinimo: number;
  proveedor: string;
}

interface IngredienteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingrediente: Ingrediente) => void;
  ingrediente: Ingrediente | null;
}

const ingredienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  cantidadActual: z.number().min(0, "La cantidad no puede ser negativa"),
  unidad: z.string().min(1, "La unidad es requerida"),
  stockMinimo: z.number().min(0, "El stock mínimo no puede ser negativo"),
  proveedor: z.string().min(1, "El proveedor es requerido"),
});

type IngredienteFormData = z.infer<typeof ingredienteSchema>;

const IngredienteDialog: React.FC<IngredienteDialogProps> = ({
  isOpen, 
  onClose, 
  onSave, 
  ingrediente
}) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors }
  } = useForm<IngredienteFormData>({
    resolver: zodResolver(ingredienteSchema),
    defaultValues: {
      nombre: '',
      cantidadActual: 0,
      unidad: '',
      stockMinimo: 0,
      proveedor: '',
    },
  });

  useEffect(() => {
    if (ingrediente) {
      reset({
        nombre: ingrediente.nombre,
        cantidadActual: ingrediente.cantidadActual,
        unidad: ingrediente.unidad,
        stockMinimo: ingrediente.stockMinimo,
        proveedor: ingrediente.proveedor,
      });
    } else {
      reset();
    }
  }, [ingrediente, reset]);

  const onSubmit = handleSubmit((data) => {
    if (ingrediente) {
      onSave({ ...ingrediente, ...data });
    }
    onClose();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{ingrediente ? 'Editar Ingrediente' : 'Agregar Ingrediente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input 
                id="nombre" 
                {...register('nombre')} 
                className="col-span-3"
                disabled={ingrediente !== null} // No permitir cambiar nombre en edición
              />
              {errors.nombre && <span className="text-red-500 text-sm col-span-4 col-start-2">{errors.nombre.message}</span>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cantidadActual" className="text-right">Cantidad Actual</Label>
              <Input 
                id="cantidadActual" 
                type="number" 
                {...register('cantidadActual', { valueAsNumber: true })} 
                className="col-span-3"
              />
              {errors.cantidadActual && <span className="text-red-500 text-sm col-span-4 col-start-2">{errors.cantidadActual.message}</span>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unidad" className="text-right">Unidad</Label>
              <Input 
                id="unidad" 
                {...register('unidad')} 
                className="col-span-3"
              />
               {errors.unidad && <span className="text-red-500 text-sm col-span-4 col-start-2">{errors.unidad.message}</span>}
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stockMinimo" className="text-right">Stock Mínimo</Label>
              <Input 
                id="stockMinimo" 
                type="number" 
                {...register('stockMinimo', { valueAsNumber: true })} 
                className="col-span-3"
              />
               {errors.stockMinimo && <span className="text-red-500 text-sm col-span-4 col-start-2">{errors.stockMinimo.message}</span>}
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="proveedor" className="text-right">Proveedor</Label>
              <Input 
                id="proveedor" 
                {...register('proveedor')} 
                className="col-span-3"
              />
               {errors.proveedor && <span className="text-red-500 text-sm col-span-4 col-start-2">{errors.proveedor.message}</span>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredienteDialog; 