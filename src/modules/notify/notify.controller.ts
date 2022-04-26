import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { NotifyService } from './notify.service';
import { CreateNotifyDto } from './dtos/create-notify.dto';
import { UpdateNotifyDto } from './dtos/update-notify.dto';
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
  async insertChat(@Body() createNotifyDto: CreateNotifyDto) {
    return await this.notifyService.insertChat(createNotifyDto);
  }

  // app.put('/:im_id', {
  //   preHandler: app.verifyAuthorization,
  //   handler: async (req) => {
  //     return app.services.notifyService.updateChat(req.params.im_id, req.body);
  //   }
  // });
  @Patch(':id')
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
  async notify(@Body() body: any) {
    await this.notifyService.notify(body);
  }
}
