import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Headers,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TestErrorManualService } from './test-error-manual.service';
import { CreateTestErrorManualDto } from './dtos/create-test-error-manual.dto';
import { UpdateTestErrorManualDto } from './dtos/update-test-error-manual.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetTestErrorManualDto } from './dtos/get-test-error-manual.dto';

@Controller('test-error-manual')
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiTags('自动化测试错误手册')
@ApiBearerAuth('jwt') // s
export class TestErrorManualController {
  constructor(
    private readonly testErrorManualService: TestErrorManualService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.testErrorManualService.getManualErrors(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取自动化测试分页的错误手册' })
  async getManualErrors(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getTestErrorManualDto: GetTestErrorManualDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.getManualErrors(
      user,
      getTestErrorManualDto,
    );
  }

  // app.get('/all', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.testErrorManualService.getAllManualErrors(req.session);
  //   }
  // });
  @Get('all')
  @ApiOperation({ summary: '获取自动化测试所有的错误手册' })
  async getAllManualErrors(
    @Request() req,
    @Headers('project_id') project_id: string,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.getAllManualErrors(user);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.testErrorManualService.setManualError(req.session, req.body);
  //   }
  // });
  @Post()
  async setManualError(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Body() createTestErrorManualDto: CreateTestErrorManualDto,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.setManualError(
      user,
      createTestErrorManualDto,
    );
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async(req) => {
  //     return await app.services.testErrorManualService.updateManualError(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新自动化测试错误手册' })
  async updateManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
    @Body() updateTestErrorManualDto: UpdateTestErrorManualDto,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.updateManualError(
      id,
      updateTestErrorManualDto,
    );
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await app.services.testErrorManualService.deleteManualError(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除自动化测试错误手册' })
  async deleteManualError(
    // @Request() req,
    // @Headers('project_id') project_id: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.deleteManualError(id);
  }

  // app.get('/ids', {
  //   preHandler:  app.verifyAuthorization,
  //   handler: async (req) => {
  //     let { ids } = req.query;
  //     ids = ids ? ids.split(',').map(item => Number(item)): [];
  //     return await app.services.testErrorManualService.getManualErrorsByIds(req.session, ids);
  //   }
  // });
  @Get('ids')
  @ApiOperation({ summary: '获取自动化测试批量的错误手册' })
  async getManualErrorsByIds(
    @Request() req,
    @Headers('project_id') project_id: string,
    @Query() getTestErrorManualDto: any,
  ) {
    const user = { ...req.user, project_id: +project_id };
    return await this.testErrorManualService.getManualErrorsByIds(
      user,
      getTestErrorManualDto,
    );
  }
}
