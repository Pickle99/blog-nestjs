import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Request } from 'express';

@UseInterceptors(CacheInterceptor)
// with using the interceptor, Get requests will be cached manually after first request
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogRequest: CreateBlogDto, @Req() req: Request) {
    const user = req.user;
    return this.blogsService.store(blogRequest, user.id);
  }

  @Get()
  async getBlogs(
    @Query('title') title?: string,
    @Query('description') description?: string,
    @Query('created_at_sort') created_at_sort?: string,
    @Query('updated_at_sort') updated_at_sort?: string,
    @Query('user_id') user_id?: number,
    @Query('author') author?: string,
  ) {
    const blogs = await this.blogsService.getBlogs({
      title,
      description,
      created_at_sort,
      updated_at_sort,
      user_id,
      author,
    });

    return {
      message: 'Blogs retrieved successfully',
      data: blogs,
    };
  }

  @Get(':id')
  show(@Param('id') id: string) {
    return this.blogsService.show(+id); // Wrote `+` to transform string to number for function inside service. Keeping it as a string for request is easier
  }

  // Using Patch here instead of Put, since Patch request used to Update the fields, while Put creates or replaces the fields/data entirely
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(+id, updateBlogDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.delete(+id);
  }
}
