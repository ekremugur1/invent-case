import { inject, injectable } from "tsyringe";
import { RedisService } from "../database/redis.service";

@injectable()
export class CacheService {
  constructor(
    @inject(RedisService) private redisService: RedisService
  ) { }

  set(key: string, value: any, expiry = 3600) {
    if (!this.redisService.client) {
      return;
    }

    this.redisService.client!.set(key, value, "EX", expiry);
  }

  clear(...keys: string[]) {
    keys.forEach(key => {
      if (!this.redisService.client) {
        return;
      }

      this.redisService.client!.del(key);
    })
  }

  async get(key: string) {
    if (!this.redisService.client) {
      return null;
    }

    return this.redisService.client!.get(key);
  }
}