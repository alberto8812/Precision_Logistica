import { Module } from '@nestjs/common';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { DatabaseModule } from './shared/db/postgres/postgres.module';
import { CacheModule } from './shared/db/redis/cache.module';

@Module({
  imports: [DatabaseModule, CacheModule, SchedulingModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
