import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtContants } from './constants/jwt.constant';

@Module({
  imports: [UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtContants.secret,
      //5 hours
      signOptions: { expiresIn: '5h' },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
