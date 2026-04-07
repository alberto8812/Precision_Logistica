# Precision Logistica — Backend

API REST para la gestión de programación de transporte logístico. Construida con NestJS, PostgreSQL, Redis y arquitectura limpia (Clean Architecture).

---

## Stack

| Tecnología | Uso |
|---|---|
| NestJS 11 | Framework principal |
| PostgreSQL | Base de datos relacional |
| Prisma 7 | ORM y migraciones |
| Redis | Cache de respuestas |
| Docker | Contenerización |
| pnpm | Gestor de paquetes |
| Swagger | Documentación de API |

---

## Arquitectura

El proyecto sigue **Clean Architecture** con separación estricta de capas:

```
src/modules/scheduling/
├── domain/               # Modelos e interfaces (sin dependencias externas)
│   ├── model/
│   └── repository/
├── aplication/           # Casos de uso y DTOs
│   ├── dto/
│   ├── interfaces/
│   └── use-case/
└── infrastructure/       # Implementaciones concretas (Prisma, HTTP)
    ├── controlers/
    └── repositories/
```

**Regla de dependencia:** `infrastructure` → `aplication` → `domain`. El dominio no conoce nada del exterior.

---

## Requisitos

- Docker y Docker Compose
- Node.js 22+ (solo para desarrollo local sin Docker)
- pnpm 9+

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto `back/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/precision_logistica
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
```

Con Docker Compose los valores ya están configurados en `compose.yml`.

---

## Levantar con Docker

```bash
# Desde la raíz del proyecto
docker compose up -d
```

El servidor queda disponible en `http://localhost:3000`.

---

## Desarrollo local (sin Docker)

```bash
# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm exec prisma generate

# Correr migraciones
pnpm exec prisma migrate dev

# Iniciar en modo watch
pnpm run start:dev
```

---

## Seed de base de datos

El seed **borra todos los datos existentes** (PostgreSQL y Redis) e inserta 1000 registros de prueba.

```bash
# Dentro del contenedor
docker compose exec backend pnpm run seed

# O localmente
pnpm run seed
```

Los registros generados incluyen:
- 50 nombres de conductores argentinos
- Patentes en formato Mercosur (`AA000BB` a `AA999BB`)
- Fechas de programación entre 2025 y 2026
- Estados distribuidos aleatoriamente: `PENDING`, `IN_PROGRESS`, `DELIVERED`

---

## Endpoints

La documentación interactiva está disponible en: `http://localhost:3000/docs`

### Scheduling

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/scheduling` | Crear un nuevo scheduling |
| `POST` | `/scheduling/pagination` | Listar con paginación por cursor |
| `GET` | `/scheduling/:id` | Obtener por ID |
| `PATCH` | `/scheduling/:id` | Actualizar |

### Paginación por cursor

El endpoint `POST /scheduling/pagination` acepta:

```json
{
  "limit": 10,
  "afterCursor": "uuid-del-ultimo-elemento",
  "beforeCursor": null,
  "search": "Carlos",
  "filters": [
    { "field": "driverName", "operator": "contains", "Value": "García" }
  ]
}
```

**Operadores de filtro disponibles:**
- `contains` — contiene el valor (case-insensitive)
- `in` — está en el array de valores
- `gt` — mayor que
- `lt` — menor que
- `df` — igual a (default)

---

## Modelo de datos

```prisma
model sheuduling {
  id             String   @id @default(uuid())
  driverName     String
  plates         String   @unique
  status         status   # PENDING | IN_PROGRESS | DELIVERED
  programingDate DateTime
  date           DateTime
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

---

## Migraciones

```bash
# Crear nueva migración
docker compose exec backend pnpm exec prisma migrate dev --name nombre_migracion

# Aplicar migraciones pendientes
docker compose exec backend pnpm exec prisma migrate deploy

# Regenerar cliente Prisma
docker compose exec backend pnpm exec prisma generate
```

---

## Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm run start:dev` | Modo desarrollo con hot-reload |
| `pnpm run build` | Compilar para producción |
| `pnpm run start:prod` | Iniciar build de producción |
| `pnpm run seed` | Poblar DB con 1000 registros de prueba |
| `pnpm run test` | Tests unitarios |
| `pnpm run test:cov` | Tests con cobertura |
| `pnpm run lint` | Linter |
