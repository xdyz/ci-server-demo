
## Description

[Nest官网](https://github.com/nestjs/nest) framework TypeScript starter repository.

[Nest8 中文文档](https://docs.nestjs.cn/8/firststeps) nestjs 的中文文档

[TypeOrm](https://typeorm.biunav.com/zh/find-options.html) TypeOrm 中文文档

[TypeScript](https://www.tslang.cn/) TS 文档

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```



## 目录结构

### src

#### config
存放所有的配置文件

- env 存放环境变量
- constants.ts 存放jwt的常量
- database.config.ts 数据库配置
- minio.config.ts 配置连接minio aws s3
- sentry.config.ts sentry 连接配置
- swagger.ts swagger 接口配置

#### entities

存放与数据库表的映射文件，可以看typeorm

#### middlewares

中间件

- http-exception.filter.ts  过滤器，将所有的错误过滤成统一的格式返回
- transform.interceptor.ts 拦截器，将所有正常返回的数据，统一格式返回

#### modules

所有的模块集合

- xxx.controller.ts  接口
- xxx.service.ts 服务层，请求和处理数据
- xxx.module.ts 当前模块的配置和依赖  这个文件在独立的模块中时必须存在的
- dto 用于做前端传递过来的数据校验和处理

#### utils

工具函数集合

#### app.module.ts

模块集合，初始化一些配置，数据库配置，sentry, minio等


#### main.ts

主启动文件



