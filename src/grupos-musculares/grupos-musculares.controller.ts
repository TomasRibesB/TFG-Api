import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GruposMuscularesService } from './grupos-musculares.service';
import { CreateGruposMusculareDto } from './dto/create-grupos-musculare.dto';
import { UpdateGruposMusculareDto } from './dto/update-grupos-musculare.dto';

@Controller('grupos-musculares')
export class GruposMuscularesController {
  constructor(private readonly gruposMuscularesService: GruposMuscularesService) {}

  /*@Post()
  create(@Body() createGruposMusculareDto: CreateGruposMusculareDto) {
    return this.gruposMuscularesService.create(createGruposMusculareDto);
  }*/

  @Get()
  findAll() {
    return this.gruposMuscularesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gruposMuscularesService.findOne(+id);
  }

  /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateGruposMusculareDto: UpdateGruposMusculareDto) {
    return this.gruposMuscularesService.update(+id, updateGruposMusculareDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gruposMuscularesService.remove(+id);
  }*/
}
