import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { NotifyService } from './notify.service';
import { CreateNotifyDto, UpdateNotifyDto } from './dtos/index.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
@UseGuards(AuthGuard('jwt')) // 使用 jwt 作为认证方式
@ApiBearerAuth('jwt') // s
@ApiTags('通知')
@Controller('notify')
export class NotifyController {
  constructor(
    private readonly notifyService: NotifyService, // @InjectSentry() // sentryService: SentryService,
  ) {}

  // app.get('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async () => {
  //     return app.services.notifyService.getAllIMManagers();
  //   }
  // });
  @Get()
  @ApiOperation({ summary: '获取所有企业微信配置' })
  async getAllIMManagers() {
    return await this.notifyService.getAllIMManagers();
  }

  // app.get('/:im_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return app.services.notifyService.getOneIMById(req.params.im_id);
  //   }
  // });
  @Get(':id')
  @ApiOperation({ summary: '获取企业微信配置' })
  async getOneIMById(@Param('id') id: string) {
    return await this.notifyService.getOneIMById(+id);
  }

  // app.post('/', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return app.services.notifyService.insertChat(req.body);
  //   }
  // });
  @Post()
  @ApiOperation({ summary: '新建企业微信配置' })
  async insertChat(@Body() createNotifyDto: CreateNotifyDto) {
    return await this.notifyService.insertChat(createNotifyDto);
  }

  // app.put('/:im_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return app.services.notifyService.updateChat(req.params.im_id, req.body);
  //   }
  // });
  @Put(':id')
  @ApiOperation({ summary: '获取企业微信配置' })
  async updateChat(@Param('id') id: string, @Body() updateNotifyDto: any) {
    return await this.notifyService.updateChat(+id, updateNotifyDto);
  }

  // app.delete('/:im_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return app.services.notifyService.delChat(req.params.im_id);
  //   }
  // });
  @Delete(':id')
  @ApiOperation({ summary: '删除企业微信配置' })
  async delChat(@Param('id') id: string) {
    return await this.notifyService.delChat(+id);
  }

  //  对外暴露调用接口
  // app.post('/daily', {
  //   handler: async (req) => {
  //     app.services.notifyService.notify(req.body);
  //     return '';
  //   }
  // });
  @Post('daily')
  @ApiOperation({ summary: '通知' })
  async notify(@Body() body: any) {
    await this.notifyService.notify(body);
  }
}
