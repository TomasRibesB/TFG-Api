import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Use the UsersService type instead of value
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.email !== loginDto.email) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const isPasswordValid = await bcryptjs.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      console.log('Password incorrecto');
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    let payload: any = {
      firstName: user.firstName,
      lastName: user.lastName,
      dni: user.dni,
      email: user.email,
      role: user.role,
      id: user.id,
      hasImage: user.hasImage,
    };

    if (user.userTipoProfesionales.length > 0) {
      payload = {
        ...payload,
        userTipoProfesionales: user.userTipoProfesionales,
      };
    }

    const token = await this.jwtService.signAsync(payload);

    payload = { ...payload, token } as typeof payload & { token: string };

    return payload;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.findOneByEmail(registerDto.email);
    const userByDni = await this.usersService.findOneByDni(registerDto.dni);
    if (user) {
      throw new BadRequestException('El email ya está registrado');
    }
    if (userByDni) {
      throw new BadRequestException('El DNI ya está registrado');
    }
    const plainPassword = registerDto.password;
    await this.usersService.create(registerDto);
    console.log('Usuario creado', registerDto.email, plainPassword);
    return this.login({ email: registerDto.email, password: plainPassword });
  }

  async getProfile(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
