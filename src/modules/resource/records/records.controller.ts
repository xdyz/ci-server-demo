import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { ResourceRecordsService } from './records.service';

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
  async getResourceRecords(
    @Request() req: any,
    @Headers('project_id') project_id: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.resourceRecordsService.getResourceRecords(user, query);
  }
}
