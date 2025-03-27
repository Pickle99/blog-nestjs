import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
  paginate?: string;
  page?: string;
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
      paginate = 10, // Default pagination to 10
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

    if (updated_at_sort) {
      order.updated_at =
        updated_at_sort.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    }

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

      filters.user_id = user.id;
    }

    const page = Number(query.page) || 1; // Default to page 1 if no page is specified
    const take = Number(paginate); // Default to 10 if paginate is not provided
    const skip = (page - 1) * take;

    const [blogs, total] = await this.blogRepository.findAndCount({
      where: filters,
      order,
      relations: ['user'], // Ensure the related user (author) is included
      skip,
      take,
    });

    // If no blogs found, return 404
    if (blogs.length === 0) {
      throw new HttpException('No blogs found', HttpStatus.NOT_FOUND);
    }

    // Return paginated blogs along with total count for pagination info
    return {
      data: blogs,
      total,
      page,
      paginate: take,
    };
  }

  async getAllBlogs(): Promise<object> {
    const blogs = await this.blogRepository.find({
      relations: ['user'],
    });

    if (!blogs) {
      throw new HttpException('There is no blogs yet', HttpStatus.NOT_FOUND);
    }

    return {
      blogs,
    };
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

    await this.cacheManager.del('all-blogs');

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

    await this.cacheManager.del('all-blogs');

    return {
      success: true,
      message: `Your blog named ${blog.title} Deleted`,
    };
  }
}
