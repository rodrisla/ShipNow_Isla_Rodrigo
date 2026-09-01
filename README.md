# ShipNow - Pre-entrega Módulo 7

En esta pre-entrega se incorporó la carga y gestión de documentos y comprobantes con Multer. Los archivos se validan, se almacenan en carpetas organizadas y sus metadatos quedan asociados a usuarios y entregas en MongoDB.

La implementación se integra con la arquitectura por capas, los errores centralizados, Winston, Swagger y la suite funcional. Los archivos físicos no se guardan en MongoDB ni se suben al repositorio.

## Versiones del proyecto

Cada pre-entrega se encuentra separada en su propia rama:

- [Pre-entrega 1](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-1)
- [Pre-entrega 2](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-2)
- [Pre-entrega 3](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-3)
- [Pre-entrega 4](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-4)
- [Pre-entrega 5](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-5)
- [Pre-entrega 6](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-6)
- [Pre-entrega 7](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-7) - Rama actual

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB
- Mongoose
- Faker
- dotenv
- Winston
- winston-daily-rotate-file
- swagger-jsdoc
- swagger-ui-express
- Mocha
- Chai
- Supertest
- Multer

## Cómo ejecutar el proyecto

Clonar la rama de la pre-entrega 7:

```bash
git clone --branch pre-entrega-7 https://github.com/rodrisla/ShipNow_Isla_Rodrigo.git
```

Entrar en la carpeta e instalar las dependencias:

