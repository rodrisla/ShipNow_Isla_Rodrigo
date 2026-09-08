import swaggerJSDoc from 'swagger-jsdoc';

import { env } from './env.config.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'ShipNow API',
      version: '1.0.0',
      description:
        'API para administrar usuarios, productos, pedidos, entregas, documentos y comprobantes de ShipNow, preparada para ejecución local y contenerizada.'
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Servidor local'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Estado operativo de la API sin información sensible'
      },
      {
        name: 'Users',
        description: 'Administración de usuarios y sus documentos'
      },
      {
        name: 'Products',
        description: 'Administración de productos'
      },
      {
        name: 'Orders',
        description: 'Creación, consulta y actualización de pedidos'
      },
      {
        name: 'Deliveries',
        description: 'Creación, consulta, actualización y comprobantes de entregas'
      },
      {
        name: 'Mocks',
        description: 'Generación de datos de prueba deshabilitada en producción'
      },
      {
        name: 'Logger',
        description: 'Herramienta interna deshabilitada en producción'
      }
    ]
  },
  apis: ['./src/docs/*.yaml']
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
