import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogDto } from './create-blog.dto';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @ApiProperty({ example: 'The title of the blog to update' })
  // Made the fields optional, so the validations will apply only if fields is provided, we can update each of the field, or all together
  @IsOptional()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(4, { message: 'Title must be at least 4 characters long' })
  @MaxLength(120, { message: 'Title cannot exceed 120 characters' })
  title?: string;

  @ApiProperty({
    example: 'The description of the blog to update, lorem ipsum dolor dolor',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description?: string;
}
