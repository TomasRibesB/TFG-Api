import { Test, TestingModule } from '@nestjs/testing';
import { TipoProfesionalService } from './tipo-profesional.service';

describe('TipoProfesionalService', () => {
  let service: TipoProfesionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoProfesionalService],
    }).compile();

    service = module.get<TipoProfesionalService>(TipoProfesionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
