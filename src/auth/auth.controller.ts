import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupRequest: SignupDto) {
    return this.authService.signup(signupRequest);
  }

  @Post('login')
  async login(@Body() loginRequest: LoginDto) {
    return this.authService.login(loginRequest);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('test')
  // async login4(@Body() loginRequest: LoginDto) {
  //   return this.authService.bad(loginRequest);
  // }
}
