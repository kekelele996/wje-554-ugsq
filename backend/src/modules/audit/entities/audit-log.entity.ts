export interface AuditLogEntity {
  id: string;
  actorId?: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  ip?: string;
  params?: unknown;
  createdAt: string;
}
