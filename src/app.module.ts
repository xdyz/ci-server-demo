import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from './modules/auth/auth.service';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import typeOrmConfig from './config/database';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, UsersModule, RolesModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
