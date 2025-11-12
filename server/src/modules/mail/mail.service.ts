import { Injectable } from '@nestjs/common';

interface EmailResponse {
  success: boolean;
}

@Injectable()
export class MailService {
  private async sendEmailRequest(
    params: Record<string, string>,
  ): Promise<EmailResponse> {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${process.env.SMTP_API}/api/send-email?${queryString}`;

      const response = await fetch(url);
      const data = (await response.json()) as EmailResponse;
      return data;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(
    email: string,
    username: string,
    token: string,
    expiry: string,
  ): Promise<EmailResponse> {
    return this.sendEmailRequest({
      email,
      username,
      token,
      expiry,
      type: 'verification',
    });
  }

  async sendWelcomeMail(
    email: string,
    username: string,
  ): Promise<EmailResponse> {
    return this.sendEmailRequest({
      email,
      username,
      type: 'welcome',
    });
  }

  async sendPayoutOtp(
    email: string,
    otp: string,
    username: string,
  ): Promise<EmailResponse> {
    return this.sendEmailRequest({
      username,
      otp,
      type: 'payout-otp',
    });
  }
}
