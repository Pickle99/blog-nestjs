import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'The title of the blog !' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(4, { message: 'Title must be at least 4 characters long' })
  @MaxLength(120, { message: 'Title cannot exceed 120 characters' })
  title: string;

  @ApiProperty({
    example:
      'Here will be some kind of description, lorem ipsum dolor dolor dolor',
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
