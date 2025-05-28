export interface Pastel {
  id: string;
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
  tipo?: string;
  unidad?: string;
}

export type Favorito = Pastel;