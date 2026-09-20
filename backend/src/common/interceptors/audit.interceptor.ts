import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(tap(() => {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
        this.audit.record({
          actorId: request.user?.sub,
          action: `${request.method} ${request.route?.path || request.url}`,
          targetEntity: request.url.split('/')[2] || 'unknown',
          targetId: request.params?.id,
          ip: request.ip,
          params: request.body
        });
      }
    }));
  }
}
