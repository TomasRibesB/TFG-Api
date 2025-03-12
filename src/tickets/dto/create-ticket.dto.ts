import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoConsentimiento } from '../entities/estadoConsentimiento.enum';

class UserIdDto {
  @IsNotEmpty()
  id: number;
}

export class CreateTicketDto {
  @IsNotEmpty()
  @IsString()
  asunto: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsDateString()
  fechaCreacion: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => UserIdDto)
  solicitante: UserIdDto;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => UserIdDto)
  receptor: UserIdDto;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => UserIdDto)
  usuario: UserIdDto;

  @IsNotEmpty()
  @IsEnum(EstadoConsentimiento)
  consentimientoUsuario: EstadoConsentimiento;

  @IsNotEmpty()
  @IsEnum(EstadoConsentimiento)
  consentimientoReceptor: EstadoConsentimiento;

  @IsNotEmpty()
  @IsEnum(EstadoConsentimiento)
  consentimientoSolicitante: EstadoConsentimiento;
}
