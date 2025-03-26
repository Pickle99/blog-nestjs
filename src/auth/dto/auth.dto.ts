import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(4, { message: 'Username must be at least 4 characters long' })
  @MaxLength(24, { message: 'Username cannot exceed 24 characters' })
  username: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  @MinLength(4, { message: 'First name must be at least 4 characters long' })
  @MaxLength(24, { message: 'First name cannot exceed 24 characters' })
  firstname: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(4, { message: 'Password must be at least 4 characters long' })
  @MaxLength(255, { message: 'Password cannot exceed 255 characters' })
  password: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
}
