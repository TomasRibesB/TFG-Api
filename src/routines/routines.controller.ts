import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
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
  create(
    @Req() request: RequestWithUser,
    @Body() createRoutineDto: CreateRoutineDto,
  ) {
    return this.routinesService.create(createRoutineDto, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(
    @Req() request: RequestWithUser,
    @Body() updateRoutineDto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(updateRoutineDto, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.routinesService.remove(+id, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get()
  findByUser(@Req() request: RequestWithUser) {
    return this.routinesService.findByUser(request.user.id) || [];
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findForTrainerByUser(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    return this.routinesService.findForTrainerByUser(request.user.id, +id);
  }
}
