import 'dotenv/config';
import { PrismaClient, status } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import Redis from 'ioredis';

const TOTAL_RECORDS = 1000;
const STATUSES: status[] = [status.PENDING, status.IN_PROGRESS, status.DELIVERED];

const DRIVER_NAMES = [
  'Carlos Rodríguez', 'Martín González', 'Alejandro Pérez', 'Federico López',
  'Diego Fernández', 'Sebastián García', 'Pablo Martínez', 'Rodrigo Sánchez',
  'Nicolás Torres', 'Gastón Ramírez', 'Hernán Flores', 'Matías Díaz',
  'Leandro Moreno', 'Ezequiel Ruiz', 'Andrés Jiménez', 'Lucas Romero',
  'Maximiliano Álvarez', 'Facundo Vargas', 'Tomás Molina', 'Ramiro Castro',
  'Eduardo Ortiz', 'Santiago Suárez', 'Cristian Guerrero', 'Javier Medina',
  'Ignacio Herrera', 'Ariel Aguilar', 'Marcelo Pizarro', 'Hugo Ríos',
  'Roberto Cortés', 'Víctor Mendoza', 'Claudio Vega', 'Jorge Muñoz',
  'Daniel Rojas', 'Antonio Reyes', 'Francisco Cruz', 'Rafael Mora',
  'Sergio Delgado', 'Ricardo Silva', 'Gustavo Campos', 'Mauricio Lara',
  'Emilio Sandoval', 'Gonzalo Espinoza', 'Osvaldo Fuentes', 'Walter Navarro',
  'Mario Salinas', 'Raúl Ibáñez', 'Ernesto Cabrera', 'Darío Contreras',
  'Rubén Heredia', 'Juan Pablo Acosta',
];

function generatePlates(count: number): string[] {
  const plates: string[] = [];
  for (let i = 0; i < count; i++) {
    const digits = String(i).padStart(3, '0');
    plates.push(`AA${digits}BB`);
  }
  return plates;
}

function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not defined');

  const redisHost = process.env.REDIS_HOST ?? 'redis';
  const redisPort = parseInt(process.env.REDIS_PORT ?? '6379');

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  const redis = new Redis({ host: redisHost, port: redisPort });

  try {
    console.log('Limpiando base de datos...');
    await prisma.sheuduling.deleteMany();
    console.log('Base de datos limpia.');

    console.log('Limpiando cache Redis...');
    await redis.flushall();
    console.log('Cache Redis limpio.');

    console.log(`Insertando ${TOTAL_RECORDS} registros...`);

    const plates = generatePlates(TOTAL_RECORDS);
    const rangeStart = new Date('2025-01-01');
    const rangeEnd = new Date('2026-12-31');

    const BATCH_SIZE = 100;
    for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
      const batch = plates.slice(i, i + BATCH_SIZE).map((plate) => {
        const programingDate = randomDate(rangeStart, rangeEnd);
        const date = addDays(programingDate, Math.ceil(Math.random() * 5));
        return {
          driverName: randomElement(DRIVER_NAMES),
          plates: plate,
          status: randomElement(STATUSES),
          programingDate,
          date,
        };
      });

      await prisma.sheuduling.createMany({ data: batch });
      console.log(`  ${Math.min(i + BATCH_SIZE, TOTAL_RECORDS)}/${TOTAL_RECORDS} registros insertados`);
    }

    console.log('Seed completado con exito.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
    await redis.quit();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
