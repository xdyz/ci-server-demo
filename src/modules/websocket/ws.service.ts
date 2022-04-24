import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WsService {
  wsClient: Server;

  init(server: Server) {
    this.wsClient = server;
  }

  createBuild(data) {
    this.wsClient.send('createBuild', data);
  }

  updateBuild(data) {
    this.wsClient.send('updateBuild', data);
  }

  updateExecution(data) {
    this.wsClient.send('updatedExecution', data);
  }

  updateExecutePipeline(data) {
    this.wsClient.send('updatedExecutePipeline', data);
  }
}
