import {
  Injectable,
  ConflictException,
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
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  private generateAccessToken(user: User) {
    const payload = { username: user.username, id: user.id };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }

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
    const accessToken = this.generateAccessToken(newUser);

    return {
      message: 'User created successfully',
      accessToken,
    };
  }

  async login(loginRequest: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginRequest.username },
      select: ['id', 'fullname', 'username', 'password'],
    });

    if (loginRequest.username !== user?.username) {
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

    const accessToken = this.generateAccessToken(user);

    return {
      message: 'User logged in successfully',
      access_token: accessToken,
    };
  }
}
