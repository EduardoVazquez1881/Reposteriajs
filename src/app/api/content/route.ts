import { NextResponse } from 'next/server';
import { contentService } from '@/services/contentService';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Tipo no especificado' }, { status: 400 });
    }

    let data;
    switch (type) {
      case 'categories':
        data = await contentService.getCategorias();
        break;
      case 'subcategories':
        data = await contentService.getSubcategorias();
        break;
      case 'tags':
        data = await contentService.getEtiquetas();
        break;
      case 'pasteles':
        data = await contentService.getPasteles();
        break;
      default:
        return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/content:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Tipo no especificado' }, { status: 400 });
    }

    let data;
    switch (type) {
      case 'categories':
        if (!body.nombre) {
          return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
        }
        data = await contentService.createCategoria(body);
        break;

      case 'subcategories':
        if (!body.nombre || !body.fk_categoria) {
          return NextResponse.json({ error: 'El nombre y la categoría son requeridos' }, { status: 400 });
        }
        if (body.precio_adicional) {
          body.precio_adicional = new Prisma.Decimal(body.precio_adicional);
        }
        data = await contentService.createSubcategoria(body);
        break;

      case 'tags':
        if (!body.nombre) {
          return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
        }
        data = await contentService.createEtiqueta(body);
        break;

      case 'pasteles':
        if (!body.nombre || !body.precio) {
          return NextResponse.json({ error: 'El nombre y el precio son requeridos' }, { status: 400 });
        }
        
        // Convertir el precio a Decimal
        body.precio = new Prisma.Decimal(body.precio);
        
        // Asegurar que las etiquetas sean un array de números
        if (body.etiquetas) {
          body.etiquetas = body.etiquetas.map((id: string | number) => Number(id));
        } else {
          body.etiquetas = [];
        }

        // Convertir valores booleanos
        body.destacado = Boolean(body.destacado);
        body.disponible = Boolean(body.disponible);
        
        // Convertir stock a número
        if (body.stock !== undefined) {
          body.stock = Number(body.stock);
        }

        data = await contentService.createPastel(body);
        break;

      default:
        return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en POST /api/content:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Tipo no especificado' }, { status: 400 });
    }

    let data;
    switch (type) {
      case 'categories':
        if (!body.id || !body.nombre) {
          return NextResponse.json({ error: 'ID y nombre son requeridos' }, { status: 400 });
        }
        data = await contentService.updateCategoria(body);
        break;

      case 'subcategories':
        if (!body.id || !body.nombre || !body.fk_categoria) {
          return NextResponse.json({ error: 'ID, nombre y categoría son requeridos' }, { status: 400 });
        }
        if (body.precio_adicional) {
          body.precio_adicional = new Prisma.Decimal(body.precio_adicional);
        }
        data = await contentService.updateSubcategoria(body);
        break;

      case 'tags':
        if (!body.id || !body.nombre) {
          return NextResponse.json({ error: 'ID y nombre son requeridos' }, { status: 400 });
        }
        data = await contentService.updateEtiqueta(body);
        break;

      case 'pasteles':
        if (!body.id || !body.nombre || !body.precio) {
          return NextResponse.json({ error: 'ID, nombre y precio son requeridos' }, { status: 400 });
        }
        
        // Convertir el precio a Decimal
        body.precio = new Prisma.Decimal(body.precio);
        
        // Asegurar que las etiquetas sean un array de números
        if (body.etiquetas) {
          body.etiquetas = body.etiquetas.map((id: string | number) => Number(id));
        } else {
          body.etiquetas = [];
        }

        // Convertir valores booleanos
        body.destacado = Boolean(body.destacado);
        body.disponible = Boolean(body.disponible);
        
        // Convertir stock a número
        if (body.stock !== undefined) {
          body.stock = Number(body.stock);
        }

        data = await contentService.updatePastel(body);
        break;

      default:
        return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en PUT /api/content:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Tipo e ID son requeridos' }, { status: 400 });
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    switch (type) {
      case 'categories':
        await contentService.deleteCategoria(numericId);
        break;
      case 'subcategories':
        await contentService.deleteSubcategoria(numericId);
        break;
      case 'tags':
        await contentService.deleteEtiqueta(numericId);
        break;
      case 'pasteles':
        await contentService.deletePastel(numericId);
        break;
      default:
        return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en DELETE /api/content:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 