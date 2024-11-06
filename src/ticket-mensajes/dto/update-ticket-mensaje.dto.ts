import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketMensajeDto } from './create-ticket-mensaje.dto';

export class UpdateTicketMensajeDto extends PartialType(CreateTicketMensajeDto) {}
