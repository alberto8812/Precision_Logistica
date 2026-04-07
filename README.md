# Precision Logística

Sistema de gestión y programación de despachos logísticos. Permite registrar, consultar y actualizar el estado de los viajes asignados a conductores, con validación de placas colombianas y soporte de caché para optimizar el rendimiento.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | NestJS + TypeScript |
| Base de datos | PostgreSQL 16.2 |
| Caché | Redis 7.0 |
| ORM | Prisma |
| Package manager | pnpm |
| Contenedores | Docker + Docker Compose |

## Arquitectura

El backend sigue **Clean Architecture** con separación en tres capas por módulo:

```
src/modules/{module}/
├── domain/           # Modelos, interfaces de repositorio, validadores
├── aplication/       # Casos de uso y DTOs
└── infrastructure/   # Controladores HTTP y repositorios (Prisma)
```

La validación de placas usa el patrón **Strategy**, permitiendo intercambiar formatos vía inyección de dependencias.

## Módulos

- **scheduling** — Programación de despachos: creación, consulta paginada y actualización de estado (`PENDING` → `IN_PROGRESS` → `DELIVERED`)

## Prerrequisitos

- Docker y Docker Compose
- Node.js 20+
- pnpm

## Levantar el proyecto

### 1. Variables de entorno

```bash
cp back/.env.example back/.env
# Editar back/.env con los valores correspondientes
```

### 2. Infraestructura (PostgreSQL + Redis + Backend)

```bash
docker compose up -d
```

Esto levanta:
- `postgres_transport` en el puerto `5433`
- `redis_transport` en el puerto `6379`
- `backend` (NestJS en modo desarrollo con hot-reload)

### 3. Migraciones y seed (primera vez)

```bash
# Dentro del contenedor del backend o con pnpm local
pnpm --prefix back prisma migrate dev
pnpm --prefix back run seed
```

## Desarrollo local (sin Docker para el backend)

```bash
cd back
pnpm install
pnpm start:dev
```

> La base de datos y Redis deben estar corriendo. Podés levantarlos solos con `docker compose up postgres redis -d`.

## Scripts disponibles (back/)

| Comando | Descripción |
|---------|-------------|
| `pnpm start:dev` | Servidor con hot-reload |
| `pnpm build` | Compilación para producción |
| `pnpm test` | Tests unitarios |
| `pnpm test:cov` | Tests con cobertura |
| `pnpm lint` | Linter + autofix |
| `pnpm run seed` | Poblar base de datos |

## Documentación de la API

Swagger disponible en `http://localhost:{PORT}/api` una vez levantado el servidor.

## Estructura del repositorio

```
Precision_Logistica/
├── back/                  # API NestJS
│   ├── prisma/            # Schema y migraciones
│   ├── src/
│   │   ├── modules/       # Módulos de negocio
│   │   └── shared/        # DB, caché, DTOs compartidos
│   └── compose.yml        # Servicio backend
├── scripts/
│   └── init-databases.sql # Script de inicialización de PostgreSQL
└── compose.yml            # Orquestación completa (infra + backend)
```
