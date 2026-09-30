# ShipNow - Entrega Final Backend III

ShipNow es una API REST construida con Node.js, Express, MongoDB y Mongoose para administrar usuarios, productos, pedidos, entregas, documentos y comprobantes.

La entrega final consolida todo el recorrido del curso en un repositorio ejecutable, documentado y testeado. Integra arquitectura por capas, mocks consistentes, errores globales, logging, Swagger, testing funcional, archivos con Multer, controles de performance y un entorno Docker Compose con MongoDB.

## Alcance de la entrega final

- Listados paginados con límite efectivo máximo de 100 resultados.
- Filtros aplicados en MongoDB antes de recuperar documentos.
- Consultas de lectura con `lean()`, `skip()`, `limit()` y conteo total.
- Payload JSON limitado a 100 KB.
- Archivos limitados a 5 MB y tipos MIME controlados.
- Variables de entorno validadas antes de iniciar la aplicación.
- Endpoint público `GET /health` sin información sensible.
- Mocks y logger-test deshabilitados en producción.
- Swagger disponible para consultar el contrato de la API.
- CRUD y tracking público de entregas mediante código inmutable.
- Imagen Docker multi-stage, reproducible, no-root y con health check integrado.
- Docker Compose con API, MongoDB, volúmenes y arranque condicionado por la salud de la base.
- Contexto Docker sin dependencias locales, secretos, logs, uploads ni tests.

## Versiones del proyecto

Cada pre-entrega se encuentra separada en su propia rama:

