import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto, SignupDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupRequest: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: signupRequest.username },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(signupRequest.password, 10);

    const newUser = this.userRepository.create({
      username: signupRequest.username,
      fullname: signupRequest.fullname,
      password: hashedPassword,
    });

    await this.userRepository.save(newUser);

    // Generate JWT token
    const payload = { username: newUser.username, id: newUser.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'User created successfully',
      accessToken,
    };
  }

  async login(loginRequest: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginRequest.username },
    });

    if (!user) {
      throw new HttpException(
        'Invalid username or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    const passwordMatch = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new HttpException(
        'Invalid username or password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate JWT token
    const payload = { username: user.username, id: user.id };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'User logged in successfully',
      accessToken,
    };
  }
}
