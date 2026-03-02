import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

import { AppModule } from "./app.module";
import { configEnvs } from "config/configEnvs";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(cookieParser());

  // CORS Configuration
  const webOrigin = configEnvs.WEB_ORIGIN ?? "http://localhost:5173";

  app.enableCors({
    origin: webOrigin,
    credentials: true
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error if extra fields exist
      transform: true, // auto transforms payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  const port = Number(configEnvs.PORT) || 5000;

  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`🌍 CORS enabled for: ${webOrigin}`);
}

bootstrap().catch((error) => {
  console.error("❌ Failed to start application:", error);
  process.exit(1);
});
