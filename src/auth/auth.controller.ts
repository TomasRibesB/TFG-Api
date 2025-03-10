import { Body, Controller, Get, Param, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    } 

    @Get('profile/:email')
    @UseGuards(AuthGuard)
    getProfile(@Param('email') email: string, @Request() req) {
        console.log(req.user, req.id);
        return this.authService.getProfile(email);
    }
}
