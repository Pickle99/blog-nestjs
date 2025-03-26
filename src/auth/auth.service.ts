import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    // private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signup(signupRequest: SignupDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: signupRequest.username },
    });

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    return 'ok';
  }
}
