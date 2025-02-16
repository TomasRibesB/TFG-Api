import { Test, TestingModule } from '@nestjs/testing';
import { TipoProfesionalController } from './tipo-profesional.controller';
import { TipoProfesionalService } from './tipo-profesional.service';

describe('TipoProfesionalController', () => {
  let controller: TipoProfesionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoProfesionalController],
      providers: [TipoProfesionalService],
    }).compile();

    controller = module.get<TipoProfesionalController>(TipoProfesionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
