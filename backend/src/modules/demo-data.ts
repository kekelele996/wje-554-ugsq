import bcrypt from 'bcryptjs';
import { OrderStatus, ServiceCategory, ServiceStatus, UserRole, WorkerStatus } from '../constants/enums';
import { UserEntity } from './auth/auth.service';
import { OrderEntity } from './order/entities/order.entity';
import { ServiceEntity } from './service/entities/service.entity';
import { WorkerEntity } from './worker/entities/worker.entity';

const now = new Date();
const iso = (offsetHours = 0) => new Date(now.getTime() + offsetHours * 3600_000).toISOString();

export const users: UserEntity[] = [
  { id: 'u-admin', username: 'admin', password: bcrypt.hashSync('admin123', 8), role: UserRole.ADMIN, nickname: '运营管理员', phone: '13800000000', createdAt: iso() },
  { id: 'u-customer', username: 'customer', password: bcrypt.hashSync('customer123', 8), role: UserRole.CUSTOMER, nickname: '林女士', phone: '13800000001', createdAt: iso() },
  { id: 'u-worker', username: 'worker', password: bcrypt.hashSync('worker123', 8), role: UserRole.WORKER, nickname: '赵师傅', phone: '13800000002', createdAt: iso() }
];

export const services: ServiceEntity[] = [
  { id: 'svc-clean-deep', name: '深度保洁', category: ServiceCategory.CLEANING, description: '厨房、卫生间、地面和窗台深度清洁。', basePrice: 268, unit: '次', duration: 180, status: ServiceStatus.ACTIVE, orderCount: 188, createdAt: iso(), updatedAt: iso() },
  { id: 'svc-plumb-pipe', name: '水管疏通', category: ServiceCategory.PLUMBING, description: '厨房、卫生间下水道疏通和漏水排查。', basePrice: 158, unit: '次', duration: 60, status: ServiceStatus.ACTIVE, orderCount: 131, createdAt: iso(), updatedAt: iso() },
  { id: 'svc-repair-lock', name: '门锁维修', category: ServiceCategory.REPAIR, description: '智能锁、机械锁故障排查与更换。', basePrice: 120, unit: '次', duration: 45, status: ServiceStatus.ACTIVE, orderCount: 91, createdAt: iso(), updatedAt: iso() },
  { id: 'svc-moving-mini', name: '小件搬运', category: ServiceCategory.MOVING, description: '同城小件搬运，含基础打包保护。', basePrice: 199, unit: '小时', duration: 120, status: ServiceStatus.ACTIVE, orderCount: 76, createdAt: iso(), updatedAt: iso() },
  { id: 'svc-errand-doc', name: '证件跑腿', category: ServiceCategory.ERRAND, description: '文件取送、排队代办和同城急送。', basePrice: 49, unit: '次', duration: 40, status: ServiceStatus.ACTIVE, orderCount: 154, createdAt: iso(), updatedAt: iso() }
];

export const workers: WorkerEntity[] = [
  { id: 'w-zhao', userId: 'u-worker', name: '赵明', phone: '13800000002', specialties: [ServiceCategory.PLUMBING, ServiceCategory.REPAIR], rating: 4.9, totalOrders: 320, status: WorkerStatus.ONLINE, bio: '擅长管道和五金维修，响应快。', experience: 9, idCardNo: '310***********3218', createdAt: iso() },
  { id: 'w-chen', userId: 'u-worker-2', name: '陈洁', phone: '13800000003', specialties: [ServiceCategory.CLEANING], rating: 4.8, totalOrders: 286, status: WorkerStatus.BUSY, bio: '长期服务家庭深度保洁和开荒保洁。', experience: 6, idCardNo: '330***********1221', createdAt: iso() },
  { id: 'w-liu', userId: 'u-worker-3', name: '刘峰', phone: '13800000004', specialties: [ServiceCategory.MOVING, ServiceCategory.ERRAND], rating: 4.7, totalOrders: 198, status: WorkerStatus.PENDING_REVIEW, bio: '同城搬运与即时跑腿。', experience: 4, idCardNo: '440***********8120', createdAt: iso() }
];

export const orders: OrderEntity[] = [
  { id: 'ord-1', orderNo: 'HS-20260616-0001', serviceItemId: 'svc-clean-deep', customerId: 'u-customer', workerId: 'w-chen', address: '上海市徐汇区漕溪北路', addressDetail: '18号 1202', contactPhone: '13800000001', scheduledTime: iso(8), status: OrderStatus.IN_PROGRESS, totalPrice: 268, createdAt: iso(-8), updatedAt: iso(-1) },
  { id: 'ord-2', orderNo: 'HS-20260616-0002', serviceItemId: 'svc-plumb-pipe', customerId: 'u-customer', workerId: 'w-zhao', address: '上海市静安区南京西路', addressDetail: '66号 503', contactPhone: '13800000001', scheduledTime: iso(20), status: OrderStatus.ASSIGNED, totalPrice: 158, createdAt: iso(-3), updatedAt: iso(-2) },
  { id: 'ord-3', orderNo: 'HS-20260615-0008', serviceItemId: 'svc-errand-doc', customerId: 'u-customer', workerId: 'w-liu', address: '上海市浦东新区世纪大道', addressDetail: '100号', contactPhone: '13800000001', scheduledTime: iso(-24), status: OrderStatus.RATED, totalPrice: 49, actualDuration: 35, rating: 5, comment: '速度很快。', createdAt: iso(-48), updatedAt: iso(-20) }
];
