import {
  Controller,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  Put,
  Post,
  Delete,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
import { EstadoConsentimiento } from './entities/estadoConsentimiento.enum';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(AuthGuard)
  @Get()
  findAllByUser(@Req() request: RequestWithUser) {
    return this.ticketsService.findTicketsByUser(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketsService.findTicketById(+id, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Put()
  update(
    @Req() request: RequestWithUser,
    @Body()
    {
      ticketId,
      estadoConsentimiento,
    }: { ticketId: number; estadoConsentimiento: EstadoConsentimiento },
  ) {
    return this.ticketsService.updateTicketConsentimiento(
      request.user.id,
      ticketId,
      estadoConsentimiento,
    );
  }

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() request: RequestWithUser,
    @Body('ticket') createTicketDto: CreateTicketDto,
  ) {
    return this.ticketsService.createTicket(request.user.id, createTicketDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.ticketsService.bajaTicket(request.user.id, +id);
  }
}
