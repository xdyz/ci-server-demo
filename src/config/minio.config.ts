import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endpoint: process.env.AWS_S3_ENDPOINT || 'http://localhost:9000',
  port: process.env.AWS_S3_PORT || 9000,
  accessKey: process.env.AWS_S3_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.AWS_S3_SECRET_KEY || 'minioadmin',
}));
