import { Injectable } from '@nestjs/common';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logs: AuditLogEntity[] = [];

  record(log: Omit<AuditLogEntity, 'id' | 'createdAt'>) {
    this.logs.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...log });
  }

  list() {
    return this.logs;
  }
}
