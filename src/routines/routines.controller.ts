import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(createRoutineDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findByUser(@Param('id') id: number) {
    return this.routinesService.findByUser(id);
  }

  @UseGuards(AuthGuard)
  @Get('id/:id')
  findById(@Param('id') id: number) {
    return this.routinesService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(@Body() updateRoutineDto: UpdateRoutineDto) {
    return this.routinesService.update(updateRoutineDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.routinesService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Delete('ejercicio/:routineId/:ejercicioId')
  removeExercise(@Param('routineId') routineId: number, @Param('ejercicioId') ejercicioId: number) {
    return this.routinesService.removeExercise(routineId, ejercicioId);
  }
}
