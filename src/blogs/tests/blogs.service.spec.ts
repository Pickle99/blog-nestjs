import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlogsService } from '../blogs.service';
import { Blog } from '../entities/blog.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from '../../users/entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ILike } from 'typeorm';

describe('BlogsService', () => {
  let service: BlogsService;

  const mockBlogsRepository = {
    create: jest.fn().mockImplementation((dto) => ({
      id: Math.floor(Math.random() * 1000),
      ...dto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    save: jest.fn().mockImplementation((blog) =>
      Promise.resolve({
        ...blog,
        id: blog.id || Math.floor(Math.random() * 1000),
        created_at: blog.created_at || new Date().toISOString(),
        updated_at: blog.updated_at || new Date().toISOString(),
      }),
    ),
    findOne: jest.fn().mockResolvedValue(null),
    findAndCount: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    // jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: getRepositoryToken(Blog),
          useValue: mockBlogsRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new blog and return its data', async () => {
    const mockRequest = {
      user: { id: 13 },
    };

    const result = await service.store(
      {
        title: 'Some blog about coding',
        description: 'Existing blog description Existing blog description',
      },
      mockRequest.user.id,
    );

    expect(result).toEqual({
      statusCode: HttpStatus.CREATED,
      message: 'Blog created successfully',
      data: {
        id: expect.any(Number),
        user_id: 13,
        title: 'Some blog about coding',
        description: 'Existing blog description Existing blog description',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      },
    });

    expect(mockBlogsRepository.findOne).toHaveBeenCalledWith({
      where: { title: 'Some blog about coding' },
    });

    expect(mockBlogsRepository.create).toHaveBeenCalledWith({
      title: 'Some blog about coding',
      description: 'Existing blog description Existing blog description',
      user_id: 13,
    });

    expect(mockBlogsRepository.save).toHaveBeenCalled();
  });

  it('should throw an error if a blog with the same title already exists', async () => {
    mockBlogsRepository.findOne.mockResolvedValueOnce({
      id: expect.any(Number),
      user_id: 13,
      title: 'Some blog about coding',
      description: 'Existing blog description Existing blog description',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });

    await expect(
      service.store(
        {
          title: 'Some blog about coding',
          description: 'Existing blog description Existing blog description',
        },
        13,
      ),
    ).rejects.toThrow(
      new HttpException(
        'Blog with this title already exists',
        HttpStatus.FORBIDDEN,
      ),
    );

    expect(mockBlogsRepository.findOne).toHaveBeenCalledWith({
      where: { title: 'Some blog about coding' },
    });

    expect(mockBlogsRepository.create).not.toHaveBeenCalled();
    expect(mockBlogsRepository.save).not.toHaveBeenCalled();
  });

  it('should return paginated blogs', async () => {
    const mockBlogs = [{ id: 1, title: 'First blog', user: { id: 13 } }];
    mockBlogsRepository.findAndCount.mockResolvedValue([mockBlogs, 1]);

    const result = await service.getBlogs({ page: '1', paginate: '10' });

    expect(result).toEqual({
      data: mockBlogs,
      total: 1,
      page: 1,
      paginate: 10,
    });

    expect(mockBlogsRepository.findAndCount).toHaveBeenCalledWith({
      where: {},
      order: {},
      relations: ['user'],
      skip: 0,
      take: 10,
    });
  });

  it('should apply filters for title and description', async () => {
    mockBlogsRepository.findAndCount.mockResolvedValue([[], 0]);

    await expect(
      service.getBlogs({ title: 'test', description: 'coding' }),
    ).rejects.toThrow(
      new HttpException('No blogs found', HttpStatus.NOT_FOUND),
    );

    expect(mockBlogsRepository.findAndCount).toHaveBeenCalledWith({
      where: { title: ILike('%test%'), description: ILike('%coding%') },
      order: {},
      relations: ['user'],
      skip: 0,
      take: 10,
    });
  });

  it('should throw 404 if no blogs found', async () => {
    mockBlogsRepository.findAndCount.mockResolvedValue([[], 0]);

    await expect(service.getBlogs({})).rejects.toThrow(
      new HttpException('No blogs found', HttpStatus.NOT_FOUND),
    );
  });

  it('should filter by author username', async () => {
    mockUserRepository.findOne.mockResolvedValue({ id: 5 });
    mockBlogsRepository.findAndCount.mockResolvedValue([[{ id: 2 }], 1]);

    const result = await service.getBlogs({ author: 'john' });

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { username: ILike('%john%') },
    });

    expect(mockBlogsRepository.findAndCount).toHaveBeenCalledWith({
      where: { user_id: 5 },
      order: {},
      relations: ['user'],
      skip: 0,
      take: 10,
    });

    expect(result.data).toEqual([{ id: 2 }]);
  });

  it('should throw 404 if author not found', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(service.getBlogs({ author: 'unknown' })).rejects.toThrow(
      new HttpException(
        "User (author) with username 'unknown' not found",
        HttpStatus.NOT_FOUND,
      ),
    );

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { username: ILike('%unknown%') },
    });

    expect(mockBlogsRepository.findAndCount).not.toHaveBeenCalled();
  });

  it('should handle sorting by created_at and updated_at', async () => {
    mockBlogsRepository.findAndCount.mockResolvedValue([[{ id: 3 }], 1]);

    const result = await service.getBlogs({
      created_at_sort: 'desc',
      updated_at_sort: 'asc',
    });

    expect(mockBlogsRepository.findAndCount).toHaveBeenCalledWith({
      where: {},
      order: { created_at: 'DESC', updated_at: 'ASC' },
      relations: ['user'],
      skip: 0,
      take: 10,
    });

    expect(result.data).toEqual([{ id: 3 }]);
  });

  it('should update blog successfully', async () => {
    const existingBlog = { id: 1, user_id: 13, title: 'Old Title' };
    mockBlogsRepository.findOne
      .mockResolvedValueOnce(existingBlog)
      .mockResolvedValueOnce(null);
    mockBlogsRepository.merge.mockReturnValue({ id: 1, title: 'New Title' });

    const result = await service.update(1, { title: 'New Title' }, 13);

    expect(mockBlogsRepository.save).toHaveBeenCalled();
    expect(mockCacheManager.del).toHaveBeenCalledWith('all-blogs');
    expect(result).toEqual({ id: 1, title: 'New Title' });
  });

  it("should throw forbidden if updating another user's blog", async () => {
    mockBlogsRepository.findOne.mockResolvedValue({ id: 1, user_id: 12 });

    await expect(service.update(1, {}, 13)).rejects.toThrow(
      new HttpException(
        'Updating the blog of another user is forbidden',
        HttpStatus.FORBIDDEN,
      ),
    );
  });

  it('should throw conflict if title already exists', async () => {
    mockBlogsRepository.findOne
      .mockResolvedValueOnce({ id: 1, user_id: 13 })
      .mockResolvedValueOnce({ id: 2, title: 'Existing Title' });

    await expect(
      service.update(1, { title: 'Existing Title' }, 13),
    ).rejects.toThrow(
      new HttpException(
        'Blog with title like this already exists',
        HttpStatus.CONFLICT,
      ),
    );
  });

  it('should throw not found if blog does not exist', async () => {
    mockBlogsRepository.findOne.mockResolvedValue(null);

    await expect(service.update(1, {}, 13)).rejects.toThrow(
      new HttpException('Blog with given id not found', HttpStatus.NOT_FOUND),
    );
  });

  it('should delete blog successfully', async () => {
    mockBlogsRepository.findOne.mockResolvedValue({
      id: 1,
      user_id: 13,
      title: 'Blog Title',
    });

    const result = await service.delete(1, 13);

    expect(mockBlogsRepository.delete).toHaveBeenCalledWith(1);
    expect(mockCacheManager.del).toHaveBeenCalledWith('all-blogs');
    expect(result).toEqual({
      success: true,
      message: 'Your blog named Blog Title Deleted',
    });
  });

  it('should throw not found if blog does not exist', async () => {
    mockBlogsRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.update(1, {}, 13)).rejects.toThrow(
      new HttpException('Blog with given id not found', HttpStatus.NOT_FOUND),
    );

    expect(mockBlogsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("should throw forbidden if deleting another user's blog", async () => {
    mockBlogsRepository.findOne.mockResolvedValue({ id: 1, user_id: 12 });

    await expect(service.delete(1, 13)).rejects.toThrow(
      new HttpException(
        'Deleting the blog of another user is forbidden',
        HttpStatus.FORBIDDEN,
      ),
    );
  });
});
