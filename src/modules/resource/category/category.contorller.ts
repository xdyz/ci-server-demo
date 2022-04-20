import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Headers,
  ValidationPipe,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  Query,
} from '@nestjs/common';
import { ResourceCategoryService } from './category.service';
// import { CreateCategoryDto, UpdateCategoryDto, CreateExtraDto } from '../dtos';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('category')
@ApiTags('检查分类')
@UseInterceptors(ClassSerializerInterceptor)
export class ResourceCategoryController {
  constructor(
    private readonly resourceCategoryService: ResourceCategoryService,
  ) {}

  // @Get()
  // @ApiOperation({ summary: '获取所有分类信息' })
  // async findAll(@Headers('project_id') projectId: string) {
  //   return await this.categoryService.findAllCategoryByProjectId(+projectId);
  // }

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await resourceService.getResourceClassification(req.session, req.query);
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取所有分类信息' })
  async getResourceClassification(
    @Request() req: any,
    @Headers('project_id') projectId: string,
    @Query() query: any,
  ) {
    const user = { ...req.user, projectId: +projectId };
    return await this.resourceCategoryService.getResourceClassification(
      user,
      query,
    );
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await resourceService.insertClassification(req.session, req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新增分类' })
  async insertClassification(
    @Request() req: any,
    @Headers('project_id') projectId: string,
    @Body() body: any,
  ) {
    const user = { ...req.user, projectId: +projectId };
    return await this.resourceCategoryService.insertClassification(user, body);
  }

  // app.put('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await resourceService.updateClassification(req.params.id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  async updateClassification(
    // @Request() req: any,
    // @Headers('project_id') projectId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    // const user = { ...req.user , projectId: +projectId};
    return await this.resourceCategoryService.updateClassification(id, body);
  }

  // app.delete('/:id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await resourceService.deleteClassification(req.params.id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  async deleteClassification(
    // @Request() req: any,
    // @Headers('project_id') projectId: string,
    @Param('id') id: string,
  ) {
    // const user = { ...req.user , projectId: +projectId};
    return await this.resourceCategoryService.deleteClassification(+id);
  }

  // app.post('/extra', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return await resourceService.setClassificationExtra(req.session, req.body);
  //   }
  // });
  @Post('extra')
  @ApiOperation({ summary: '设置分类额外信息' })
  async setClassificationExtra(
    @Request() req: any,
    @Headers('project_id') projectId: string,
    @Body() body: any,
  ) {
    const user = { ...req.user, projectId: +projectId };
    return await this.resourceCategoryService.setClassificationExtra(
      user,
      body,
    );
  }
}
