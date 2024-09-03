import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

const redisService = {
  provide: 'RedisService',
  useFactory: async (configService: ConfigService) => {
    const redisService = new RedisService(configService);
    await redisService.connect();
    return redisService;
  },
};

@Module({
  providers: [redisService],
  exports: ['RedisService'],
  imports: [ConfigModule],
})
export class RedisModule {}
