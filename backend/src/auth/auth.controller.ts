import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from 'src/dtos/signin.dto';
import { LocalAuthGuard } from './guards/local.guard';
import { Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { UsersService } from 'src/users/users.service';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Body() signInDto: SignInDto) {
    return this.authService.validateUser(signInDto.email, signInDto.password);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Req() req: Request) {
    console.log('AuthController status called');
    console.log(req?.user);
    return req?.user;
  }
}
