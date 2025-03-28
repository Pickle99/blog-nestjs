import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CustomExceptionFilter } from './helpers/custom-exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Enable the Dto validations
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription(
      'API Documentation written via swagger for Blog NestJS Project',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Add more pretty way to see validations (to avoid a lot of unnecessary objects/nesting and etc)
  app.useGlobalFilters(new CustomExceptionFilter());
  const port = configService.get<number>('APP_PORT', 8000); // Default to 8000 if PORT is not defined
  await app.listen(port);
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
});
