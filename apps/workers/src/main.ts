import { NestFactory } from '@nestjs/core';
import { WorkersModule } from './workers.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkersModule);

  const port = process.env.WORKERS_PORT || 4001;
  await app.listen(port);
  console.log(`[Workers] Running on http://localhost:${port}`);
  console.log(`[Workers] Queue processors active`);
}

bootstrap();
