import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const serverOptions: ServerOptions = {
      ...options,
      cors: {
        origin: 'http://localhost:5173', // permite este origen; puedes ajustar según tus necesidades
        methods: ['GET', 'POST'],
        credentials: true,
      },
    };
    return super.createIOServer(port, serverOptions);
  }
}