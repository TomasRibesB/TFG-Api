import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;
  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {
      this.server.on('connection', (socket: Socket) => {
        console.log('New client connected');
        socket.on('message', (data) => {
          console.log('Message received: ', data);
          this.server.emit('message', data);
        });
        socket.on('disconnect', () => {
          console.log('Client disconnected');
        });
      }
    );
  }
}