import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endpoint: process.env.AWS_S3_ENDPOINT || 'localhost',
  port: process.env.AWS_S3_PORT || 9000,
  accessKey: process.env.AWS_S3_ACCESS_KEY || 'AKIAIOSFODNN7EXAMPLE',
  secretKey:
    process.env.AWS_S3_SECRET_KEY || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
}));
