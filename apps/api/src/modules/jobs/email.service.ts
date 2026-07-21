import { Resend } from 'resend';
export class EmailService {
  constructor(
    private readonly resend: Resend | null,
    private readonly from: string,
    private readonly environment: string,
  ) {}
  async send(input: { to: string; subject: string; html: string }) {
    if (!this.resend) {
      if (this.environment === 'production') throw new Error('RESEND_API_KEY is not configured');
      console.info(`[email preview] to=${input.to} subject=${input.subject}`);
      return;
    }
    const { error } = await this.resend.emails.send({
      from: this.from,
      ...input,
    });
    if (error) throw new Error(error.message);
  }
}
