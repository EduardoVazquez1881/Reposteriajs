import { NextResponse } from 'next/server';

// Datos de ejemplo para productos (esto debería venir de tu base de datos)
const productos = [
  {
    id: "1",
    nombre: "Pastel de Chocolate",
    descripcion: "Delicioso pastel de chocolate con cobertura",
    tipo: "pastel",
    precio: 350,
    stock: 10,
    unidad: "unidad",
    disponible: true,
    imagen: "/images/pastel-chocolate.jpg",
    destacado: true,
    etiquetas: ["chocolate", "tradicional"]
  },
  {
    id: "2",
    nombre: "Pastel de Vainilla",
    descripcion: "Suave pastel de vainilla con relleno de frutas",
    tipo: "pastel",
    precio: 320,
    stock: 8,
    unidad: "unidad",
    disponible: true,
    imagen: "/images/pastel-vainilla.jpg",
    destacado: false,
    etiquetas: ["vainilla", "frutas"]
  },
  {
    id: "3",
    nombre: "Harina de Trigo",
    descripcion: "Harina de trigo para repostería",
    tipo: "materia_prima",
    precio: 45,
    stock: 50,
    unidad: "kg",
    disponible: true
  }
];

// GET /api/productos
export async function GET() {
  try {
    // Aquí normalmente harías una consulta a tu base de datos
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

// POST /api/productos
export async function POST(request: Request) {
  try {
    const nuevoProducto = await request.json();
    
    // Aquí normalmente validarías y guardarías en la base de datos
    const productoConId = {
      ...nuevoProducto,
      id: Date.now().toString(), // Generar un ID temporal
    };
    
    productos.push(productoConId);
    
    return NextResponse.json(productoConId, { status: 201 });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    );
  }
}

// PUT /api/productos/[id]
export async function PUT(request: Request) {
  try {
    const productoActualizado = await request.json();
    const { id } = productoActualizado;
    
    // Aquí normalmente actualizarías en la base de datos
    const index = productos.findIndex(p => p.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    
    productos[index] = productoActualizado;
    
    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
} 