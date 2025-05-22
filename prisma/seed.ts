import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Buscar o crear usuario de prueba
  let usuario = await prisma.uSER.findUnique({
    where: { email: 'usuario@prueba.com' }
  });
  if (!usuario) {
    usuario = await prisma.uSER.create({
      data: {
        username: 'Usuario Prueba',
        email: 'usuario@prueba.com',
        password: 'password123', // En producción esto debería estar hasheado
        telefono: '1234567890',
        rol: 'cliente'
      }
    });
  }

  // Buscar o crear pasteles
  let pastelChoco = await prisma.pastel.findFirst({ where: { nombre: 'Pastel de Chocolate' } });
  if (!pastelChoco) {
    pastelChoco = await prisma.pastel.create({
      data: {
        nombre: 'Pastel de Chocolate',
        descripcion: 'El sabor profundo y la textura suave del chocolate se combinan para crear un pastel irresistible.',
        precio: 300,
        imagen: 'https://peopleenespanol.com/thmb/lE1vH7iehjpUvyp14HNDYUXVi8o=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/3a23ae4b-48b7-44eb-96a7-0e8e755683b6-2000-c618f18c242d47ca89eaddea62579593.jpg',
        destacado: true,
        stock: 10,
        disponible: true
      }
    });
  }
  let pastelFresa = await prisma.pastel.findFirst({ where: { nombre: 'Tarta de Fresas' } });
  if (!pastelFresa) {
    pastelFresa = await prisma.pastel.create({
      data: {
        nombre: 'Tarta de Fresas',
        descripcion: 'Fresas frescas sobre una base de crema pastelera y masa quebrada. Una explosión de sabor frutal.',
        precio: 280,
        imagen: 'https://peopleenespanol.com/thmb/DhWNNRlHKbpMpe57TLKKFxcxVwg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/07520ea1-c0f0-4448-9a82-bb29c3d4aa52-2000-eb8a0e997bff4e1796bc9784c10117aa.jpg',
        destacado: false,
        stock: 8,
        disponible: true
      }
    });
  }

  // Crear pedidos de ejemplo
  await prisma.pedido.create({
    data: {
      fk_usuario: usuario.id,
      total: 300,
      direccion: 'Calle Principal 123, Ciudad',
      notas: 'Entregar en la tarde',
      estado: 'pendiente',
      pedido_pastel: {
        create: {
          total: 300,
          carrito_items: {
            create: {
              fk_pastel: pastelChoco.id,
              cantidad: 1,
              precio_unitario: 300
            }
          }
        }
      }
    }
  });
  await prisma.pedido.create({
    data: {
      fk_usuario: usuario.id,
      total: 560,
      direccion: 'Avenida Central 456, Ciudad',
      notas: 'Con decoración especial',
      estado: 'en_proceso',
      pedido_pastel: {
        create: [
          {
            total: 280,
            carrito_items: {
              create: {
                fk_pastel: pastelFresa.id,
                cantidad: 1,
                precio_unitario: 280
              }
            }
          },
          {
            total: 280,
            carrito_items: {
              create: {
                fk_pastel: pastelFresa.id,
                cantidad: 1,
                precio_unitario: 280
              }
            }
          }
        ]
      }
    }
  });
  await prisma.pedido.create({
    data: {
      fk_usuario: usuario.id,
      total: 300,
      direccion: 'Calle Secundaria 789, Ciudad',
      notas: 'Sin nueces',
      estado: 'completado',
      pedido_pastel: {
        create: {
          total: 300,
          carrito_items: {
            create: {
              fk_pastel: pastelChoco.id,
              cantidad: 1,
              precio_unitario: 300
            }
          }
        }
      }
    }
  });

  console.log('Base de datos poblada exitosamente con pedidos de ejemplo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 