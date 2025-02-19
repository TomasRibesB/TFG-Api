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

      socket.on('joinChat', async (ticketId: string) => {
        console.log('Joining chat', ticketId);
        // Obtener el ticket de la base de datos (asegúrate de implementarlo en ChatService)
        const ticket = await this.chatService.getTicket(ticketId);
        const userId = socket.data.user.id;

        // Validar que el usuario sea solicitante, receptor o usuario del ticket
        if (
          ticket.solicitante.id === userId ||
          ticket.receptor.id === userId ||
          ticket.usuario.id === userId
        ) {
          socket.join(ticketId);
          console.log(`Socket ${socket.id} joined chat ${ticketId}`);
        } else {
          console.error(`User ${userId} not authorized for chat ${ticketId}`);
          socket.emit('unauthorized', {
            message: 'No tienes permisos para este chat',
          });
          socket.disconnect();
        }
      });

      socket.on('message', async (data) => {
        try {
          console.log('Message received: ', data);

          // 1. Guardar en la base de datos
          const savedMessage = await this.chatService.saveMessage(data);

          // 2. Reemitir el mensaje guardado (ahora con ID de la DB, etc.)
          //    Nota: data.ticketId debe ser data.ticket.id o similar
          const ticketId = data.ticket?.id;
          this.server.to(String(ticketId)).emit('message', savedMessage);
        } catch (error) {
          console.error('Error al guardar mensaje:', error);
          socket.emit('errorSavingMessage', { error: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }
}
