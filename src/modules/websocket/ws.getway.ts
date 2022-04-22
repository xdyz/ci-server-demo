import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsService } from './ws.service';

@WebSocketGateway(3000, {
  namespace: 'ws',
  transports: ['polling', 'websocket'],
  cors: true,
  path: '/websocket',
})
export class WsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @Inject()
  private readonly wsService: WsService;

  afterInit(server: Server) {
    this.wsService.init(server);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('handleConnection', client.id);
  }

  handleDisconnect(client: any) {
    console.log('handleDisconnect', client.id);
  }

  // @SubscribeMessage('updatedBuild')
  // handleMessage(client, payload: string): string {
  //   return `Hello ${payload}`;
  // }

  // @SubscribeMessage('updatedBuild1')
  // handleMessage1(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: WebSocket,
  // ): any {
  //   client.send(JSON.stringify(data));
  //   return data;
  // }
}
