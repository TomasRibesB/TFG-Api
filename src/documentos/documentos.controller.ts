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
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
//import { UpdateDocumentoDto } from './dto/update-documento.dto';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentosService.create(createDocumentoDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAllByUser(@Req() request: RequestWithUser) {
    return this.documentosService.findByUser(request.user.id);
  }
}
