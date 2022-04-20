import { Module } from '@nestjs/common';
import { TestErrorManualService } from './test-error-manual.service';
import { TestErrorManualController } from './test-error-manual.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestErrorManualEntity } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([TestErrorManualEntity])],
  controllers: [TestErrorManualController],
  providers: [TestErrorManualService],
  exports: [TestErrorManualService],
})
export class TestErrorManualModule {}
