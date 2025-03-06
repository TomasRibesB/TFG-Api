import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: 'prod.env' });
} else {
  dotenv.config({ path: 'dev.env' });
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SocketIoAdapter } from './adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global HTTP
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
    methods: 'GET,POST,PATCH,PUT,DELETE',
    credentials: true,
  });

  // Usa el adaptador personalizado para WebSockets (Socket.io)
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const server = app.getHttpServer();
  const addressInfo = server.address();

  if (typeof addressInfo === 'string') {
    console.log(`La aplicación está escuchando en ${addressInfo}`);
  } else if (addressInfo) {
    console.log(
      `La aplicación está escuchando en http://${addressInfo.address}:${addressInfo.port}`,
    );
  }
}

bootstrap();