import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = exception.getResponse();
    const formattedErrors = {};

    // Loop through validation errors
    if (Array.isArray(errorResponse['message'])) {
      errorResponse['message'].forEach((error: ValidationError) => {
        formattedErrors[error.property] = Object.values(
          error.constraints || {},
        );
      });
    }

    // Send the formatted response
    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      error: 'Bad Request',
      message: formattedErrors,
    });
  }
}
