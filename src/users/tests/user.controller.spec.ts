import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { LoginDto, SignupDto } from '../dto/auth.dto';
import { ConflictException, HttpException } from '@nestjs/common';

describe('UsersController', () => {
  let userController: UsersController;
  let userService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UsersController>(UsersController);
    userService = module.get<UsersService>(UsersService);
  });

  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      const signupRequest: SignupDto = {
        username: 'newuser',
        fullname: 'New User',
        password: 'password123',
      };

      const result = {
        message: 'User created successfully',
        accessToken: 'jwt-token',
      };

      jest.spyOn(userService, 'signup').mockResolvedValue(result);

      expect(await userController.signup(signupRequest)).toEqual(result);
    });

    it('should throw ConflictException if the username is already taken', async () => {
      const signupRequest: SignupDto = {
        username: 'existinguser',
        fullname: 'Existing User',
        password: 'password123',
      };

      const conflictError = new ConflictException('Username is already taken');
      jest.spyOn(userService, 'signup').mockRejectedValue(conflictError);

      await expect(userController.signup(signupRequest)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should successfully log in a user and return the access token', async () => {
      const loginRequest: LoginDto = {
        username: 'existinguser',
        password: 'password123',
      };

      const result = {
        message: 'User logged in successfully',
        access_token: 'jwt-token',
      };

      jest.spyOn(userService, 'login').mockResolvedValue(result);

      expect(await userController.login(loginRequest)).toEqual(result);
    });

    it('should throw HttpException if username or password is incorrect', async () => {
      const loginRequest: LoginDto = {
        username: 'nonexistentuser',
        password: 'wrongpassword',
      };

      const error = new HttpException('Invalid username or password', 400);
      jest.spyOn(userService, 'login').mockRejectedValue(error);

      await expect(userController.login(loginRequest)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
