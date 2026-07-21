import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { EmailService } from './email.service.js';
export const emailService = new EmailService(
  env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null,
  env.EMAIL_FROM,
  env.NODE_ENV,
);
