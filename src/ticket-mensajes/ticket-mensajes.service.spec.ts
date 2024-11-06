import { Test, TestingModule } from '@nestjs/testing';
import { TicketMensajesService } from './ticket-mensajes.service';

describe('TicketMensajesService', () => {
  let service: TicketMensajesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketMensajesService],
    }).compile();

    service = module.get<TicketMensajesService>(TicketMensajesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
