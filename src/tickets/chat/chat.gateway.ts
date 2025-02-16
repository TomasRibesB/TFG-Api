import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { jwtContants } from 'src/auth/constants/jwt.constant';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.server.on('connection', async (socket: Socket) => {
      console.log('New client connected');

      // Extraer y verificar token del handshake
      const token = socket.handshake.auth.token;
      if (!token) {
        console.error('Token no proporcionado');
        return socket.disconnect();
      }
      console.log('Token: ', token);
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: jwtContants.secret,
        });
        // Guardamos la info del usuario en el socket
        socket.data.user = payload;
        console.log('Payload: ', payload);
        console.log(`User ${payload.email} connected`);
      } catch (error) {
        console.error('Token inválido' + error);
        return socket.disconnect();
      }

      socket.on('joinChat', (ticketId: string) => {
        // Aquí puedes agregar lógica para verificar que
        // el usuario (socket.data.user.id) pertenezca al chat
        // (por ejemplo, consultar el ticket en la base de datos)
        socket.join(ticketId);
        console.log(`Socket ${socket.id} joined chat ${ticketId}`);
      });

      socket.on('message', (data) => {
        console.log('Message received: ', data);
        this.server.to(data.ticketId).emit('message', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}