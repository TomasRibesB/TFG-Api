import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { RutinaEjercicioService } from './rutina-ejercicio.service';
import { CreateRutinaEjercicioDto } from './dto/create-rutina-ejercicio.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
@Controller('ejercicio-rutina')
export class RutinaEjercicioController {
  constructor(
    private readonly ejercicioRegistroService: RutinaEjercicioService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRutinaEjercicioDto: CreateRutinaEjercicioDto) {
    return this.ejercicioRegistroService.create(createRutinaEjercicioDto);
  }

  @UseGuards(AuthGuard)
  @Post('registro')
  createRegistro(@Body('RuExIds') RuExIds: number[]) {
    return this.ejercicioRegistroService.createRegistros(RuExIds);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAllByUser(@Req() request: RequestWithUser) {
    return this.ejercicioRegistroService.findAllByUser(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ejercicioRegistroService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Get('routine/:id/ejercicio/:id/last')
  findLastRutinaEjercicio(@Param('id') id: string) {
    return this.ejercicioRegistroService.findLastRutinaEjercicio(+id);
  }

  @UseGuards(AuthGuard)
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
