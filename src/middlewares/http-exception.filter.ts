import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorResponse = {
  error?: string;
  message?: string[];
  statusCode?: number;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message: ErrorResponse = exception.getResponse() as ErrorResponse;

    response.status(status).json({
      status,
      code: 1,
      path: request.url,
      message: message.message || exception.message,
    });
  }
}
