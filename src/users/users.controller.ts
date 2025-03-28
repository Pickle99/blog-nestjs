import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({ summary: 'Register/Create user' })
  @Post('signup')
  async signup(@Body() signupRequest: SignupDto) {
    return this.userService.signup(signupRequest);
  }

  @ApiOperation({ summary: 'Auth/Login user' })
  @Post('login')
  async login(@Body() loginRequest: LoginDto) {
    return this.userService.login(loginRequest);
  }
}
