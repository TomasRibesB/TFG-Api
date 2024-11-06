import { Controller, Get, Param,  } from '@nestjs/common';
import { CategoriaEjerciciosService } from './categoria-ejercicios.service';

@Controller('categorias-ejercicios')
export class CategoriaEjerciciosController {
  constructor(private readonly categoriaEjerciciosService: CategoriaEjerciciosService) {}

  /*@Post()
  create(@Body() createCategoriaEjercicioDto: CreateCategoriaEjercicioDto) {
    return this.categoriaEjerciciosService.create(createCategoriaEjercicioDto);
  }
*/
  @Get()
  findAll() {
    return this.categoriaEjerciciosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaEjerciciosService.findOne(+id);
  }
/*
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaEjercicioDto: UpdateCategoriaEjercicioDto) {
    return this.categoriaEjerciciosService.update(+id, updateCategoriaEjercicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaEjerciciosService.remove(+id);
  }*/
}
