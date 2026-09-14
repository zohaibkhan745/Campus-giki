import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isEthereal = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initTransporter();
  }

  private async initTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.logger.log(`Initializing SMTP Transporter with host: ${smtpHost}`);
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isEthereal = false;
    } else {
      this.logger.warn(
        'No SMTP credentials found in env. Creating Ethereal Test Email Account for local dev...',
      );
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.isEthereal = true;
        this.logger.log(`Ethereal Test Transporter initialized. User: ${testAccount.user}`);
      } catch (err) {
        this.logger.error('Failed to create Ethereal test account:', err);
      }
    }
  }

  /**
   * Sends a society account activation email containing the single-use token activation URL.
   */
  async sendSocietyActivationEmail(
    toEmail: string,
    societyName: string,
    activationUrl: string,
  ): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) {
      await this.initTransporter();
    }

    const fromAddress =
      this.configService.get<string>('EMAIL_FROM') || '"Campus GIKI DSA" <dsa@giki.edu.pk>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { background: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(37,99,235,0.4); }
          .link-fallback { background: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 13px; color: #60a5fa; margin-top: 12px; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Campus GIKI Portal</span>
            <div class="title">Official Society Account Provisioned</div>
          </div>
          <div class="body-text">
            Hello President / Management of <strong>${societyName}</strong>,<br/><br/>
            The Dean Student Affair (DSA) has provisioned an official portal account for <strong>${societyName}</strong>.
            <br/><br/>
            To activate your account, set your secure password, and complete your society profile, please click the button below:
          </div>
          <div class="btn-container">
            <a href="${activationUrl}" class="btn" target="_blank">Activate Society Account &rarr;</a>
          </div>
          <div class="body-text">
            If the button above does not work, copy and paste the following link into your web browser:
            <div class="link-fallback">${activationUrl}</div>
          </div>
          <div class="footer">
            This invitation link is cryptographically signed and will expire in 48 hours.<br/>
            If you did not request this account creation, please contact DSA GIKI immediately.<br/>
            &copy; ${new Date().getFullYear()} Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[Campus GIKI] Action Required: Activate Account for ${societyName}`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;

      if (this.isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        this.logger.log('====================================================');
        this.logger.log(`📧 LOCAL TEST EMAIL SENT TO: ${toEmail}`);
        this.logger.log(`🔗 VIEW EMAIL IN BROWSER: ${previewUrl}`);
        this.logger.log(`🔗 DIRECT ACTIVATION LINK: ${activationUrl}`);
        this.logger.log('====================================================');
      } else {
        this.logger.log(
          `Email successfully dispatched to ${toEmail}. Message ID: ${info.messageId}`,
        );
      }

      return {
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${toEmail}:`, error);
      throw error;
    }
  }
}
