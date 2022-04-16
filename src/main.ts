import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './config/http-exception.filter';
import startSwagger from './config/swagger';
import { TransformInterceptor } from './config/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 跨域配置
  app.enableCors();

  // 配置全局统一的拦截器，返回统一的数据格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配合全局针对HttpException类型的错误过滤器，返回统一的数据格式
  app.useGlobalFilters(new HttpExceptionFilter());

  //swagger配置
  startSwagger(app);

  await app.listen(3000);
}
bootstrap();
