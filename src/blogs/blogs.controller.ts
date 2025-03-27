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
  findAll() {
    return this.blogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(+id, updateBlogDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(+id);
  }
}
