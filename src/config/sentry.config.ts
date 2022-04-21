import { registerAs } from '@nestjs/config';

export default registerAs('sentry', () => ({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || '',
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE || 0.1,
  attachStacktrace: process.env.SENTRY_ATTACH_STACKTRACE || true,
  autoSessionTracking: process.env.SENTRY_AUTO_SESSION_TRACKING || true,
}));
