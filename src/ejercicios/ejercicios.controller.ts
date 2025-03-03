import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { EjerciciosService } from './ejercicios.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('ejercicios')
export class EjerciciosController {
  constructor(private readonly ejerciciosService: EjerciciosService) {}

  /* @Post()
  create(@Body() createEjercicioDto: CreateEjercicioDto) {
    return this.ejerciciosService.create(createEjercicioDto);
  }*/

  @UseGuards(AuthGuard)
  @Get('relations')
  findRelations() {
    return this.ejerciciosService.findCategoriasAndGruposMusculares();
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(
    @Query('search') search: string,
    @Query('categoria') categoria: string,
    @Query('grupoMuscular') grupoMuscular: string,
  ) {
    return this.ejerciciosService.findAll(search, categoria, grupoMuscular);
  }

  @UseGuards(AuthGuard)
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
