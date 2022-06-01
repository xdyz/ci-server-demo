import { forwardRef, Global, Module } from '@nestjs/common';
import { MinioClientService } from './minio-client.service';
import { MinioClinentController } from './minio-client.controller';
import { ProjectsService } from '../projects/projects.service';

import { ConfigService } from '@nestjs/config';
import { ProjectsModule } from '../projects/projects.module';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    // NestMinioModule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) =>
    //     configService.get('minio'),
    // }),
    // NestMinioModule.register({
    //   endPoint: 'localhost',
    //   port: 9000,
    //   useSSL: false,
    //   accessKey: 'AKIAIOSFODNN7EXAMPLE',
    //   secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    // }),
    ProjectsModule,
  ],
  controllers: [MinioClinentController],
  providers: [MinioClientService],
  exports: [MinioClientService],
})
export class MinioClientModule {}
