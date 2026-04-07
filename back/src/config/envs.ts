import 'dotenv/config';
import * as joi from 'joi'

interface EnvConfig {

    PORT: number;
    DATABASE_URL: string;
    DB_HOST: string;
    DB_PORT: number;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    REDIS_HOST: string;
    REDIS_PORT: number;


}

const ensSchema = joi.object({
    PORT: joi.number().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().default(5432),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    REDIS_HOST: joi.string().default('localhost'),
    REDIS_PORT: joi.number().default(6379),
})
    .unknown(true) // allow other keys

const { error, value } = ensSchema.validate(process.env)
if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const envVars: EnvConfig = value;

export const envs = {
    port: envVars.PORT,
    databaseUrl: envVars.DATABASE_URL,
    host: envVars.DB_HOST,
    dbport: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    redisHost: envVars.REDIS_HOST,
    redisPort: envVars.REDIS_PORT,


}