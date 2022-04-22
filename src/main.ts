import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './middlewares//http-exception.filter';
import startSwagger from './config/swagger';
import { TransformInterceptor } from './middlewares//transform.interceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 跨域配置
  app.enableCors();

  // 配置全局统一的拦截器，返回统一的数据格式
  app.useGlobalInterceptors(new TransformInterceptor());

  // 配合全局针对HttpException类型的错误过滤器，返回统一的数据格式
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      // transform: true, // 自动类型转换
      forbidNonWhitelisted: true, // 只允许指定的参数 其他的不允许 抛出异常
      whitelist: true, // 启用白名单，dto中没有声明的属性会被直接过滤掉
    }),
  );

  //swagger配置
  startSwagger(app);

  await app.init(); // 初始化完成 缓存完成

  await app.listen(3000);
}

bootstrap();
