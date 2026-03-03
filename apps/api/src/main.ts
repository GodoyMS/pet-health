import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Pet Health API")
    .setDescription(
      "API for the Intelligent Pet Health Awareness & Preventive Care Platform. Supports user authentication, pet profiles, and species reference data. Protected routes require the session cookie set by `POST /auth/login`."
    )
    .setVersion("1.0")
    .addCookieAuth("auth_token")
    .addTag("auth", "Registration, login, logout, and current user")
    .addTag("species", "Species reference (public)")
    .addTag("pets", "Pet profiles (authenticated)")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true
    }
  });

  const port = configEnvs.PORT ? Number(configEnvs.PORT) : 5000;
  await app.listen(port);
}

bootstrap();

