import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear pasteles
  const pasteles = [
    {
      nombre: 'Pastel de Chocolate',
      descripcion: 'El sabor profundo y la textura suave del chocolate se combinan para crear un pastel irresistible.',
      precio: 300,
      imagen: 'https://peopleenespanol.com/thmb/lE1vH7iehjpUvyp14HNDYUXVi8o=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/3a23ae4b-48b7-44eb-96a7-0e8e755683b6-2000-c618f18c242d47ca89eaddea62579593.jpg',
      destacado: true,
      etiquetas: ['Chocolate', 'Favoritos'],
      calificacion: 4.8
    },
    {
      nombre: 'Tarta de Fresas',
      descripcion: 'Fresas frescas sobre una base de crema pastelera y masa quebrada. Una explosión de sabor frutal.',
      precio: 280,
      imagen: 'https://peopleenespanol.com/thmb/DhWNNRlHKbpMpe57TLKKFxcxVwg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/07520ea1-c0f0-4448-9a82-bb29c3d4aa52-2000-eb8a0e997bff4e1796bc9784c10117aa.jpg',
      destacado: false,
      etiquetas: ['Frutales', 'Verano'],
      calificacion: 4.5
    },
    {
      nombre: 'Cheesecake de Frutos Rojos',
      descripcion: 'La cremosidad del cheesecake se combina con la frescura de los frutos rojos.',
      precio: 320,
      imagen: 'https://peopleenespanol.com/thmb/lE1vH7iehjpUvyp14HNDYUXVi8o=/750x0/filters:no_upscale():max_bytes(150000):strip_icc()/3a23ae4b-48b7-44eb-96a7-0e8e755683b6-2000-c618f18c242d47ca89eaddea62579593.jpg',
      destacado: true,
      etiquetas: ['Frutales', 'Favoritos'],
      calificacion: 4.9
    }
  ];

  // Crear usuario de prueba
  await prisma.uSER.create({
    data: {
      username: 'Usuario Prueba',
      email: 'usuario@prueba.com',
      password: 'password123', // En producción esto debería estar hasheado
      telefono: '1234567890'
    }
  });

  // Crear pasteles
  for (const pastel of pasteles) {
    await prisma.pastel.create({
      data: pastel
    });
  }

  console.log('Base de datos poblada exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 