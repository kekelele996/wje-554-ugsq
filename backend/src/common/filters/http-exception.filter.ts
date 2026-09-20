import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : '系统异常';
    response.status(status).json({
      code: status,
      message: typeof body === 'string' ? body : (body as { message?: string }).message || '请求失败',
      details: typeof body === 'object' ? body : undefined
    });
  }
}
