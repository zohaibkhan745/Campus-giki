import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.getHeader('content-type')?.toString().includes('text/calendar')) {
      return next.handle() as Observable<any>;
    }

    return next.handle().pipe(
      map((data: T): ApiResponse<T> => {
        let message = 'Request processed successfully';
        let resultData: T = data;

        if (typeof data === 'object' && data !== null) {
          const dataObj = data as Record<string, unknown>;
          if (typeof dataObj.message === 'string') {
            message = dataObj.message;
          }
          if ('data' in dataObj) {
            resultData = dataObj.data as T;
          }
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: resultData ?? null,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
