import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from 'src/config/envs';


@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisCacheService.name);
    private client: Redis;

    onModuleInit(): void {
        this.client = new Redis({
            host: envs.redisHost,
            port: envs.redisPort,
        });
        this.client.on('connect', () => this.logger.log('Redis connected'));
        this.client.on('error', (err) => this.logger.error('Redis error', err));
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.quit();
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.set(key, serialized, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, serialized);
        }
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async deleteByPattern(pattern: string): Promise<void> {
        let cursor = '0';
        do {
            const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
            cursor = nextCursor;
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        } while (cursor !== '0');
    }
}