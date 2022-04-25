import { Global, Module } from '@nestjs/common';
import { WsGateway } from './ws.getway';
import { WsService } from './ws.service';

@Global()
@Module({
  imports: [],
  providers: [WsService, WsGateway],
  exports: [WsService],
})
export class WsModule {}
