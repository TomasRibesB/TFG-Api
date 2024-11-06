import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(createRoutineDto);
  }

  @Get(':id')
  findByPlan(@Param('id') id: number) {
    return this.routinesService.findByUser(id);
  }

  @Get('id/:id')
  findById(@Param('id') id: number) {
    return this.routinesService.findById(id);
  }

  @Patch()
  update(@Body() updateRoutineDto: UpdateRoutineDto) {
    return this.routinesService.update(updateRoutineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.routinesService.remove(id);
  }

  @Delete('ejercicio/:routineId/:ejercicioId')
  removeExercise(@Param('routineId') routineId: number, @Param('ejercicioId') ejercicioId: number) {
    return this.routinesService.removeExercise(routineId, ejercicioId);
  }
}
