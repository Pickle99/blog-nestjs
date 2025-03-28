import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto, SignupDto } from '../dto/auth.dto';
import { ConflictException, HttpException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

      jest.spyOn(authService, 'signup').mockResolvedValue(result);

      expect(await authController.signup(signupRequest)).toEqual(result);
    });

    it('should throw ConflictException if the username is already taken', async () => {
      const signupRequest: SignupDto = {
        username: 'existinguser',
        fullname: 'Existing User',
        password: 'password123',
      };

      const conflictError = new ConflictException('Username is already taken');
      jest.spyOn(authService, 'signup').mockRejectedValue(conflictError);

      await expect(authController.signup(signupRequest)).rejects.toThrow(
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

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await authController.login(loginRequest)).toEqual(result);
    });

    it('should throw HttpException if username or password is incorrect', async () => {
      const loginRequest: LoginDto = {
        username: 'nonexistentuser',
        password: 'wrongpassword',
      };

      const error = new HttpException('Invalid username or password', 400);
      jest.spyOn(authService, 'login').mockRejectedValue(error);

      await expect(authController.login(loginRequest)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
