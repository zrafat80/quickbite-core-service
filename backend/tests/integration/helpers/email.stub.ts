import { IEmailProvider } from 'src/lib/email/email.interface';

export interface SentEmail {
  to: string;
  subject: string;
  html: string;
}

export class EmailStub implements IEmailProvider {
  readonly sentEmails: SentEmail[] = [];

  async send(to: string, subject: string, html: string): Promise<void> {
    this.sentEmails.push({ to, subject, html });
  }

  reset(): void {
    this.sentEmails.length = 0;
  }
}
