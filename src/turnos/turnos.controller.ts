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
  Put,
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

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() createTurnoDto: CreateTurnoDto,
    @Req() request: RequestWithUser,
  ) {
    return this.turnosService.create(createTurnoDto, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Put('asignar/:id')
  asignarTurnoCliente(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    console.log('asignarTurnoCliente');
    return this.turnosService.asignarTurnoForPaciente(
      parseInt(id),
      request.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Put('cancelar/:id')
  cancelarTurnoCliente(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ) {
    return this.turnosService.cancelarTurnoForPaciente(
      parseInt(id),
      request.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Patch()
  update(
    @Body() updateTurnoDto: UpdateTurnoDto,
    @Req() request: RequestWithUser,
  ) {
    return this.turnosService.update(
      updateTurnoDto.id,
      updateTurnoDto,
      request.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.turnosService.remove(parseInt(id), request.user.id);
  }
}
