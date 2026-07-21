import { env } from '../../config/env.js';
import { analyticsService } from './analytics.module.js';
export function startAnalyticsScheduler() {
  const timer = setInterval(() => void analyticsService.flushViews(), env.VIEW_FLUSH_INTERVAL_MS);
  timer.unref();
  return timer;
}
