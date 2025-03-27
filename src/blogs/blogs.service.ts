import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Cache } from 'cache-manager';
import { ILike, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

interface ShowBlogQueryParams {
  title?: string;
  description?: string;
  created_at_sort?: string;
  updated_at_sort?: string;
  user_id?: number;
  author?: string;
}

@Injectable()
export class BlogsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Blog) private blogRepository: Repository<Blog>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async store(blogRequest: CreateBlogDto, user_id: number): Promise<object> {
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

  async getBlogs(query: ShowBlogQueryParams) {
    const {
      title,
      description,
      created_at_sort,
      updated_at_sort,
      user_id,
      author,
    } = query;
    const filters: any = {};

    // Case-insensitive search
    if (title) {
      filters.title = ILike(`%${title}%`);
    }

    if (description) {
      filters.description = ILike(`%${description}%`);
    }

    // Handle sorting by creation date (asc/desc)
    const order: any = {};
    if (created_at_sort) {
      order.created_at =
        created_at_sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    }

    // Handle sorting by updated date (asc/desc)
    if (updated_at_sort) {
      order.updated_at =
        updated_at_sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    }

    // Filtering by user_id
    if (user_id) {
      filters.user_id = user_id;
    }

    if (author) {
      const user = await this.userRepository.findOne({
        where: { username: ILike(`%${author}%`) }, // Approximate match for username
      });

      if (!user) {
        throw new HttpException(
          `User (author) with username '${author}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Filter blogs by the user's ID
      filters.user_id = user.id;
    }

    const blogs = await this.blogRepository.find({
      where: filters,
      order,
      relations: ['user'], // Ensure the related user (author) is included
    });

    // If no blogs found, return 404
    if (blogs.length === 0) {
      throw new HttpException('No blogs found', HttpStatus.NOT_FOUND);
    }

    return blogs;
  }

  async show(id: number): Promise<object> {
    const data = await this.blogRepository.findOne({
      where: {
        id,
      },
      relations: ['user'],
    });
    if (!data) {
      throw new HttpException(
        'No blog found matching given id',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data,
    };
  }

  async update(
    id: number,
    updateBlogRequest: UpdateBlogDto,
    userId: number,
  ): Promise<object> {
    // Find the existing blog by id to ensure it exists
    const existingBlog = await this.blogRepository.findOne({
      where: { id },
    });

    if (existingBlog?.user_id !== userId) {
      throw new HttpException(
        'Updating the blog of another user is forbidden',
        HttpStatus.FORBIDDEN,
      );
    }

    const blogWithAlreadyExistedTitle = await this.blogRepository.findOne({
      where: { title: updateBlogRequest.title },
    });

    if (blogWithAlreadyExistedTitle) {
      throw new HttpException(
        'Blog with title like this already exists',
        HttpStatus.CONFLICT,
      );
    }

    if (!existingBlog) {
      throw new HttpException(
        'Blog with given id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // Prepare the data to update from the request
    const dataToUpdate: Partial<UpdateBlogDto> = {};

    // Only update the fields that are provided in the request
    if (updateBlogRequest.title) {
      dataToUpdate.title = updateBlogRequest.title;
    }
    if (updateBlogRequest.description) {
      dataToUpdate.description = updateBlogRequest.description;
    }

    const updatedBlog = this.blogRepository.merge(existingBlog, dataToUpdate);

    await this.blogRepository.save(updatedBlog);

    return updatedBlog;
  }

  async delete(id: number, userId: number): Promise<object> {
    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new HttpException(
        'Blog with given id not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (blog?.user_id !== userId) {
      throw new HttpException(
        'Deleting the blog of another user is forbidden',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.blogRepository.delete(id);

    return {
      success: true,
      message: `Your blog named ${blog.title} Deleted`,
    };
  }
}
