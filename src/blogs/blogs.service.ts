import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Blog) private blogRepository: Repository<Blog>,
  ) {}

  async store(blogRequest: CreateBlogDto, user_id: number) {
    const blog = this.blogRepository.create({
      title: blogRequest.title,
      description: blogRequest.description,
      user_id,
    });

    const foundBlog = await this.blogRepository.findOne({
      where: { title: blogRequest.title },
    });

    if (foundBlog) {
      throw new HttpException(
        'Blog with this title already exists',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.blogRepository.save(blog);

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Blog created successfully',
      data: blog,
    };
  }

  findAll() {
    return `This action returns all blogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
