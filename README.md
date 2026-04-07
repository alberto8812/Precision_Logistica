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

## Levantar el proyecto

### 1. Variables de entorno

Copiá el template y completá los valores:

```bash
cp .env.template .env
```

Variables requeridas en `.env`:

| Variable | Descripción |
|----------|-------------|
| `PORT_BACKEND` | Puerto del backend (ej: `3000`) |
| `DATABASE_URL` | URL de conexión Prisma |
| `DB_HOST` | Host de PostgreSQL (usar `postgres` dentro de Docker) |
| `DB_PORT` | Puerto interno de PostgreSQL (`5432`) |
| `DB_USERNAME` | Usuario de la base de datos |
| `DB_PASSWORD` | Contraseña de la base de datos |
| `DB_NAME` | Nombre de la base de datos |
| `REDIS_HOST` | Host de Redis (usar `redis` dentro de Docker) |
| `REDIS_PORT` | Puerto de Redis (`6379`) |

### 2. Levantar todo desde el root

```bash
docker compose up -d
```

Esto levanta los tres servicios:

| Servicio | Descripción | Puerto |
|----------|-------------|--------|
| `postgres_transport` | PostgreSQL 16.2 | `5433` (host) |
| `redis_transport` | Redis 7.0 | `6379` |
| `backend` | NestJS (hot-reload) | `3000` |

> Las migraciones de Prisma corren automáticamente al iniciar el contenedor del backend (`entrypoint.dev.sh`).

### 3. Seed (opcional — solo primera vez)

```bash
docker compose exec backend pnpm run seed
```

### Detener los servicios

```bash
docker compose down
```

## Documentación de la API

Swagger disponible en `http://localhost:3000/docs` una vez levantado el servidor.

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
