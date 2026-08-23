# ShipNow

ShipNow es una API realizada para el curso final de Backend.

El objetivo de la pre-entrega 1 es practicar una arquitectura por capas, separando las rutas, los controladores, la lógica de negocio y el acceso a MongoDB.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv

## Cómo ejecutar el proyecto

Primero hay que clonar el repositorio:

```bash
git clone https://github.com/rodrisla/ShipNow_Isla_Rodrigo.git
```

Entrar en la carpeta del proyecto:

```bash
cd ShipNow_Isla_Rodrigo
```

Instalar las dependencias:

```bash
npm install
```

Después hay que crear un archivo `.env` usando como referencia el archivo `.env.example`.

El archivo `.env` debe tener:

```env
PORT=8080
MONGODB_URI=URI_DE_MONGODB
NODE_ENV=development
```

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

También se puede iniciar normalmente con:

```bash
npm start
```

## Organización del proyecto

El proyecto está separado en las siguientes capas:

- **Routes:** contienen las rutas de la API.
- **Controllers:** reciben las peticiones y envían las respuestas.
- **Services:** contienen la lógica de negocio.
- **Repositories:** realizan las consultas a MongoDB.
- **Models:** definen los esquemas de productos y usuarios.

El recorrido de una petición es:

`Router → Controller → Service → Repository → Model → MongoDB`

## Diferencia entre Service y Repository

Decidí separar estas capas para que cada una tenga una responsabilidad diferente.

El Repository se encarga únicamente de acceder a la base de datos utilizando Mongoose.

El Service utiliza el Repository y aplica las reglas de negocio. Por ejemplo, determina si un producto está disponible según su stock, normaliza los emails y evita que se registren usuarios repetidos.

De esta manera, el Controller no necesita conocer cómo funciona MongoDB.

## Rutas de productos

- `GET /api/products`: obtener todos los productos.
- `GET /api/products/available`: obtener productos disponibles.
- `GET /api/products/:id`: obtener un producto por ID.
- `POST /api/products`: crear un producto.
- `PUT /api/products/:id`: actualizar un producto.
- `DELETE /api/products/:id`: eliminar un producto.

## Rutas de usuarios

- `GET /api/users`: obtener todos los usuarios.
- `GET /api/users/:id`: obtener un usuario por ID.
- `POST /api/users`: crear un usuario.
- `PUT /api/users/:id`: actualizar un usuario.
- `DELETE /api/users/:id`: eliminar un usuario.

## Variables de entorno

Las variables `PORT`, `MONGODB_URI` y `NODE_ENV` se encuentran centralizadas y se validan cuando se inicia la aplicación.

Si falta alguna variable, el servidor muestra un error indicando cuál falta.

## Aclaración sobre las contraseñas

En esta pre-entrega las contraseñas se guardan sin hashing.

La contraseña no se devuelve en las respuestas.

## Autor

Rodrigo Isla