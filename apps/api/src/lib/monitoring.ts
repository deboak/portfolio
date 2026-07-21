import * as Sentry from '@sentry/node';
import { env } from '../config/env.js';

Sentry.init({
  dsn: env.SENTRY_DSN,
  enabled: Boolean(env.SENTRY_DSN),
  environment: env.NODE_ENV,
  tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
});
export { Sentry };
