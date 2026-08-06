import "reflect-metadata";
import { join } from "path";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { configEnvs } from "config/configEnvs";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Fail before the DataSource connects, so a misconfigured deployment reports
  // the missing variable instead of a connection or 500 error later.
  for (const warning of configEnvs.validateConfig()) {
    logger.warn(warning);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());

  // Serves apps/api/public (e.g. species reference images) at /static/*.
  // Works in both dev (__dirname = apps/api/src) and prod (__dirname =
  // apps/api/dist), since "public" sits one level up from both.
  app.useStaticAssets(join(__dirname, "..", "public"), {
    prefix: "/static/",
    maxAge: "1d"
  });

  app.enableCors({
    origin: configEnvs.corsOrigins,
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
    .addTag(
      "auth",
      "Registration, email MFA verification, login, password reset, logout, and current user"
    )
    .addTag("species", "Species reference (public)")
    .addTag("pets", "Pet profiles (authenticated)")
    .addTag("admin", "Backoffice endpoints (admin role required)")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api-docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true
    }
  });

  const port = configEnvs.PORT ? Number(configEnvs.PORT) : 5000;
  // Bind all interfaces so container platforms (Railway) can reach the process.
  await app.listen(port, "0.0.0.0");
  logger.log(`API listening on port ${port}`);
}

bootstrap();

