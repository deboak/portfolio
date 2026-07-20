import { Resend } from 'resend';
import { env } from '../../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
export async function sendEmail(input:{to:string;subject:string;html:string}) {
  if (!resend) {
    if (env.NODE_ENV === 'production') throw new Error('RESEND_API_KEY is not configured');
    console.info(`[email preview] to=${input.to} subject=${input.subject}`); return;
  }
  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, ...input });
  if (error) throw new Error(error.message);
}
