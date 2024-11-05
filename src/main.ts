import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: 'prod.env' });
} else {
  dotenv.config({ path: 'dev.env' });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('/api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000; // Utiliza el puerto definido en la variable de entorno PORT o el puerto 3000 por defecto
  await app.listen(port);

  const server = app.getHttpServer();
  const addressInfo = server.address();

  if (typeof addressInfo === 'string') {
    console.log(`Application is listening on ${addressInfo}`);
  } else {
    console.log(`Application is listening on http://${addressInfo.address}:${addressInfo.port}`);
  }
}
bootstrap();
