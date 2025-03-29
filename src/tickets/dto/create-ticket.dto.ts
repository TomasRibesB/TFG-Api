import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
}
