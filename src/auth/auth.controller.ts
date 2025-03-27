import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

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
}
