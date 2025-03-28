import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Blogs')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register/Create user' })
  @Post('signup')
  async signup(@Body() signupRequest: SignupDto) {
    return this.authService.signup(signupRequest);
  }

  @ApiOperation({ summary: 'Auth/Login user' })
  @Post('login')
  async login(@Body() loginRequest: LoginDto) {
    return this.authService.login(loginRequest);
  }
}
