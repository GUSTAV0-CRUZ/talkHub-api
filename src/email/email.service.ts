import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(to: string, from: string, content: string) {
    await this.mailerService.sendMail({
      to: to,
      from: from,
      subject: `Message send from ${from}`,
      text: content,
      // html: '<b>Olá! Este é um e-mail de teste.</b>', // Corpo em HTML
    });
  }
}
