import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailjetClient } from '../../pkg/mailjet/mailjet';
import { EMAIL_PROVIDER_TOKEN } from './email.constants';
import { IEmailProvider } from './email.interface';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER_TOKEN,
      // 🌟 1. Tell NestJS we need the ConfigService
      inject: [ConfigService], 
      
      // 🌟 2. Pass ConfigService into the factory
      useFactory: (configService: ConfigService): IEmailProvider => {
        
        // 3. Grab the mailjet object you defined in Step 1
        const mailjetConfig = configService.get('mailjet');

        // 4. Instantiate the dumb tool using the config
        const mailjet = new MailjetClient(
          mailjetConfig.apiKey,
          mailjetConfig.secretKey,
          mailjetConfig.fromEmail,
          mailjetConfig.fromName,
        );

        // 5. Return it shaped exactly like the IEmailProvider blueprint
        return {
          send: async (to, subject, html) => {
            await mailjet.sendHtmlEmail(to, subject, html);
          },
        };
      },
    },
  ],
  exports: [EMAIL_PROVIDER_TOKEN],
})
export class EmailModule {}