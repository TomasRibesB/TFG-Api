import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';


@Controller('ejercicio-rutina')
export class RutinaEjercicioController {
  constructor(private readonly ejercicioRegistroService: RutinaEjercicioService) {}

  @Post()
  create(@Body() createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.ejercicioRegistroService.create(createRutinaEjercicioDto);
  }

  @Get()
  findAll() {
    return this.ejercicioRegistroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ejercicioRegistroService.findOne(+id);
  }

  @Get('routine/:id/ejercicio/:id/last')
  findLastRutinaEjercicio(@Param('id') id: string) {
    return this.ejercicioRegistroService.findLastRutinaEjercicio(+id);
  }

  @Get('routine/:rid/ejercicio/:eid')
  findRutinaEjercicio(@Param('rid') rid: string, @Param('eid') eid: string) {
    return this.ejercicioRegistroService.findRutinaEjercicio(+rid, +eid);
  }



  /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateRutinaEjercicioDto: UpdateRutinaEjercicioDto) {
    return this.ejercicioRegistroService.update(+id, updateRutinaEjercicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ejercicioRegistroService.remove(+id);
  }*/
}
