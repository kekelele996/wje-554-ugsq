import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (body && typeof body === 'object' && 'code' in (body as Record<string, unknown>)) return originalJson(body);
      return originalJson({ code: 0, message: 'ok', data: body });
    };
    next();
  });
  app.getHttpAdapter().get('/api/health', (_req, res) => res.json({ code: 0, message: 'ok', data: { status: 'healthy' } }));
  const port = Number(process.env.PORT || 38304);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
