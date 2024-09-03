import { ConfigService } from '@nestjs/config';
import {
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
  createClient,
} from 'redis';

export class RedisService {
  private client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
      },
    });
  }

  public async connect() {
    console.log('Redis connecting');

    const connect = await this.client.connect();
    console.log('Redis connected', connect);
  }

  public async set(key: string, value: string, ex: number): Promise<string> {
    const set = await this.client.set(key, value, { EX: ex });
    return set;
  }

  public async get(key: string): Promise<string> {
    return this.client.get(key);
  }

  public async delete(key: string) {
    return this.client.del(key);
  }
}
