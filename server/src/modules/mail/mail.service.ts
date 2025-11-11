import { Injectable } from "@nestjs/common"

@Injectable()
export class MailService {
  private async sendEmailRequest(params: any) {
    try {
      const queryString = new URLSearchParams(params).toString()
      const url = `${process.env.SMTP_API}/api/send-email?${queryString}`
      
      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      console.error("Email sending failed:", error)
      throw new Error("Failed to send email")
    }
  }

  async sendVerificationEmail(email: string, username: string, token: string) {
    return this.sendEmailRequest({
      email,
      username,
      token,
      type: "verification"
    })
  }

  async sendWelcomeMail(email: string, username: string) {
    return this.sendEmailRequest({
      email,
      username,
      type: "welcome"
    })
  }
}