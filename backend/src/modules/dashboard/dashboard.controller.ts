import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../constants/enums';
import { DashboardService } from './dashboard.service';

@Controller()
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('dashboard/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  stats() {
    return this.dashboard.stats();
  }

  @Get('workers/:id/stats')
  workerStats(@Param('id') id: string) {
    return this.dashboard.workerStats(id);
  }
}
