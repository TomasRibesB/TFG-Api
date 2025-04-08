import {
  Body,
  Controller,
  Get,
  Param,
  Request,
  Post,
  UseGuards,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import { RegisterProfesionalDto } from './dto/register-profesional.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login-profesional')
  loginProfesional(@Body() loginDto: LoginDto) {
    return this.authService.loginProfesional(loginDto);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-profesional')
  registerProfesional(@Body() registerDto: RegisterProfesionalDto) {
    console.log(registerDto);
    return this.authService.registerProfesional(registerDto);
  }

  @Get('profile/:email')
  @UseGuards(AuthGuard)
  getProfile(@Param('email') email: string, @Request() req) {
    console.log(req.user, req.id);
    return this.authService.getProfile(email);
  }

  @Put('verifyEmail/:token')
  async verifyEmail(@Param('token') token: string) {
    if (!(token.trim().length > 0)) throw new NotFoundException('Token inválido');
    return this.authService.verifyEmail(token);
  }

  //sendPasswordResetEmail
  @Put('sendPasswordResetEmail')
  async sendPasswordResetEmail(@Body('email') email: string) {
    if (!(email.trim().length > 0)) throw new NotFoundException('Email inválido');
    return this.authService.sendPasswordResetEmail(email);
  }

  @Get('verifyPasswordResetToken/:token')
  async verifyPasswordResetToken(@Param('token') token: string) {
    if (!(token.trim().length > 0)) throw new NotFoundException('Token inválido');
    return this.authService.verifyPasswordResetToken(token);
  }

  @Put('resetPassword')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!(token.trim().length > 0)) throw new NotFoundException('Token inválido');
    if (!(newPassword.trim().length > 0))
      throw new NotFoundException('Contraseña inválida');
    return this.authService.resetPassword(token, newPassword);
  }

  @Put('denyPasswordReset')
  async denyPasswordReset(@Body('token') token: string) {
    if (!(token.trim().length > 0)) throw new NotFoundException('Token inválido');
    return this.authService.denyPasswordReset(token);
  }

}
