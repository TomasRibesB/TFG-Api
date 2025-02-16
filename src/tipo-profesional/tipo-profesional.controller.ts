import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TipoProfesionalService } from './tipo-profesional.service';
import { CreateTipoProfesionalDto } from './dto/create-tipo-profesional.dto';
import { UpdateTipoProfesionalDto } from './dto/update-tipo-profesional.dto';

@Controller('tipo-profesional')
export class TipoProfesionalController {
  constructor(private readonly tipoProfesionalService: TipoProfesionalService) {}

  @Post()
  create(@Body() createTipoProfesionalDto: CreateTipoProfesionalDto) {
    return this.tipoProfesionalService.create(createTipoProfesionalDto);
  }

  @Get()
  findAll() {
    return this.tipoProfesionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoProfesionalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTipoProfesionalDto: UpdateTipoProfesionalDto) {
    return this.tipoProfesionalService.update(+id, updateTipoProfesionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoProfesionalService.remove(+id);
  }
}
