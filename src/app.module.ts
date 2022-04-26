import { Module } from '@nestjs/common';
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
import { AxiosModule } from './modules/axios/axios.module';
import { PipelinesRecordsModule } from './modules/pipelines-records/pipelines-records.module';
import { PipelinesReportModule } from './modules/pipelines-report/pipelines-report.module';
import { BuildsModule } from './modules/builds/builds.module';
import { BuildsForeignModule } from './modules/builds-foreign/builds-foreign.module';
import { NestMinioModule } from 'nestjs-minio';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '../config/env/.env',
        `../config/dev/.env.${process.env.NODE_ENV || 'development'}`,
      ],
      expandVariables: true,
      load: [typeOrmConfig, minioConfig, sentryConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    SentryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('sentry'),
    }),
    NestMinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('minio'),
    }),
    ScheduleModule.forRoot(),
    // MinioClientModule,
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
    PipelinesRecordsModule,
    PackageModule,
    WsModule,
    PipelinesModule,
    PipelinesReportModule,
    BuildsModule,
    BuildsForeignModule,
    AutoTestModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
