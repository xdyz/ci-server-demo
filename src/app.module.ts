import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MembersModule } from './modules/members/members.module';
import { ViewsModule } from './modules/views/views.module';
import { TasksModule } from './modules/tasks/tasks.module';
import typeOrmConfig from './config/database';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectsModule,
    MembersModule,
    ViewsModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
