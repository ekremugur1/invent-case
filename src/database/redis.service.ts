import { inject, singleton } from "tsyringe";
import { ConfigService } from "../config/config.service";
import { Redis } from "ioredis";

@singleton()
export class RedisService {
  client: Redis | null = null;

  constructor(@inject(ConfigService) private configService: ConfigService) {
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.client = new Redis({
          host: this.configService.get<string>("REDIS_HOST"),
          port: this.configService.get<number>("REDIS_PORT"),
        });

        this.client.on('connect', () => {
          console.log('Redis client connected');
        });

        this.client.on('ready', () => {
          console.log('Redis client is ready');
          resolve(null);
        });

        this.client.on('error', (error) => {
          console.error('Redis error:', error);
        });

        this.client.on('close', () => {
          console.log('Redis connection closed');
        });
      } catch (e) {
        console.log("An error occured while initializing redis client", e);
        resolve(null);
      }
    })
  }
}
