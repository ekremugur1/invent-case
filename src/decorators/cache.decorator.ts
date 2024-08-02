import { container } from "tsyringe";
import { CacheService } from "../cache/cache.service";
import { ErrorBoundary } from "../middlewares/error.middleware";

export const Cache = (ttl = 3600) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const cacheService = container.resolve(CacheService);

    descriptor.value = async function (...args: any[]) {
      const key = `cache:${propertyKey}:${JSON.stringify(args)}`;

      const cachedValue = await cacheService.get(key);

      if (cachedValue) {
        return JSON.parse(cachedValue);
      }

      const result = await originalMethod.apply(this, args);

      cacheService.set(key, JSON.stringify(result), ttl);

      return result;
    };

    return descriptor;
  };
}