```bash
cd ShipNow_Isla_Rodrigo
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

## Carga de archivos con Multer

ShipNow utiliza Multer mediante una configuración centralizada en `src/config/multer.config.js`. Los routers solo seleccionan el middleware correspondiente y no contienen lógica de almacenamiento.

### Endpoints de carga

| Entidad | Método y ruta | Campo de archivo | Campo adicional |
|---|---|---|---|
| Usuario | `POST /api/users/:id/documents` | `document` | `documentType` obligatorio |
| Entrega | `POST /api/deliveries/:id/receipts` | `receipt` | No requiere campos adicionales |

Los tipos documentales admitidos para usuarios son:

- `dni`;
- `driver_license`;
- `insurance`.

Los comprobantes de entrega se registran automáticamente con el tipo `delivery_receipt`.

### Validaciones de archivos

- El archivo es obligatorio.
- El campo multipart debe llamarse `document` o `receipt`, según el endpoint.
- Se aceptan archivos PDF, JPG, JPEG y PNG.
- El MIME type debe coincidir con una extensión permitida.
- El tamaño máximo es de **5 MB**.
- El tipo documental debe pertenecer al listado permitido.
- El usuario o la entrega deben existir antes de conservar la asociación.

Los errores mantienen el formato general `{ status, error, message }` y son registrados por Winston.

### Almacenamiento y metadatos

Los documentos se almacenan en `uploads/users/documents/` y los comprobantes en `uploads/deliveries/receipts/`. Durante los tests se utiliza exclusivamente `uploads/test/`.

MongoDB guarda únicamente estos metadatos:

- nombre original;
- nombre generado;
- ruta relativa;
- MIME type;
- tamaño en bytes;
- tipo de documento;
- fecha de carga.

La carpeta `uploads/` está incluida en `.gitignore`. Si la entidad no existe, el tipo documental es inválido o falla la asociación, el archivo físico recién generado se elimina para evitar archivos huérfanos.

## Testing funcional automatizado

La suite actual incorpora **28 tests funcionales** ejecutados contra la aplicación Express real.

Las herramientas utilizadas son:

- **Mocha:** organiza y ejecuta la suite.
- **Chai:** valida status HTTP, estructura y propiedades de las respuestas.
- **Supertest:** realiza peticiones sobre `app` sin iniciar un puerto.

`src/app.js` exporta la aplicación y `src/server.js` se ocupa únicamente de conectar MongoDB e iniciar el servidor. Por eso los tests importan Express directamente y no requieren ejecutar `npm run dev`.

### Entorno de testing

Las pruebas utilizan un entorno y una base separados del desarrollo:

```env
PORT=8081
MONGODB_URI=URI_DE_MONGODB_CON_BASE_shipnow_test
NODE_ENV=test
```

El repositorio incluye `.env.test.example` como plantilla. El archivo privado `.env.test` está ignorado por Git y debe apuntar exclusivamente a una base descartable llamada `shipnow_test`.

El hook global `test/root-hooks.js` verifica `NODE_ENV=test` y comprueba el nombre de la base antes de realizar cualquier limpieza. Si la base conectada no se llama exactamente `shipnow_test`, la suite se detiene para proteger los datos de desarrollo.

### Ejecutar los tests

1. Crear `.env.test` a partir de `.env.test.example`.
2. Configurar una URI de MongoDB cuya base sea `shipnow_test`.
3. Instalar dependencias y ejecutar:

```bash
npm install
npm test
```

No es necesario iniciar el servidor ni utilizar Postman para ejecutar la suite.

### Cobertura funcional

| Módulo | Casos cubiertos |
|---|---|
| Users | Listado, creación válida, datos incompletos y ausencia de contraseñas |
| Orders | Listado, creación, consulta por ID, cambio de estado, datos incompletos, recurso inexistente y estado inválido |
| Uploads | Documento y comprobante válidos, archivo faltante, tipo documental inválido, MIME inválido, tamaño excedido, campo incorrecto, entidad inexistente y limpieza física |
| Mocks | Usuarios, pedidos, productos, carga relacionada, cantidades inválidas y relaciones inválidas |
| Logger | Ejecución de los niveles `debug`, `http`, `info`, `warning`, `error` y `fatal` |
| Swagger | Acceso a Swagger UI y contenido principal de la especificación |
| Errores | Ruta inexistente y formato uniforme `status`, `error` y `message` |

### Datos controlados y limpieza

Los payloads se generan mediante factories deterministas y cada test puede ejecutarse de forma independiente.

Antes de cada test se eliminan los registros existentes y el contenido aislado de `uploads/test`. Al terminar la suite se vuelven a limpiar las colecciones y se cierra la conexión de Mongoose. De esta forma no quedan usuarios, pedidos, productos, entregas ni archivos creados por las pruebas.

La suite fue ejecutada dos veces consecutivas con **28 tests aprobados** y todas las colecciones de `shipnow_test` quedaron en cero.

## Documentación interactiva con Swagger

ShipNow utiliza `swagger-jsdoc` y `swagger-ui-express` con **OpenAPI 3.0.3**. La configuración está separada en `src/config/swagger.config.js` y la documentación por módulos se encuentra en `src/docs/`.

Con el servidor iniciado, Swagger UI está disponible en:

```text
http://localhost:8080/api/docs/
```

### Módulos documentados

| Tag | Ruta principal |
|---|---|
| Users | `/api/users` |
| Products | `/api/products` |
| Orders | `/api/orders` |
| Deliveries | `/api/deliveries` |
| Mocks | `/api/mocks` |
| Logger | `/logger-test` |

La especificación reúne **18 paths y 26 operaciones HTTP**, organizadas por tags.

### Schemas reutilizables

Swagger incluye schemas compartidos para usuarios, productos, pedidos, items de pedido, entregas, metadatos de archivos, identificadores de MongoDB y respuestas exitosas o de error.

Cada endpoint documenta su método, ruta, descripción, parámetros, body, respuesta exitosa y posibles errores reales de la API.

### Cómo probar Swagger

1. Iniciar el servidor con `npm run dev`.
2. Abrir `http://localhost:8080/api/docs/`.
3. Desplegar un endpoint y presionar **Try it out**.
4. Completar los datos y presionar **Execute**.

Las rutas de Mocks están disponibles con `NODE_ENV=development` y también durante la suite aislada con `NODE_ENV=test`. `/logger-test` es una herramienta de validación y no una funcionalidad de negocio. Como ShipNow todavía no implementa autenticación, no se documentan respuestas `401` o `403` inexistentes.

## Logging profesional

ShipNow utiliza Winston mediante una configuración única ubicada en `src/config/logger.js`. Todos los módulos importan la misma instancia y no existen configuraciones repetidas ni mensajes dispersos con `console.log()`.

Los registros utilizan el siguiente formato:

```text
YYYY-MM-DD HH:mm:ss [nivel] mensaje
```

### Niveles disponibles

| Nivel | Uso |
|---|---|
| `debug` | Información detallada para desarrollo |
| `http` | Método, URL, status HTTP y duración de las peticiones |
| `info` | Eventos normales, inicio del servidor y generación de mocks |
| `warning` | Errores esperados, validaciones y recursos inexistentes |
| `error` | Errores internos y fallas de operaciones |
| `fatal` | Fallas críticas durante el inicio de la aplicación |

