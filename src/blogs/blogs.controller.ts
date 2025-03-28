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
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @ApiOperation({ summary: 'Create the blog' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogRequest: CreateBlogDto, @Req() req: Request) {
    const user = req.user;
    return this.blogsService.store(blogRequest, user.id);
  }

  @ApiOperation({ summary: 'Retrieve the blogs, with filters possibility' })
  @ApiQuery({ name: 'title', required: false, example: 'SomeTitle' })
  @ApiQuery({
    name: 'description',
    required: false,
    example: 'BriefDescription',
  })
  @ApiQuery({ name: 'created_at_sort', required: false, example: 'asc' })
  @ApiQuery({ name: 'updated_at_sort', required: false, example: 'desc' })
  @ApiQuery({ name: 'user_id', required: false, example: 42 })
  @ApiQuery({ name: 'author', required: false, example: 'Maximilian59' })
  @ApiQuery({ name: 'paginate', required: false, example: '10' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @Get()
  @CacheKey('blogs')
  async getBlogs(
    @Query('title') title?: string,
    @Query('description') description?: string,
    @Query('created_at_sort') created_at_sort?: string,
    @Query('updated_at_sort') updated_at_sort?: string,
    @Query('user_id') user_id?: number,
    @Query('author') author?: string,
    @Query('paginate') paginate?: string,
    @Query('page') page?: string,
  ) {
    const blogs = await this.blogsService.getBlogs({
      title,
      description,
      created_at_sort,
      updated_at_sort,
      user_id,
      author,
      paginate,
      page,
    });

    return {
      message: 'Blogs retrieved successfully',
      data: blogs,
    };
  }

  @ApiOperation({ summary: 'Retrieve all the blogs, in cached way' })
  @UseInterceptors(CacheInterceptor)
  // with using the interceptor, current request will be cached manually after first request
  @Get('all')
  @CacheKey('all-blogs')
  getAllBlogs() {
    return this.blogsService.getAllBlogs();
  }

  @ApiOperation({ summary: 'Retrieve the single blog' })
  @Get(':id')
  show(@Param('id') id: string) {
    return this.blogsService.show(+id); // Wrote `+` to transform string to number for function inside service. Keeping it as a string for request is easier
  }

  @ApiOperation({ summary: 'Update the blog' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id') // Using Patch here instead of Put, since Patch request used to Update the fields, while Put creates or replaces the fields/data entirely
  update(
    @Param('id') id: string,
    @Body() updateBlogRequest: UpdateBlogDto,
    @Req() req: Request,
  ) {
    const user = req.user;
    return this.blogsService.update(+id, updateBlogRequest, user.id);
  }

  @ApiOperation({ summary: 'Delete the blog' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user;
    return this.blogsService.delete(+id, user.id);
  }
}
