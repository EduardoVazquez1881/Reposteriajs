import { Decimal } from '@prisma/client/runtime/library';

export interface Pastel {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  destacado: boolean;
  etiquetas: string[];
  calificacion: number;
  cantidad?: number;
  stock?: number;              
  disponible?: boolean;     
  fecha_creacion?: string;    
  deleted?: boolean;          
}