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
import { RegisterProfesionalDto } from './dto/register-profesional.dto';
import { Role } from 'src/users/entities/role.enum';

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
      return false;
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

  async loginProfesional(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.email !== loginDto.email) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.role === Role.Usuario) {
      throw new UnauthorizedException('Esta web es solo para profesionales');
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

  formatNombresPropios(nombres: string): string {
    return nombres
      .split(' ')
      .map((nombre) => nombre.charAt(0).toUpperCase() + nombre.slice(1))
      .join(' ')
      .trim();
    // Capitaliza cada nombre propio
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

    registerDto.firstName = this.formatNombresPropios(registerDto.firstName);
    registerDto.lastName = this.formatNombresPropios(registerDto.lastName);
    const plainPassword = registerDto.password;
    await this.usersService.create(registerDto);
    console.log('Usuario creado', registerDto.email, plainPassword);
    return this.login({ email: registerDto.email, password: plainPassword });
  }

  async registerProfesional(registerDto: RegisterProfesionalDto) {
    const user = await this.usersService.findOneByEmail(registerDto.email);
    const userByDni = await this.usersService.findOneByDni(registerDto.dni);
    if (user) {
      throw new BadRequestException('El email ya está registrado');
    }
    if (userByDni) {
      throw new BadRequestException('El DNI ya está registrado');
    }
    registerDto.firstName = this.formatNombresPropios(registerDto.firstName);
    registerDto.lastName = this.formatNombresPropios(registerDto.lastName);
    const plainPassword = registerDto.password;
    const createdUser = await this.usersService.create(registerDto);

    if (
      registerDto.tipoProfesionalIds &&
      registerDto.tipoProfesionalIds.length > 0
    ) {
      await this.usersService.assignTipoProfesionales(
        createdUser.id,
        registerDto.tipoProfesionalIds,
      );
    }

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
