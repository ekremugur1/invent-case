import "reflect-metadata";

import { container } from "tsyringe";
import { AppModule } from "./api/app/app.module";

const app = container.resolve(AppModule);
app.bootstrap();