### Comportamiento según el entorno

| Entorno | Consola | Archivos |
|---|---|---|
| `development` | `debug`, `http`, `info`, `warning`, `error` y `fatal` | `error` y `fatal` |
| `test` | `debug`, `http`, `info`, `warning`, `error` y `fatal` | `error` y `fatal` |
| `production` | `info`, `warning`, `error` y `fatal` | `error` y `fatal` |

En producción se excluyen los niveles `debug` y `http` para reducir el ruido de los registros.

### Integración con ShipNow

El logger registra los siguientes eventos:

- conexión exitosa con MongoDB;
- inicio del servidor;
- fallas críticas durante el arranque;
- peticiones HTTP con método, URL, status y duración;
- generación de usuarios, pedidos y productos mock;
- carga de datos mock en MongoDB;
- carga exitosa de documentos y comprobantes asociados a sus entidades;
- validaciones y errores controlados como `warning`;
- rutas inexistentes como `warning`;
- errores inesperados y fallas de MongoDB como `error`.

El middleware global continúa construyendo la respuesta HTTP uniforme. Winston solo registra internamente lo ocurrido y nunca expone stacks ni detalles sensibles al cliente.

### Organización del logging

```text
src/
├── config/
│   └── logger.js
├── middlewares/
│   ├── error.middleware.js
│   └── http-logger.middleware.js
├── mocks/
│   └── services/
│       └── mock.service.js
└── server.js
```

- `logger.js`: define los niveles, formatos, transportes y comportamiento por entorno.
- `http-logger.middleware.js`: registra método, URL, status HTTP y duración de cada petición.
- `error.middleware.js`: registra errores controlados como `warning` y fallas internas como `error`.
- `mock.service.js`: registra las operaciones correctas de generación y carga de datos de prueba.
- `server.js`: registra la conexión a MongoDB, el inicio del servidor y las fallas críticas.

### Endpoint de prueba

Las pruebas manuales del logger se realizan desde Postman con:

```http
GET http://localhost:8080/logger-test
```

No requiere body ni encabezados especiales. El endpoint ejecuta los seis niveles:

```text
debug
http
info
warning
error
fatal
```

Respuesta esperada:

```json
{
  "status": "success",
  "message": "Todos los niveles del logger fueron ejecutados"
}
```

Para comprobar los seis niveles en consola, la aplicación debe ejecutarse con:

```env
NODE_ENV=development
```

El nivel `fatal` utilizado por este endpoint solo comprueba el funcionamiento del logger y no detiene el servidor.

### Persistencia y rotación

Los errores se guardan automáticamente en:

```text
logs/error-YYYY-MM-DD.log
```

La rotación se realiza diariamente y conserva los archivos de los últimos 14 días. Los niveles `debug`, `http`, `info` y `warning` no se escriben en esos archivos.

La carpeta `/logs/`, los archivos rotados y el archivo interno de auditoría están incluidos en `.gitignore`. Ningún archivo generado por el logger se sube al repositorio.

## Formato centralizado de errores

Todas las respuestas de error respetan la misma estructura:

```json
{
  "status": "error",
  "error": "ERROR_CODE",
  "message": "Mensaje claro para el cliente"
}
```

Ejemplo:

```json
{
  "status": "error",
  "error": "PRODUCT_NOT_FOUND",
  "message": "No se encontró el producto solicitado"
}
```

Los errores inesperados responden con `INTERNAL_SERVER_ERROR` y no exponen stacks, rutas internas, datos de conexión ni otros detalles sensibles.

## Organización de la capa de errores

```text
src/
├── errors/
│   ├── app-error.js
│   ├── error-codes.js
│   ├── errors.dictionary.js
│   └── index.js
└── middlewares/
    └── error.middleware.js
```

- `error-codes.js`: contiene los identificadores estables de los errores.
- `errors.dictionary.js`: relaciona cada código con su mensaje y status HTTP.
- `app-error.js`: define el error personalizado de la aplicación.
- `index.js`: centraliza las exportaciones de la carpeta.
- `error.middleware.js`: transforma los errores en respuestas HTTP uniformes.

El recorrido de un error controlado es:

```text
Service detecta el problema → lanza AppError → Controller ejecuta next(error) → Middleware global responde
```

