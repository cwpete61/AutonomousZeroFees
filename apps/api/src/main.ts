import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  const allowedOrigins = [
    process.env.DASHBOARD_URL,
    'http://localhost:3000',
    'http://localhost:30000',
    'http://localhost:30001',
    'http://localhost:20000',
    'http://localhost:20001',
  ].filter((o): o is string => !!o);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  });

  // Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('Web Agency API')
    .setDescription('Autonomous Web Agency System — REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT || 40000;
  await app.listen(port);
  console.log(`[API] Running on http://localhost:${port}`);
  console.log(`[API] Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
