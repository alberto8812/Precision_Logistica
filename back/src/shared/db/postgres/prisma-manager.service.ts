import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "generated/prisma/client";
import { envs } from '../../../config/envs';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";


@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly client: PrismaClient;

    constructor(
    ) {
        const pool = new Pool({ connectionString: envs.databaseUrl });
        const adapter = new PrismaPg(pool, { schema: 'public' });
        this.client = new PrismaClient({ adapter });

    }

    async onModuleInit() {
        await this.client.$connect();
    }

    async onModuleDestroy() {
        await this.client.$disconnect();
    }

    get sheuduling() {
        return this.client.sheuduling;
    }

}