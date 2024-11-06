import { Test, TestingModule } from '@nestjs/testing';
import { TicketMensajesController } from './ticket-mensajes.controller';
import { TicketMensajesService } from './ticket-mensajes.service';

describe('TicketMensajesController', () => {
  let controller: TicketMensajesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketMensajesController],
      providers: [TicketMensajesService],
    }).compile();

    controller = module.get<TicketMensajesController>(TicketMensajesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
