import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceCategory, ServiceStatus } from '../../constants/enums';
import { services } from '../demo-data';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  list(query: { category?: ServiceCategory; status?: ServiceStatus }) {
    return services.filter((item) => (!query.category || item.category === query.category) && (!query.status || item.status === query.status));
  }

  detail(id: string) {
    const service = services.find((item) => item.id === id);
    if (!service) throw new NotFoundException('服务项目不存在');
    return service;
  }

  create(dto: CreateServiceDto) {
    const now = new Date().toISOString();
    const service = { id: crypto.randomUUID(), ...dto, status: ServiceStatus.ACTIVE, orderCount: 0, createdAt: now, updatedAt: now };
    services.unshift(service);
    return service;
  }

  update(id: string, dto: UpdateServiceDto & { status?: ServiceStatus }) {
    const service = this.detail(id);
    Object.assign(service, dto, { updatedAt: new Date().toISOString() });
    return service;
  }

  updateStatus(id: string, status: ServiceStatus) {
    return this.update(id, { status });
  }
}
