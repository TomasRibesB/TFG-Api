import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TicketMensajesService } from './ticket-mensajes.service';
import { CreateTicketMensajeDto } from './dto/create-ticket-mensaje.dto';
import { UpdateTicketMensajeDto } from './dto/update-ticket-mensaje.dto';

@Controller('ticket-mensajes')
export class TicketMensajesController {
  constructor(private readonly ticketMensajesService: TicketMensajesService) {}

  @Post()
  create(@Body() createTicketMensajeDto: CreateTicketMensajeDto) {
    return this.ticketMensajesService.create(createTicketMensajeDto);
  }

  @Get()
  findAll() {
    return this.ticketMensajesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketMensajesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketMensajeDto: UpdateTicketMensajeDto) {
    return this.ticketMensajesService.update(+id, updateTicketMensajeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketMensajesService.remove(+id);
  }
}
