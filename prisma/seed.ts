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

  // Crear pasteles de Dulces Delicias
  const pasteles = [
    {
      nombre: 'Pastel de Chocolate',
      descripcion: 'El sabor profundo y la textura suave del chocolate se combinan para crear un pastel irresistible.',
      precio: 300,
      imagen: 'https://peopleenespanol.com/thmb/lE1vH7iehjpUvyp14HNDYUXVi8o=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/3a23ae4b-48b7-44eb-96a7-0e8e755683b6-2000-c618f18c242d47ca89eaddea62579593.jpg',
      destacado: true,
      stock: 10,
      disponible: true
    },
    {
      nombre: 'Tarta de Fresas',
      descripcion: 'Fresas frescas sobre una base de crema pastelera y masa quebrada. Una explosión de sabor frutal.',
      precio: 280,
      imagen: 'https://peopleenespanol.com/thmb/DhWNNRlHKbpMpe57TLKKFxcxVwg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/07520ea1-c0f0-4448-9a82-bb29c3d4aa52-2000-eb8a0e997bff4e1796bc9784c10117aa.jpg',
      destacado: false,
      stock: 8,
      disponible: true
    },
    {
      nombre: 'Cheesecake de Frutos Rojos',
      descripcion: 'La cremosidad del cheesecake se combina con la frescura de los frutos rojos para crear un postre irresistible.',
      precio: 320,
      imagen: '/images/frutas.jpg',
      destacado: true,
      stock: 12,
      disponible: true
    },
    {
      nombre: 'Pastel de Zanahoria',
      descripcion: 'Un clásico reinventado con zanahorias frescas y un delicioso frosting de queso crema.',
      precio: 290,
      imagen: '/images/zanahoria.jpg',
      destacado: false,
      stock: 6,
      disponible: true
    },
    {
      nombre: 'Tiramisú',
      descripcion: 'El postre italiano por excelencia, con capas de bizcocho empapado en café y crema de mascarpone.',
      precio: 350,
      imagen: '/images/tiramisu.jpg',
      destacado: true,
      stock: 15,
      disponible: true
    },
    {
      nombre: 'Pastel de Limón',
      descripcion: 'Un refrescante pastel de limón con un toque de menta y una base crujiente de galletas.',
      precio: 270,
      imagen: '/images/limon.jpg',
      destacado: false,
      stock: 9,
      disponible: true
    }
  ];

  // Crear o actualizar cada pastel
  for (const pastelData of pasteles) {
    const pastelExistente = await prisma.pastel.findFirst({
      where: { nombre: pastelData.nombre }
    });

    if (!pastelExistente) {
      await prisma.pastel.create({
        data: pastelData
      });
      console.log(`Pastel creado: ${pastelData.nombre}`);
    } else {
      await prisma.pastel.update({
        where: { id: pastelExistente.id },
        data: pastelData
      });
      console.log(`Pastel actualizado: ${pastelData.nombre}`);
    }
  }

  console.log('Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 