- [Pre-entrega 1](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-1)
- [Pre-entrega 2](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-2)
- [Pre-entrega 3](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-3)
- [Pre-entrega 4](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-4)
- [Pre-entrega 5](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-5)
- [Pre-entrega 6](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-6)
- [Pre-entrega 7](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-7)
- [Pre-entrega 8](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/pre-entrega-8)
- [Entrega final](https://github.com/rodrisla/ShipNow_Isla_Rodrigo/tree/entrega-final) - Rama actual

## Tecnologías

- Node.js 24 Alpine en Docker
- Express
- MongoDB y Mongoose
- Multer
- Winston
- Swagger/OpenAPI
- Faker
- Mocha, Chai y Supertest
- Docker y Docker Compose

## Arquitectura general

Las rutas principales respetan el flujo `Router → Controller → Service → Repository → Model`:

| Capa | Responsabilidad |
|---|---|
| `routes/` | Declara métodos, paths y middlewares; no accede a MongoDB |
| `controllers/` | Traduce HTTP, invoca servicios y construye respuestas JSON |
| `services/` | Contiene validaciones y reglas de negocio |
| `repositories/` | Concentra consultas y persistencia con Mongoose |
| `models/` | Define schemas, relaciones y restricciones de MongoDB |
| `middlewares/` | Maneja errores, logging HTTP y carga de archivos |
| `mocks/` | Conserva su propio flujo controller/service/repository y usa constantes del dominio |

`src/app.js` construye Express sin conectarse ni escuchar puertos. `src/server.js` valida la configuración, conecta MongoDB y recién entonces inicia el servidor. Esta separación permite probar la aplicación real con Supertest sin abrir un puerto.

## Requisitos

Para ejecutar el proyecto localmente:

- Node.js 20.19 o superior;
- npm 10 o superior;
- una instancia o clúster de MongoDB accesible.

Para ejecutarlo contenerizado también se necesita Docker Desktop o un motor Docker compatible con contenedores Linux.

## Variables de entorno

ShipNow centraliza su configuración en `src/config/env.config.js`.

| Variable | Obligatoria | Valores o ejemplo | Uso |
|---|---|---|---|
| `PORT` | Sí | `8080` | Puerto HTTP, entero entre 1 y 65535 |
| `MONGODB_URI` | Sí | `mongodb://localhost:27017/shipnow` | URI de MongoDB con esquema `mongodb://` o `mongodb+srv://` |
| `NODE_ENV` | Sí | `development`, `test`, `production` | Define el comportamiento por entorno |
| `LOG_LEVEL` | No | `debug`, `fatal`, `info` | Nivel mínimo del logger; posee un valor predeterminado por entorno |

Valores predeterminados de `LOG_LEVEL`:

| Entorno | Nivel |
|---|---|
| `development` | `debug` |
| `test` | `fatal` |
| `production` | `info` |

La aplicación falla al inicio con un mensaje claro si falta una variable crítica o si el puerto, la URI, el entorno o el nivel de logs tienen un formato inválido.

El proyecto incluye estas plantillas públicas:

- `.env.example`: desarrollo local;
- `.env.test.example`: testing aislado;
- `.env.production.example`: ejecución productiva o Docker.

Los archivos reales `.env`, `.env.test` y `.env.production` están ignorados por Git y nunca se copian dentro de la imagen.

ShipNow todavía no implementa JWT ni consume servicios HTTP externos. Por ese motivo no se agregan secretos JWT ni URLs externas ficticias. Si esas integraciones se incorporan, sus valores deberán sumarse a la validación y a las plantillas, nunca escribirse directamente en el código.

## Ejecución local

Clonar la rama:

```bash
git clone --branch entrega-final https://github.com/rodrisla/ShipNow_Isla_Rodrigo.git
cd ShipNow_Isla_Rodrigo
```

Instalar exactamente las versiones registradas en el lockfile:

```bash
npm ci
```

Crear el entorno de desarrollo:

```bash
cp .env.example .env
```

Reemplazar `MONGODB_URI` por una URI válida y ejecutar:

```bash
npm run dev
```

La API queda disponible por defecto en `http://localhost:8080`.

Para ejecutar sin modo watch:

```bash
npm start
```

## Performance y control de listados

Todos los listados principales utilizan:

- página predeterminada: 1;
- límite predeterminado: 10;
- límite efectivo máximo: 100;
- validación de enteros positivos;
- filtros validados contra las constantes del dominio;
- `countDocuments(filter)` y consulta paginada ejecutados en paralelo;
- filtros, `skip` y `limit` aplicados en MongoDB;
- `lean()` para evitar hidratar documentos de solo lectura.

| Endpoint | Filtros admitidos |
|---|---|
| `GET /api/users` | `page`, `limit`, `role`, `active` |
| `GET /api/orders` | `page`, `limit`, `status`, `priority` |
| `GET /api/deliveries` | `page`, `limit`, `status` |
| `GET /api/products` | `page`, `limit`, `status` |
| `GET /api/products/available` | `page`, `limit`; aplica `AVAILABLE` directamente en MongoDB |

Ejemplo:

```http
GET /api/orders?page=2&limit=10&status=created&priority=high
```

La respuesta incluye los resultados y metadatos:

```json
{
  "status": "success",
  "data": {
    "orders": [],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

Un `limit` mayor a 100 no amplía la respuesta: se reduce automáticamente a 100. Una página, límite o filtro inválido responde `400` mediante `INVALID_PAGINATION` o `INVALID_FILTER`.

Los cuerpos JSON están limitados a 100 KB. Si se supera ese tamaño, la API responde `413 PAYLOAD_TOO_LARGE`.

## Carga de archivos

Multer se configura una sola vez en `src/config/multer.config.js`; los routers únicamente seleccionan el middleware necesario.

| Entidad | Endpoint | Campo de archivo | Campo adicional |
|---|---|---|---|
| Usuario | `POST /api/users/:id/documents` | `document` | `documentType` obligatorio |
| Entrega | `POST /api/deliveries/:id/receipts` | `receipt` | Ninguno |

Controles aplicados:

- tamaño máximo de 5 MB;
- PDF, JPG, JPEG y PNG;
- coincidencia entre MIME type y extensión admitida;
- nombre exacto del campo multipart;
- tipo documental perteneciente al dominio;
- entidad de destino existente;
- errores centralizados con status `400`, `404`, `413` o `500`;
- eliminación asíncrona del archivo cuando la asociación falla;
- directorios creados con APIs asíncronas, sin bloquear el Event Loop.

MongoDB conserva solamente metadatos. Los archivos locales se escriben en `uploads/users/documents/` o `uploads/deliveries/receipts/`, mientras que los tests usan `uploads/test/` y la eliminan al finalizar.

`uploads/` no se sube a Git ni se incorpora a la imagen. En Docker se monta un volumen explícito. Para un despliegue distribuido o con múltiples réplicas se debería reemplazar el filesystem local por almacenamiento de objetos o un volumen persistente administrado.

## Preparación para producción

### Política de endpoints

| Endpoint o grupo | Desarrollo/Test | Producción | Criterio |
|---|---:|---:|---|
| `GET /health` | Disponible | Disponible | Monitoreo sin secretos |
| `/api/docs/` | Disponible | Disponible | Contrato público de esta entrega |
| `/api/users`, `/api/products`, `/api/orders`, `/api/deliveries` | Disponible | Disponible | Endpoints principales |
| `/api/mocks/*` | Disponible | `404` | Evita generar datos artificiales |
| `GET /logger-test` | Disponible | `404` | Herramienta exclusivamente interna |

Como todavía no existe autenticación, los endpoints principales no documentan respuestas `401` o `403` inexistentes.

### Health check

```http
GET /health
```

Respuesta:

```json
{
  "status": "success",
  "data": {
    "service": "ShipNow API",
    "api": "up",
    "environment": "production",
    "uptime": 35.217,
    "timestamp": "2026-09-08T23:24:47.629Z"
  }
}
```

El endpoint no devuelve la URI de MongoDB, variables del proceso, contraseñas, tokens, secretos, rutas internas ni stacks.

## Logging

Winston utiliza una instancia centralizada. No existen llamadas manuales a `console.log()` en la aplicación.

| Entorno | Salida por consola | Archivos |
|---|---|---|
| `development` | Sí, desde el nivel configurado | `error.log` y `combined.log` |
| `test` | No | `error.log` y `combined.log` |
| `production` | No | `error.log` y `combined.log` |

`error.log` concentra niveles `fatal` y `error`. `combined.log` registra la actividad admitida por `LOG_LEVEL`. Ambos rotan por tamaño, conservan hasta cinco archivos y viven en `logs/`, carpeta ignorada por Git y montada como volumen en Docker. La consola se habilita exclusivamente en `development`.

## Testing funcional

Crear el archivo privado:

```bash
cp .env.test.example .env.test
```

Configurar una URI cuya base se llame exactamente `shipnow_test` y ejecutar:

```bash
npm test
```

La suite contiene **51 tests funcionales** y cubre:

- usuarios, pedidos y el flujo completo de entregas;
- creación, consulta, tracking, actualización de estado y eliminación de una entrega;
- mocks y sus relaciones;
- paginación, filtros y límite máximo;
- health check y ausencia de datos sensibles;
- validación temprana de variables de entorno;
- política de endpoints en producción;
- payload máximo;
- Swagger real;
- configuración de `error.log`, `combined.log` y consola por entorno;
- documentos y comprobantes;
- errores de dominio y rutas inexistentes.

`test/root-hooks.js` se niega a limpiar cualquier base cuyo nombre no sea exactamente `shipnow_test`. Antes de cada caso y al finalizar elimina usuarios, productos, pedidos, entregas y `uploads/test/`, y luego cierra Mongoose.

## Swagger

Con la aplicación iniciada:

```text
http://localhost:8080/api/docs/
```

La especificación OpenAPI 3.0.3 se divide por módulos en `src/docs/` y actualmente contiene **20 paths y 29 operaciones HTTP**. Incluye:

- health check;
- parámetros y metadatos de paginación;
- filtros admitidos;
- schemas reutilizables de respuesta exitosa, error, usuario, pedido y entrega;
- usuarios, productos, pedidos, entregas y tracking;
- documentos y comprobantes multipart;
- mocks y logger-test con su criterio productivo;
- respuestas y errores reutilizables.

## Docker

### Diseño de la imagen

El `Dockerfile`:

- utiliza `node:24-alpine`;
- separa la instalación y la ejecución en las etapas `dependencies` y `runtime`;
- copia primero `package.json` y `package-lock.json` para aprovechar la caché;
- instala versiones productivas reproducibles con `npm ci --omit=dev`;
- deshabilita scripts de instalación y limpia la caché de npm;
- copia a la etapa final solamente dependencias productivas, manifiestos y `src/`;
- prepara `/app/uploads` y `/app/logs` con permisos controlados;
- ejecuta la API como usuario no-root `node`;
- expone `8080`;
- incorpora un health check;
- inicia mediante `npm start`.

### Ejecutar API y MongoDB con Docker Compose

El flujo recomendado levanta ambos servicios, espera que MongoDB esté saludable y recién entonces inicia la API:

```bash
docker compose up --build -d
docker compose ps
```

Compose publica la API en `http://localhost:8080`, conecta internamente con `mongodb://mongo:27017/shipnow` y conserva MongoDB, uploads y logs en volúmenes independientes.

Para usar otro puerto en el host sin modificar el contenedor:

```bash
PORT=3000 docker compose up --build -d
```

En PowerShell:

```powershell
$env:PORT=3000
docker compose up --build -d
```

### Comprobar el despliegue con Compose

```bash
curl http://localhost:8080/health
curl -I http://localhost:8080/api/docs/
curl "http://localhost:8080/api/users?page=1&limit=10"
docker compose ps
docker compose exec api sh -c 'tail -n 50 /app/logs/combined.log'
```

Resultados esperados: health, Swagger y usuarios responden `200`; los servicios `api` y `mongo` aparecen saludables.

Para detener los servicios sin borrar datos:

```bash
docker compose down
```

Solo cuando también se quieran eliminar la base, los uploads y los logs persistidos:

```bash
docker compose down -v
```

> `docker compose down -v` es destructivo para los volúmenes del proyecto.

### Construir y ejecutar solo la imagen

Cuando MongoDB ya está disponible de forma externa:

```bash
docker build --pull -t shipnow-final:local .
cp .env.production.example .env.production
```

Reemplazar `MONGODB_URI` en `.env.production` por la URI real y ejecutar:

```bash
MSYS_NO_PATHCONV=1 docker run -d \
  --name shipnow-api \
  --env-file .env.production \
  -p 8080:8080 \
  --mount type=volume,source=shipnow-uploads,target=/app/uploads \
  --mount type=volume,source=shipnow-logs,target=/app/logs \
  shipnow-final:local
```

El prefijo `MSYS_NO_PATHCONV=1` evita que Git Bash transforme las rutas internas. En Linux o macOS puede omitirse. El archivo de entorno se inyecta al ejecutar y no forma parte de la imagen.

### Detener y limpiar

```bash
docker stop shipnow-api
docker rm shipnow-api
```

Los volúmenes permanecen para preservar archivos y logs entre contenedores. Si ya no se necesitan:

```bash
docker volume rm shipnow-uploads
docker volume rm shipnow-logs
```

### Controles de la imagen

La construcción debe confirmar:

- usuario efectivo: `node`;
- dependencias de desarrollo ausentes;
- `.env` y tests ausentes;
- directorios de uploads y logs escribibles;
- MongoDB conectada;
- health, Swagger y listado paginado disponibles;
- mocks y logger-test restringidos en producción;
- API y MongoDB saludables.

## Archivos excluidos

| Recurso | Git | Imagen Docker |
|---|---:|---:|
| `node_modules/` | Excluido | Se reinstala solo para producción |
| `.env`, `.env.test`, `.env.production` | Excluidos | Excluidos |
| `.git/` y configuración local | No aplica | Excluidos |
| `logs/` y `*.log` | Excluidos | Excluidos |
| `uploads/` | Excluido | Excluido; se monta un volumen |
| `coverage/` | Excluido | Excluido |
| `test/` | Versionado | Excluido de la imagen |
| temporales, IDE y archivos del sistema | Excluidos cuando corresponde | Excluidos |

## Errores centralizados

Todas las respuestas de error respetan:

```json
{
  "status": "error",
  "error": "ERROR_CODE",
  "message": "Mensaje claro para el cliente"
}
```

| Código | HTTP | Caso |
|---|---:|---|
| `INVALID_PAGINATION` | 400 | Página o límite inválido |
| `INVALID_FILTER` | 400 | Filtro fuera del dominio |
| `PAYLOAD_TOO_LARGE` | 413 | Body JSON mayor a 100 KB |
| `FILE_REQUIRED` | 400 | Archivo ausente |
| `INVALID_FILE_TYPE` | 400 | Tipo o extensión no admitidos |
| `FILE_TOO_LARGE` | 413 | Archivo mayor a 5 MB |
| `INVALID_FILE_FIELD` | 400 | Campo multipart incorrecto |
| `INVALID_DOCUMENT_TYPE` | 400 | Tipo documental inválido |
| `PRODUCT_NOT_FOUND` | 404 | Producto inexistente |
| `USER_NOT_FOUND` | 404 | Usuario inexistente |
| `ORDER_NOT_FOUND` | 404 | Pedido inexistente |
| `DELIVERY_NOT_FOUND` | 404 | Entrega inexistente |
| `INVALID_TRACKING_CODE` | 400 | Código de seguimiento inválido |
| `VALIDATION_ERROR` | 400 | Datos rechazados por el modelo |
| `ROUTE_NOT_FOUND` | 404 | Ruta inexistente |
| `INTERNAL_SERVER_ERROR` | 500 | Falla inesperada sin exposición de detalles |

## Endpoints principales

| Método | Ruta | Función |
|---|---|---|
| `GET`, `POST` | `/api/users` | Listar y crear usuarios |
| `GET`, `PUT`, `DELETE` | `/api/users/:id` | Consultar, actualizar y eliminar |
| `POST` | `/api/users/:id/documents` | Asociar documento |
| `GET`, `POST` | `/api/products` | Listar y crear productos |
| `GET` | `/api/products/available` | Listar disponibles |
| `GET`, `PUT`, `DELETE` | `/api/products/:id` | Consultar, actualizar y eliminar |
| `GET`, `POST` | `/api/orders` | Listar y crear pedidos |
| `GET` | `/api/orders/:id` | Consultar pedido |
| `PATCH` | `/api/orders/:id/status` | Actualizar estado |
| `GET`, `POST` | `/api/deliveries` | Listar y crear entregas |
| `GET`, `DELETE` | `/api/deliveries/:id` | Consultar y eliminar entrega |
| `GET` | `/api/deliveries/tracking/:trackingCode` | Consultar seguimiento público |
| `PATCH` | `/api/deliveries/:id/status` | Actualizar estado |
| `POST` | `/api/deliveries/:id/receipts` | Asociar comprobante |
| `GET` | `/health` | Estado operativo |

## Mocks

En `development` y `test` se mantienen:

- `GET /api/mocks/mockingusers?qty=10`;
- `GET /api/mocks/mockingorders?qty=10`;
- `POST /api/mocks/generate-products`;
- `POST /api/mocks/generateData`.

Las cantidades se validan entre 0 o 1 y 100 según la operación, y las relaciones entre usuarios, pedidos y entregas se controlan antes de persistir. En producción, todo el grupo responde `404`.

## Consideraciones de seguridad

Las contraseñas no se devuelven en respuestas, pero en esta etapa académica todavía se guardan sin hashing y no existe autenticación. Antes de un despliegue real deben incorporarse hashing, autenticación, autorización, rate limiting, CORS restringido y una estrategia externa para archivos y secretos.

## Autor

Rodrigo Isla
