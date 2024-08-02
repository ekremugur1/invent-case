import cookieParser from "cookie-parser";
import express, { Express, Router } from "express";
import { inject, singleton } from "tsyringe";
import { ConfigService } from "../../config/config.service";
import { TypeORMService } from "../../database/typeorm.service";
import { ErrorBoundary } from "../../middlewares/error.middleware";
import { UserController } from "../user/user.controller";
import { BookController } from "../book/book.controller";
import { RedisService } from "../../database/redis.service";

@singleton()
export class AppModule {
  constructor(
    @inject(ConfigService) private configService: ConfigService,
    @inject(TypeORMService) private typeORMService: TypeORMService,
    @inject(RedisService) private redisService: RedisService,
    @inject(UserController) private userController: UserController,
    @inject(BookController) private bookController: BookController,
  ) {
    this.configService.setTimezone("UTC");
  }

  async bootstrap() {
    const app: Express = express();
    const port = this.configService.get<number>("PORT");

    app.use(express.json());
    app.use(cookieParser());

    app.use(
      (this.userController as UserController & { router: Router }).router
    );

    app.use(
      (this.bookController as BookController & { router: Router }).router
    );

    app.use(new ErrorBoundary().handleRequest);

    app._router.stack.forEach(print.bind(null, []));

    await Promise.all([
      this.typeORMService.dataSource.initialize(),
      this.redisService.connect(),
    ])

    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  }
}

// https://stackoverflow.com/questions/14934452/how-to-get-all-registered-routes-in-express

function print(path: any, layer: any) {
  if (layer.route) {
    layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
  } else if (layer.method) {
    console.log('%s /%s',
      layer.method.toUpperCase(),
      path.concat(split(layer.regexp)).filter(Boolean).join('/'))
  }
}

function split(thing: any) {
  if (typeof thing === 'string') {
    return thing.split('/')
  } else if (thing.fast_slash) {
    return ''
  } else {
    var match = thing.toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
    return match
      ? match[1].replace(/\\(.)/g, '$1').split('/')
      : '<complex:' + thing.toString() + '>'
  }
}