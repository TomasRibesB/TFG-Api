import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' } 
      // Expiración del token por defecto
      // En el service se cambia dinamicamente por rol
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
