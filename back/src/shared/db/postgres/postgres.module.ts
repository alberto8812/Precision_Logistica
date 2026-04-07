import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma-manager.service';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class DatabaseModule { }