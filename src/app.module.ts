import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MembersModule } from './modules/members/members.module';
import { ViewsModule } from './modules/views/views.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { GitInfoModule } from './modules/git-info/git-info.module';
import { JenkinsInfoModule } from './modules/jenkins-info/jenkins-info.module';
import { MenusModule } from './modules/menus/menus.module';
import { MinioClientModule } from './modules/minio-client/minio-client.module';
import { NotifyModule } from './modules/notify/notify.module';
import { PackageErrorManualModule } from './modules/package-error-manual/package-error-manual.module';
import { ParameterCoverageModule } from './modules/parameter-coverage/parameter-coverage.module';
import { ServerManagersModule } from './modules/server-managers/server-managers.module';
import { TestErrorManualModule } from './modules/test-error-manual/test-error-manual.module';
import { PackageModule } from './modules/package/package.module';
import { ResourceModule } from './modules/resource/resource.module';
import { AutoTestModule } from './modules/auto-test/auto-test.module';
import typeOrmConfig from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import minioConfig from './config/minio.config';
import sentryConfig from './config/sentry.config';
import { WsModule } from './modules/websocket/ws.module';
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ScheduleModule } from '@nestjs/schedule';
// import { HttpModule } from '@nestjs/axios';
import { MinioModule } from 'nestjs-minio-client';
import { AxiosModule } from './modules/axios/axios.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        'src/config/dev/.env',
        `src/config/dev/.env.${process.env.NODE_ENV || 'development'}`,
      ],
      expandVariables: true,
      load: [typeOrmConfig, minioConfig, sentryConfig],
    }),
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) =>
    //     configService.get('typeorm'),
    // }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'nest1',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    // MinioModule.registerAsync({
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => configService.get('minio'),
    // }),
    // forwardRef(() =>
    //   MinioModule.registerAsync({
    //     inject: [ConfigService],
    //     useFactory: (configService: ConfigService) =>
    //       configService.get('minio'),
    //   }),
    // ),
    // forwardRef(() =>
    //   MinioModule.registerAsync({
    //     inject: [ConfigService],
    //     useFactory: (configService: ConfigService) =>
    //       configService.get('minio'),
    //   }),
    // ),
    SentryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('sentry'),
    }),
    ScheduleModule.forRoot(),
    MinioClientModule,
    AxiosModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectsModule,
    MembersModule,
    GitInfoModule,
    JenkinsInfoModule,
    MenusModule,
    NotifyModule,
    ViewsModule,
    ParameterCoverageModule,
    ServerManagersModule,
    TestErrorManualModule,
    ResourceModule,
    PackageErrorManualModule,
    PackageModule,
    WsModule,

    AutoTestModule,
    // PipelinesModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
