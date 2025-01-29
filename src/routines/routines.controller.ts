import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto) {
    return this.routinesService.create(createRoutineDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findByUser(@Req() request: RequestWithUser) {
    return this.routinesService.findByUser(request.user.id);
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
