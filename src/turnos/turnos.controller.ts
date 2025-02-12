import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { UpdateTurnoDto } from './dto/update-turno.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAllByUser(@Req() request: RequestWithUser) {
    return this.turnosService.findByUser(request.user.id);
  }
}
