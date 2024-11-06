import { Controller, Get, Param } from '@nestjs/common';
import { EjerciciosService } from './ejercicios.service';

@Controller('ejercicios')
export class EjerciciosController {
  constructor(private readonly ejerciciosService: EjerciciosService) {}

  /* @Post()
  create(@Body() createEjercicioDto: CreateEjercicioDto) {
    return this.ejerciciosService.create(createEjercicioDto);
  }*/

  @Get()
  findAll() {
    return this.ejerciciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ejerciciosService.findOne(+id);
  }
  /*
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEjercicioDto: UpdateEjercicioDto) {
    return this.ejerciciosService.update(+id, updateEjercicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ejerciciosService.remove(+id);
  }*/
}
