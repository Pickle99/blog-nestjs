import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(4, { message: 'Title must be at least 4 characters long' })
  @MaxLength(120, { message: 'Title cannot exceed 120 characters' })
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