Los services no dependen de Express y los repositories no construyen respuestas HTTP.

## Códigos de error implementados

| Código | HTTP | Caso principal |
|---|---:|---|
| `PRODUCT_NOT_FOUND` | 404 | El producto solicitado no existe |
| `USER_NOT_FOUND` | 404 | El usuario solicitado no existe |
| `USER_ALREADY_EXISTS` | 409 | El email ya está registrado |
| `ORDER_NOT_FOUND` | 404 | El pedido solicitado no existe |
| `DELIVERY_NOT_FOUND` | 404 | La entrega solicitada no existe |
| `INVALID_ORDER_STATUS` | 400 | El estado del pedido no es válido |
| `INVALID_DELIVERY_STATUS` | 400 | El estado de la entrega no es válido |
| `FILE_REQUIRED` | 400 | No se adjuntó el archivo esperado |
| `INVALID_FILE_TYPE` | 400 | MIME type o extensión no permitidos |
| `FILE_TOO_LARGE` | 413 | El archivo supera los 5 MB |
| `INVALID_FILE_FIELD` | 400 | El campo multipart no coincide con el esperado |
| `INVALID_DOCUMENT_TYPE` | 400 | El tipo documental no está permitido |
| `FILE_STORAGE_ERROR` | 500 | No se pudo almacenar el archivo |
| `INVALID_MOCK_AMOUNT` | 400 | La cantidad de mocks es inválida |
| `INVALID_MOCK_DATA` | 400 | Los datos o relaciones de mocks son inválidos |
| `MOCK_GENERATION_ERROR` | 500 | Falló la generación o carga de mocks |
| `INVALID_ID` | 400 | El identificador no tiene un formato válido |
| `VALIDATION_ERROR` | 400 | Mongoose rechazó los datos enviados |
| `DUPLICATE_RESOURCE` | 409 | Existe un registro con un valor único repetido |
| `ROUTE_NOT_FOUND` | 404 | La ruta solicitada no existe |
| `INTERNAL_SERVER_ERROR` | 500 | Ocurrió un error inesperado |

El middleware también transforma automáticamente errores de Mongoose y MongoDB, incluidos `CastError`, `ValidationError` y errores de clave duplicada con código `11000`.

## Pruebas manuales con Postman

Las pruebas manuales de esta entrega se realizaron desde Postman con el servidor iniciado en `http://localhost:8080`.

Para las peticiones `POST`, se seleccionó `Body → raw → JSON` y se agregó automáticamente el encabezado `Content-Type: application/json`.

Para las cargas de archivos se utiliza `Body → form-data`; los campos `document` y `receipt` deben configurarse como tipo **File**.

| Caso | Método | URL | Respuesta esperada |
|---|---|---|---|
| Prueba de todos los niveles | `GET` | `http://localhost:8080/logger-test` | `200` y seis niveles en consola |
| Ruta inexistente | `GET` | `http://localhost:8080/api/ruta-que-no-existe` | `404 ROUTE_NOT_FOUND` y log `warning` |
| Producto inexistente | `GET` | `http://localhost:8080/api/products/000000000000000000000000` | `404 PRODUCT_NOT_FOUND` |
| ID inválido | `GET` | `http://localhost:8080/api/products/abc` | `400 INVALID_ID` |
| Usuario inexistente | `GET` | `http://localhost:8080/api/users/000000000000000000000000` | `404 USER_NOT_FOUND` |

### Verificar los archivos de logs

Después de ejecutar `GET /logger-test`, revisar la carpeta `logs`. El archivo diario debe contener únicamente mensajes con los niveles:

```text
error
fatal
```

Los niveles `debug`, `http`, `info` y `warning` solo deben observarse en la consola de desarrollo.

### Datos inválidos de producto

Configurar en Postman:

```http
POST http://localhost:8080/api/products
```

Body:

```json
{
  "name": "A",
  "price": -1,
  "stock": -2
}
```

Respuesta esperada: `400 VALIDATION_ERROR` con los mensajes de validación del modelo. El error se registra como `warning`.

## Módulo de mocks

Las rutas de mocks se encuentran bajo `/api/mocks` y están disponibles en desarrollo y durante los tests aislados. Para utilizarlas manualmente, ejecutar con:

```env
NODE_ENV=development
```

En producción, estas rutas responden `404` mediante la misma capa centralizada.

### Generar usuarios sin guardar

