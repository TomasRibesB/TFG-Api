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
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';
import { AuthEmailNotificationService } from './auth.email.notification.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Use the UsersService type instead of value
    private readonly jwtService: JwtService,
    private readonly authEmailNotificationService: AuthEmailNotificationService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (!user.isVerified) {
      console.log('Usuario no verificado');
      throw new UnauthorizedException(
        'Debe verificar su cuenta, revise su email',
      );
    }

    if (user.deletedAt) {
      console.log('Usuario eliminado');
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.email !== loginDto.email) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.role !== Role.Usuario) {
      throw new UnauthorizedException('Esta aplicación es solo para usuarios');
    }

    if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
      console.log('Usuario bloqueado hasta', user.lockUntil);
      throw new UnauthorizedException(
        'Cuenta bloqueada. Intente de nuevo más tarde',
      );
    }

    const isPasswordValid = await bcryptjs.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      await this.usersService.incrementLoginAttempts(user.id);

      const updatedUser = await this.usersService.findOneByEmail(
        loginDto.email,
        true,
      );
      if (updatedUser.loginAttempts >= 5) {
        const lockUntil = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hora
        await this.usersService.setLockUntil(user.id, lockUntil);
        console.log('Usuario bloqueado por 1 hora');
      }
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    await this.usersService.resetLoginAttempts(user.id);

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

    const expiresIn = '30d'; // Para usuarios
    const token = await this.jwtService.signAsync(payload, { expiresIn });

    payload = { ...payload, token } as typeof payload & { token: string };

    return payload;
  }

  async loginProfesional(loginDto: LoginDto) {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (!user.isVerified) {
      console.log('Usuario no verificado');
      throw new UnauthorizedException(
        'Debe verificar su cuenta, revise su email',
      );
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.email !== loginDto.email) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (user.role === Role.Usuario) {
      throw new UnauthorizedException('Esta web es solo para profesionales');
    }

    if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
      console.log('Usuario profesional bloqueado hasta', user.lockUntil);
      throw new UnauthorizedException(
        'Cuenta bloqueada. Intente de nuevo más tarde',
      );
    }

    const isPasswordValid = await bcryptjs.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      await this.usersService.incrementLoginAttempts(user.id);

      const updatedUser = await this.usersService.findOneByEmail(
        loginDto.email,
        true,
      );
      if (updatedUser.loginAttempts >= 5) {
        const lockUntil = new Date(new Date().getTime() + 60 * 60 * 1000); // Bloqueo por 1 hora
        await this.usersService.setLockUntil(user.id, lockUntil);
        console.log('Usuario profesional bloqueado por 1 hora');
      }
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    await this.usersService.resetLoginAttempts(user.id);

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

    const expiresIn = '8h'; // Expiración para profesionales
    const token = await this.jwtService.signAsync(payload, { expiresIn });
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
    console.log('user', user, userByDni);
    if (user) {
      console.log('El email ya está registrado');
      return false;
    }
    if (userByDni) {
      console.log('El DNI ya está registrado');
      return false;
    }

    registerDto.firstName = this.formatNombresPropios(registerDto.firstName);
    registerDto.lastName = this.formatNombresPropios(registerDto.lastName);
    const plainPassword = registerDto.password;
    const userToCreate = new User();
    Object.assign(userToCreate, registerDto);
    userToCreate.emailVerificationToken = uuidv4();
    console.log('userToCreate', userToCreate);
    await this.usersService.create(userToCreate);
    await this.authEmailNotificationService.sendValidationEmail(
      registerDto.email,
      userToCreate.emailVerificationToken,
    );
    console.log('Usuario creado', registerDto.email, plainPassword);
    return true;
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
    const userToCreate = new User();
    Object.assign(userToCreate, registerDto);
    userToCreate.emailVerificationToken = uuidv4();
    console.log('userToCreate', userToCreate);
    const createdUser = await this.usersService.create(userToCreate);
    await this.authEmailNotificationService.sendValidationEmail(
      registerDto.email,
      userToCreate.emailVerificationToken,
    );

    await this.usersService.assignTipoProfesionales(
      createdUser.id,
      registerDto.tipoProfesionalIds ?? [],
    );

    console.log('Usuario creado', registerDto.email, plainPassword);
    return this.usersService.findOne(createdUser.id);
  }

  async getProfile(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findOneByEmailVerificationToken(token);
    if (!user) {
      return false;
    }
    await this.usersService.updateUserVerificationToken(user.id);
    await this.authEmailNotificationService.sendValidationSuccessEmail(
      user.email,
    );

    return true;
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      return false;
    }
    if (user.deletedAt) {
      return false;
    }
    const token = uuidv4();
    await this.usersService.setPasswordResetToken(user.id, token);
    await this.authEmailNotificationService.sendPasswordResetEmail(
      user.email,
      token,
    );
    return true;
  }

  async verifyPasswordResetToken(token: string) {
    const user =
      await this.usersService.findOneByEmailPasswordResetToken(token);
    if (!user) {
      console.log('Token no encontrado');
      return false;
    }
    if (user.deletedAt) {
      console.log('Cuenta eliminada');
      return false;
    }
    console.log('Token válido');
    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    const user =
      await this.usersService.findOneByEmailPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException('Invalid token');
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    await this.usersService.updateUserResetPasswordToken(
      user.id,
      hashedPassword,
    );
    await this.authEmailNotificationService.confirmPasswordResetEmail(
      user.email,
    );

    return { message: 'Password reset successfully' };
  }

  async denyPasswordReset(token: string) {
    const user =
      await this.usersService.findOneByEmailPasswordResetToken(token);
    if (!user) {
      return false;
    }
    await this.usersService.denyPasswordResetToken(user.id);
    await this.authEmailNotificationService.denyPasswordResetEmail(user.email);
    return true;
  }
}
