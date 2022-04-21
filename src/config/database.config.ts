// import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'mysql',
//   host: 'localhost',
//   port: 3306,
//   username: 'root',
//   password: '123456',
//   database: 'nest1',
//   autoLoadEntities: true,
//   entities: [__dirname + '/**/*.entity{.ts,.js}'],
//   synchronize: true,
// };

// export default typeOrmConfig;

import { registerAs } from '@nestjs/config';

export default registerAs('typeorm', () => ({
  type: process.env.TYPEORM_CONNECTION || 'mysql',
  host: process.env.TYPEORM_HOST || 'localhost',
  port: Number(process.env.TYPEORM_PORT) || 3306,
  username: process.env.TYPEORM_USERNAME || 'root',
  password: process.env.TYPEORM_PASSWORD || '123456',
  database: process.env.TYPEORM_DATABASE || 'nest1',
  autoLoadEntities: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
}));
