import {
  Controller,
  Get,
  Headers,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ResourceRecordsService } from './records.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('检查记录')
@Controller('records')
export class ResourceRecordsController {
  constructor(
    private readonly resourceRecordsService: ResourceRecordsService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.resourceService.getResourceRecords(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取资源检查构建记录' })
  async getResourceRecords(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceRecordsService.getResourceRecords(user, query);
  }
}
