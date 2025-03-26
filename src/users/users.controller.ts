import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotFoundException, Res } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('tipos-profesional')
  getTiposProfesional() {
    return this.usersService.getTiposProfesional();
  }

  @Get('byUser')
  @UseGuards(AuthGuard)
  getUsersByUser(@Req() request: RequestWithUser) {
    return this.usersService.getUserByUser(request.user.id);
  }

  @Get('profesionales/recordatorios')
  @UseGuards(AuthGuard)
  getProfesionalesRecordatorios(@Req() request: RequestWithUser) {
    return this.usersService.getRecordatoriosByProfesional(request.user.id);
  }

  @Get('recordatorios')
  @UseGuards(AuthGuard)
  getRecordatorios(@Req() request: RequestWithUser) {
    return this.usersService.getRecordatoriosByUser(request.user.id);
  }

  @Get('profesionales/tickets/:userId')
  @UseGuards(AuthGuard)
  getProfesionalsByUserForTicketsCreation(
    @Req() request: RequestWithUser,
    @Param('userId') userId: number,
  ) {
    return this.usersService.getProfesionalsByUserForTicketsCreation(
      userId,
      request.user.id,
    );
  }

  @Post('profesionales/certificado')
  @UseInterceptors(FileInterceptor('certificate'))
  uploadCertificado(
    @Body('userTipoProfesionalId') userTipoProfesionalId: number,
    @Body('userId') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !userTipoProfesionalId || !userId) {
      throw new UnauthorizedException('Certificado, userTipoProfesionalId y userId son requeridos');
    }
    return this.usersService.uploadCertificate(userTipoProfesionalId, userId, file.buffer);
  }

  @Get('profesionales')
  @UseGuards(AuthGuard)
  getProfesionalesByUser(@Req() request: RequestWithUser) {
    return this.usersService.getProfesionalesByUser(request.user.id);
  }

  @Get('profesionales/:dni')
  @UseGuards(AuthGuard)
  getUserDNIByProfesional(
    @Req() request: RequestWithUser,
    @Param('dni') dni: string,
  ) {
    return this.usersService.getUserByDNIForProfesional(request.user.id, dni);
  }

  @Get('clientes')
  @UseGuards(AuthGuard)
  getClientesByUser(@Req() request: RequestWithUser) {
    return this.usersService.getUsuariosByProfesional(request.user.id);
  }

  @Get('image/:id')
  async getImage(@Param('id') id: number, @Res() res: ExpressResponse) {
    const user = await this.usersService.findOneImage(id);
    if (!user || !user.image) {
      throw new NotFoundException('Imagen no encontrada');
    }
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(user.image);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch('email')
  @UseGuards(AuthGuard)
  updateEmail(@Req() request: RequestWithUser, @Body('email') email: string) {
    return this.usersService.updateEmail(request.user.id, email);
  }

  @Patch('password')
  @UseGuards(AuthGuard)
  updatePassword(
    @Req() request: RequestWithUser,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.updatePassword(
      request.user.id,
      newPassword,
      oldPassword,
    );
  }

  @Post('profesionales/asignar-usuario')
  @UseGuards(AuthGuard)
  asignarUsuarioAProfesional(
    @Req() request: RequestWithUser,
    @Body('clienteId') userId: number,
  ) {
    return this.usersService.asignarUsuarioAProfesional(
      request.user.id,
      userId,
    );
  }

  @Post('image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Req() request: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      console.log('file');
      throw new BadRequestException('Image is required');
    }
    return this.usersService.uploadImage(request.user.id, file.buffer);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    console.log('id', id);
    return this.usersService.remove(+id);
  }
}
