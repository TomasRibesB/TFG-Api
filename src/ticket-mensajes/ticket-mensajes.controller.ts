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
import { TicketMensajesService } from './ticket-mensajes.service';
import { CreateTicketMensajeDto } from './dto/create-ticket-mensaje.dto';
import { UpdateTicketMensajeDto } from './dto/update-ticket-mensaje.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('ticket-mensajes')
export class TicketMensajesController {
  constructor(private readonly ticketMensajesService: TicketMensajesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTicketMensajeDto: CreateTicketMensajeDto) {
    return this.ticketMensajesService.create(createTicketMensajeDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.ticketMensajesService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketMensajesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketMensajeDto: UpdateTicketMensajeDto,
  ) {
    return this.ticketMensajesService.update(+id, updateTicketMensajeDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketMensajesService.remove(+id);
  }
}
