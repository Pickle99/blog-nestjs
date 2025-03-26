import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './helpers/custom-exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Enable the Dto validations
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );
  // Add more pretty way to see validations
  app.useGlobalFilters(new CustomExceptionFilter());
  const port = configService.get<number>('APP_PORT', 8000); // Default to 8000 if PORT is not defined
  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
});
