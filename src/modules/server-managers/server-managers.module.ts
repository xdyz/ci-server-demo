import { Module } from '@nestjs/common';
import { ServerManagersService } from './server-managers.service';
import { ServerManagersController } from './server-managers.controller';

@Module({
  controllers: [ServerManagersController],
  providers: [ServerManagersService]
})
export class ServerManagersModule {}
