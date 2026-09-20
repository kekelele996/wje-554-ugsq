import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OrderStatus, UserRole } from '../../constants/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto, RateOrderDto, UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly order: OrderService) {}

  @Get()
  list(@CurrentUser() user: { sub: string; role: UserRole }, @Query('status') status?: OrderStatus) {
    return this.order.list(user, status);
  }

  @Get(':id')
  detail(@CurrentUser() user: { sub: string; role: UserRole }, @Param('id') id: string) {
    return this.order.detail(user, id);
  }

  @Post()
  create(@CurrentUser() user: { sub: string; role: UserRole }, @Body() dto: CreateOrderDto) {
    return this.order.create(user, dto);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: { sub: string; role: UserRole }, @Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.order.updateStatus(user, id, dto.status, dto.workerId);
  }

  @Post(':id/rate')
  rate(@CurrentUser() user: { sub: string; role: UserRole }, @Param('id') id: string, @Body() dto: RateOrderDto) {
    return this.order.rate(user, id, dto.rating, dto.comment);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: { sub: string; role: UserRole }, @Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.order.cancel(user, id, dto.cancelReason);
  }
}
