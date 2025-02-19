import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';

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
}
