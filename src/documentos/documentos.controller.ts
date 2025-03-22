// src/documentos/documentos.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  Res,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { PermisoDocumento } from './entities/permisoDocumento.entity';
import { Documento } from './entities/documento.entity';

@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('archivo'))
  create(
    @Req() request: RequestWithUser,
    @Body() createDocumentoDto: CreateDocumentoDto,
  ) {
    // Se asigna el usuario logueado al documento si es necesario
    createDocumentoDto.profesionalId = request.user.id;
    return this.documentosService.create(createDocumentoDto);
  }

  @UseGuards(AuthGuard)
  @Put()
  update(
    @Req() request: RequestWithUser,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
  ) {
    // Se asigna el usuario logueado al documento si es necesario
    updateDocumentoDto.profesionalId = request.user.id;
    return this.documentosService.update(updateDocumentoDto);
  }

  @UseGuards(AuthGuard)
  @Put('archivo/:id')
  @UseInterceptors(FileInterceptor('archivo'))
  uploadDocumentoArchivo(
    @Param('id') id: string,
    @UploadedFile() archivo: Express.Multer.File,
    //@Req() request: RequestWithUser,
  ) {
    return this.documentosService.uploadDocumentoArchivo(+id, archivo.buffer);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.documentosService.remove(+id, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get()
  findByUser(@Req() request: RequestWithUser) {
    return this.documentosService.findByUser(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  findDocumentsFoyProfesionalByUser(
    @Param('userId') userId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.documentosService.findDocumentsFoyProfesionalByUser(
      request.user.id,
      +userId,
    );
  }

  @UseGuards(AuthGuard)
  @Get(':userId/visible')
  findVisibleDocumentsForProfesionalByUser(
    @Param('userId') userId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.documentosService.findVisibleDocumentsForProfesionalByUser(
      request.user.id,
      +userId,
    );
  }

  @UseGuards(AuthGuard)
  @Get('archivo/:id')
  async download(@Param('id') id: string, @Res() res: ExpressResponse) {
    const documento = await this.documentosService.findOneWithArchivo(+id);
    if (!documento || !documento.archivo) {
      return res.status(404).send('Archivo no encontrado');
    }

    const archivo = documento.archivo;
    const headerUtf8 = archivo.slice(0, 4).toString('utf8');
    const headerHex = archivo.slice(0, 4).toString('hex');

    let contentType: string;
    let extension: string;

    if (headerUtf8 === '%PDF') {
      contentType = 'application/pdf';
      extension = 'pdf';
    } else if (headerHex === '89504e47') {
      // PNG: 89 50 4E 47
      contentType = 'image/png';
      extension = 'png';
    } else if (archivo[0] === 0xff && archivo[1] === 0xd8) {
      // JPEG: FF D8
      contentType = 'image/jpeg';
      extension = 'jpeg';
    } else {
      // Valor por defecto en caso de no reconocer el tipo
      contentType = 'application/octet-stream';
      extension = 'bin';
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${documento.titulo}.${extension}"`,
    );
    res.setHeader('Content-Type', contentType);
    res.send(archivo);
  }

  @UseGuards(AuthGuard)
  @Post('permiso')
  async createPermisoDocumento(
    @Req() request: RequestWithUser,
  ): Promise<PermisoDocumento> {
    return await this.documentosService.createPermisoDocumento(request.user.id);
  }

  @Get('permiso/:code')
  async getUserPermisoDocumento(
    @Param('code') code: string,
  ): Promise<PermisoDocumento> {
    return await this.documentosService.getUserPermisoDocumento(code);
  }

  @Post('no-user')
  async createByNoUser(
    @Body('documento') createDocumentoDto: CreateDocumentoDto,
    @Body('code') code: string,
  ): Promise<Documento> {
    return await this.documentosService.createByNoUser(
      createDocumentoDto,
      code,
    );
  }

  @Put('archivo/no-user/:id/:code')
  @UseInterceptors(FileInterceptor('archivo'))
  uploadDocumentoArchivoByNoUse(
    @Param('id') id: string,
    @Param('code') code: string,
    @UploadedFile() archivo: Express.Multer.File,
    //@Req() request: RequestWithUser,
  ) {
    return this.documentosService.uploadDocumentoArchivoByNoUser(
      +id,
      archivo.buffer,
      code,
    );
  }
}
