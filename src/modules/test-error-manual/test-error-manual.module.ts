import { Module } from '@nestjs/common';
import { TestErrorManualService } from './test-error-manual.service';
import { TestErrorManualController } from './test-error-manual.controller';

@Module({
  controllers: [TestErrorManualController],
  providers: [TestErrorManualService]
})
export class TestErrorManualModule {}
