import Mailjet from 'node-mailjet';

export class MailjetClient {
  private client: Mailjet;

  constructor(
    apiKey: string,
    secretKey: string,
    private defaultFromEmail: string,
    private defaultFromName: string,
  ) {
    this.client = new Mailjet({ apiKey, apiSecret: secretKey });
  }

  async sendHtmlEmail(to: string, subject: string, html: string): Promise<void> {
    await this.client
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: this.defaultFromEmail,
              Name: this.defaultFromName,
            },
            To: [
              { Email: to },
            ],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
  }
}