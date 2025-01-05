import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  controllers: [TicketsController],
  providers: [TicketsService],
  imports: [ChatModule],
})
export class TicketsModule {}