```http
GET /api/mocks/mockingusers?qty=10
```

Si no se envía `qty`, se generan 10 usuarios. Se aceptan cantidades enteras entre 1 y 100.

### Generar pedidos sin guardar

```http
GET /api/mocks/mockingorders?qty=10
```

Los pedidos generados contienen un usuario simulado, dirección, items, estado y prioridad válidos.

### Generar productos

```http
POST /api/mocks/generate-products
```

Body para generarlos sin guardar:

```json
{
  "count": 10,
  "saveToDatabase": false
}
```

Body para insertarlos en MongoDB:

```json
{
  "count": 10,
  "saveToDatabase": true
}
```

Cada producto utiliza los campos del modelo de ShipNow: `name`, `description`, `price`, `stock` y `status`. El status se calcula de acuerdo con el stock.

### Insertar usuarios, pedidos y entregas relacionados

```http
POST /api/mocks/generateData
```

Body de ejemplo:

```json
{
  "users": 10,
  "orders": 20,
  "deliveries": 5
}
```

El endpoint inserta primero los usuarios, luego los pedidos relacionados con clientes y finalmente las entregas relacionadas con pedidos y repartidores.

Las operaciones correctas de generación se registran como `info`. Si una inserción falla, el middleware registra el error como `error`.

## Pruebas de errores de mocks con Postman

Estos casos también se probaron manualmente desde Postman.

### Cantidad negativa

```http
GET http://localhost:8080/api/mocks/mockingusers?qty=-1
```

Respuesta esperada: `400 INVALID_MOCK_AMOUNT` y registro de nivel `warning`.

### Cantidad de productos inválida

```http
POST http://localhost:8080/api/mocks/generate-products
```

Body:

```json
{
  "count": -2,
  "saveToDatabase": false
}
```

Respuesta esperada: `400 INVALID_MOCK_AMOUNT` y registro de nivel `warning`.

### Opción de guardado inválida

```http
POST http://localhost:8080/api/mocks/generate-products
```

Body:

```json
{
  "count": 2,
  "saveToDatabase": "true"
}
```

Respuesta esperada: `400 INVALID_MOCK_DATA` porque `saveToDatabase` debe ser booleano.

### Relación inválida entre datos

```http
POST http://localhost:8080/api/mocks/generateData
```

Body:

```json
{
  "users": 0,
  "orders": 1,
  "deliveries": 0
}
```

Respuesta esperada: `400 INVALID_MOCK_DATA` porque no se pueden crear pedidos sin usuarios.

Las inserciones del módulo pasan por `MockRepository`. Si MongoDB falla durante la carga, el Service genera `MOCK_GENERATION_ERROR`, el middleware registra el problema como `error` y responde `500` sin exponer la causa interna.

## Validaciones de generateData

- `users`, `orders` y `deliveries` deben ser enteros entre 0 y 100.
- Debe solicitarse al menos un registro.
- Para generar pedidos también deben generarse usuarios.
- Para generar entregas también deben generarse pedidos.
- La cantidad de entregas no puede superar la de pedidos.
- Para generar entregas deben solicitarse al menos dos usuarios.

## Funcionalidades disponibles

Se encuentran disponibles los siguientes módulos principales:

- `/api/products`
- `/api/users`
- `/api/orders`
- `/api/deliveries`
- `POST /api/users/:id/documents`
- `POST /api/deliveries/:id/receipts`

También se mantienen los mocks de usuarios, pedidos, productos y entregas, junto con sus relaciones y constantes de dominio.

La aplicación incorpora además:

- logger centralizado y reutilizable;
- middleware de peticiones HTTP;
- integración del logger con errores y mocks;
- persistencia y rotación diaria;
- endpoint `GET /logger-test`;
- documentación OpenAPI separada por módulos;
- schemas reutilizables;
- Swagger UI disponible en `/api/docs/`;
- testing funcional con Mocha, Chai y Supertest;
- entorno y base de testing separados;
- limpieza automática de datos de prueba;
- configuración centralizada de Multer;
- documentos y comprobantes asociados mediante metadatos;
- limpieza automática de archivos de testing;
- carpeta `uploads/` excluida del repositorio.

## Aclaración sobre las contraseñas

En estas pre-entregas las contraseñas se guardan sin hashing. Las contraseñas no se devuelven en las respuestas de la API.

## Autor

Rodrigo Isla
