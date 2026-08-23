# ShipNow - Pre-entrega Módulo 2

ShipNow es una API realizada para el curso de Backend.

En esta pre-entrega agregué un módulo de mocking para generar usuarios, repartidores, pedidos y entregas de prueba utilizando Faker.

## Versiones del proyecto

Cada pre-entrega se encuentra separada en su propia rama:

- [Pre-entrega 1](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-1)
- [Pre-entrega 2](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-2) - Rama actual

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Faker
- dotenv

## Cómo ejecutar el proyecto

Clonar la rama de la pre-entrega 2:

```bash
git clone --branch pre-entrega-2 https://github.com/rodrisla/ShipNow_Isla_Rodrigo.git
```

Entrar en la carpeta:

```bash
cd ShipNow_Isla_Rodrigo
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` tomando como referencia `.env.example`:

```env
PORT=8080
MONGODB_URI=URI_DE_MONGODB
NODE_ENV=development
```

Ejecutar el proyecto:

```bash
npm run dev
```

## Módulo de mocks

Las rutas de mocks se encuentran bajo:

```text
/api/mocks
```

Estas rutas están disponibles solamente cuando la aplicación se ejecuta con:

```env
NODE_ENV=development
```

En otro entorno, las rutas de mocks responden `404`.

Los endpoints se pueden probar desde Postman.

## Generar usuarios sin guardar

Configurar en Postman:

```http
GET http://localhost:8080/api/mocks/mockingusers?qty=10
```

Este endpoint genera usuarios falsos sin guardarlos en MongoDB.

Los roles `customer` y `driver` se eligen de manera aleatoria y se toman desde las constantes del proyecto.

Las contraseñas se generan porque forman parte del modelo, pero no se muestran en la respuesta.

Si no se envía `qty`, se generan 10 usuarios. Se aceptan cantidades entre 1 y 100.

## Generar pedidos sin guardar

Configurar en Postman:

```http
GET http://localhost:8080/api/mocks/mockingorders?qty=10
```

Este endpoint genera pedidos falsos sin guardarlos en MongoDB.

Cada pedido contiene:

- ID de un usuario simulado.
- Dirección de entrega.
- Estado válido.
- Prioridad válida.

Los estados y prioridades se toman desde las constantes del proyecto.

## Insertar datos de prueba

Configurar en Postman:

```http
POST http://localhost:8080/api/mocks/generateData
```

Seleccionar `Body`, luego `raw` y elegir el formato `JSON`.

Ejemplo:

```json
{
  "users": 10,
  "orders": 20,
  "deliveries": 5
}
```

Este endpoint genera los datos y los inserta en MongoDB respetando el siguiente orden:

1. Usuarios.
2. Pedidos relacionados con usuarios.
3. Entregas relacionadas con pedidos y repartidores.

Ejemplo de respuesta:

```json
{
  "status": "success",
  "data": {
    "inserted": {
      "users": 10,
      "customers": 6,
      "drivers": 4,
      "orders": 20,
      "deliveries": 5
    }
  }
}
```

La cantidad de clientes y repartidores puede variar porque los roles se generan de forma aleatoria.

Los repartidores también son usuarios, pero tienen el rol `driver`. Por eso, la cantidad indicada en `users` es el total entre clientes y repartidores.

Cada vez que se ejecuta este endpoint se agregan nuevos registros de prueba.

## Validaciones

Las cantidades enviadas deben:

- Ser números enteros entre 0 y 100.
- Tener al menos un valor mayor a cero.
- Incluir usuarios si se generan pedidos.
- Incluir pedidos si se generan entregas.
- No pedir más entregas que pedidos.
- Incluir al menos dos usuarios si se generan entregas.

## Relaciones de los datos

Los datos insertados mantienen estas relaciones:

- Cada pedido pertenece a un usuario con rol `customer`.
- Cada entrega pertenece a un pedido.
- Los repartidores tienen rol `driver`.
- Las entregas pendientes o canceladas no tienen repartidor.
- Las demás entregas tienen un repartidor asignado.
- Los roles, estados y prioridades se toman desde las constantes.

## Organización del módulo

El módulo de mocking está organizado de esta manera:

```text
src/mocks/
├── controllers/
│   └── mock.controller.js
├── repositories/
│   └── mock.repository.js
├── routes/
│   └── mock.routes.js
├── services/
│   └── mock.service.js
├── users.mock.js
├── orders.mock.js
└── deliveries.mock.js
```

El recorrido de una petición es:

```text
Router → Controller → Service → Repository → Model → MongoDB
```

Los archivos `.mock.js` generan los datos falsos.

El Service valida las cantidades, usa los generadores y mantiene las relaciones entre los datos.

El Repository se utiliza para insertar los registros mediante los modelos de Mongoose.

El Router solamente define las rutas y llama al Controller.

## Funcionalidades anteriores

También se mantienen las rutas CRUD realizadas en la pre-entrega anterior:

- `/api/products`
- `/api/users`

## Aclaración sobre las contraseñas

En estas pre-entregas las contraseñas se guardan sin hashing.

Las contraseñas no se devuelven en las respuestas de la API.

## Autor

Rodrigo Isla