import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiceCategory, UserRole, WorkerStatus } from '../../constants/enums';
import { workers } from '../demo-data';

@Injectable()
export class WorkerService {
  list(query: { status?: WorkerStatus; category?: ServiceCategory }) {
    return workers.filter((worker) => (!query.status || worker.status === query.status) && (!query.category || worker.specialties.includes(query.category)));
  }

  detail(id: string) {
    const worker = workers.find((item) => item.id === id);
    if (!worker) throw new NotFoundException('技师不存在');
    return worker;
  }

  updateStatus(user: { sub: string; role: UserRole }, id: string, status: WorkerStatus) {
    const worker = this.detail(id);
    if (user.role === UserRole.WORKER && worker.userId !== user.sub) throw new NotFoundException('只能更新自己的技师状态');
    worker.status = status;
    return worker;
  }

  review(id: string, approved: boolean) {
    const worker = this.detail(id);
    worker.status = approved ? WorkerStatus.ONLINE : WorkerStatus.OFFLINE;
    return worker;
  }

  findByUserId(userId: string) {
    return workers.find((item) => item.userId === userId);
  }

  firstOnline() {
    return workers.find((item) => item.status === WorkerStatus.ONLINE) || workers[0];
  }
}
