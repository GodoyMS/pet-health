import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { configEnvs } from "config/configEnvs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: configEnvs.WEB_ORIGIN ?? "http://localhost:5173",
    credentials: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const port = configEnvs.PORT ? Number(configEnvs.PORT) : 5000;
  await app.listen(port);
}

bootstrap();

