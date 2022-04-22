import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WsService {
  wsClient: Server;

  init(server: Server) {
    this.wsClient = server;
  }

  createBuild(data) {
    this.wsClient.emit('updatedBuild', data);
  }

  updateBuild(data) {
    this.wsClient.emit('updatedBuild', data);
  }

  buildEnd(data) {
    this.wsClient.emit('buildEnd', data);
  }

  updateExecution(data) {
    this.wsClient.emit('updatedExecution', data);
  }

  updateExecutePipeline(data) {
    this.wsClient.emit('updatedExecutePipeline', data);
  }
}
