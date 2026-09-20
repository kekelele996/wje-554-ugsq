import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ServiceCategory, UserRole, WorkerStatus } from '../../constants/enums';
import { ReviewWorkerDto } from './dto/review-worker.dto';
import { WorkerService } from './worker.service';

@Controller('workers')
@UseGuards(AuthGuard)
export class WorkerController {
  constructor(private readonly worker: WorkerService) {}

  @Get()
  list(@Query('status') status?: WorkerStatus, @Query('category') category?: ServiceCategory) {
    return this.worker.list({ status, category });
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.worker.detail(id);
  }

  @Patch(':id/status')
  updateStatus(@CurrentUser() user: { sub: string; role: UserRole }, @Param('id') id: string, @Body() body: { status: WorkerStatus }) {
    return this.worker.updateStatus(user, id, body.status);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  review(@Param('id') id: string, @Body() dto: ReviewWorkerDto) {
    return this.worker.review(id, dto.approved);
  }
}
