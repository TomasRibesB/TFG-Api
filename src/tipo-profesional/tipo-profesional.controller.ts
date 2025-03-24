import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TipoProfesionalService } from './tipo-profesional.service';
import { CreateTipoProfesionalDto } from './dto/create-tipo-profesional.dto';
import { UpdateTipoProfesionalDto } from './dto/update-tipo-profesional.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('tipo-profesional')
export class TipoProfesionalController {
  constructor(
    private readonly tipoProfesionalService: TipoProfesionalService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTipoProfesionalDto: CreateTipoProfesionalDto) {
    return this.tipoProfesionalService.create(createTipoProfesionalDto);
  }

  @Get()
  findAll() {
    return this.tipoProfesionalService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoProfesionalService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoProfesionalDto: UpdateTipoProfesionalDto,
  ) {
    return this.tipoProfesionalService.update(+id, updateTipoProfesionalDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipoProfesionalService.remove(+id);
  }
}
