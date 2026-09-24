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
      } catch (err: any) {
        this.logger.warn(`Could not reach Ethereal service: ${err?.message || err}. Falling back to Console transport.`);
        this.transporter = nodemailer.createTransport({ jsonTransport: true });
        this.isEthereal = false;
      }
    }
  }

  private logActionBanner(title: string, toEmail: string, actionUrl: string, previewUrl?: string) {
    this.logger.log('╔════════════════════════════════════════════════════════════════════════════╗');
    this.logger.log(`║ 📬 LOCAL DEV EMAIL: ${title.padEnd(52)} ║`);
    this.logger.log(`║ 👤 To: ${toEmail.padEnd(67)} ║`);
    this.logger.log(`║ 🔗 ACTION LINK (Click or copy to test):                                   ║`);
    this.logger.log(`║    👉 ${actionUrl.padEnd(64)} ║`);
    if (previewUrl) {
      this.logger.log(`║ 🌐 FULL PREVIEW IN BROWSER (Ethereal Fake Inbox):                         ║`);
      this.logger.log(`║    ${previewUrl.padEnd(68)} ║`);
    }
    this.logger.log('╚════════════════════════════════════════════════════════════════════════════╝');
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
      }
      this.logActionBanner(`Society Activation (${societyName})`, toEmail, activationUrl, previewUrl);

      return {
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch SMTP email to ${toEmail}: ${error?.message || error}`);
      this.logActionBanner(`Society Activation Fallback (${societyName})`, toEmail, activationUrl);

      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) {
        return { messageId: 'mock-dev-id' };
      }
      throw error;
    }
  }

  /**
   * Sends a faculty advisor account invitation email containing the single-use token activation URL.
   */
  async sendAdvisorActivationEmail(
    toEmail: string,
    advisorName: string,
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
          .badge { background: #059669; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(5,150,105,0.4); }
          .link-fallback { background: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 13px; color: #34d399; margin-top: 12px; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Faculty Advisor Portal</span>
            <div class="title">Faculty Advisor Nomination & Setup</div>
          </div>
          <div class="body-text">
            Dear <strong>${advisorName}</strong>,<br/><br/>
            You have been nominated and registered as a <strong>Faculty Advisor</strong> on the Campus GIKI Portal by the Directorate of Student Affairs (DSA).
            <br/><br/>
            As a Faculty Advisor, you will have secure access to review, evaluate, and approve your assigned society's yearly activity calendar and upcoming event proposals.
            <br/><br/>
            Please click the button below to set your confidential password and activate your advisor portal access:
          </div>
          <div class="btn-container">
            <a href="${activationUrl}" class="btn" target="_blank">Set Password & Activate Access &rarr;</a>
          </div>
          <div class="body-text">
            If the button above does not work, copy and paste the following link into your browser:
            <div class="link-fallback">${activationUrl}</div>
          </div>
          <div class="footer">
            This invitation link is valid for 48 hours.<br/>
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[Campus GIKI] Action Required: Set Up Your Faculty Advisor Account`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      }
      this.logActionBanner(`Advisor Invitation (${advisorName})`, toEmail, activationUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch SMTP email to ${toEmail}: ${error?.message || error}`);
      this.logActionBanner(`Advisor Invitation Fallback (${advisorName})`, toEmail, activationUrl);

      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) {
        return { messageId: 'mock-dev-id' };
      }
      throw error;
    }
  }

  /**
   * Sends a password reset email with a short-lived (15 min) token URL.
   */
  async sendPasswordResetEmail(
    toEmail: string,
    recipientName: string,
    resetUrl: string,
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
          .badge { background: #dc2626; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(220,38,38,0.4); }
          .link-fallback { background: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 13px; color: #f87171; margin-top: 12px; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Security Notification</span>
            <div class="title">Password Reset Request</div>
          </div>
          <div class="body-text">
            Hello <strong>${recipientName}</strong>,<br/><br/>
            We received a request to reset the password for your Campus GIKI account associated with <strong>${toEmail}</strong>.
            <br/><br/>
            If you made this request, please click the button below to choose a new password. This link is only valid for <strong>15 minutes</strong> for security reasons:
          </div>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password &rarr;</a>
          </div>
          <div class="body-text">
            If the button does not work, copy and paste this link into your browser:
            <div class="link-fallback">${resetUrl}</div>
          </div>
          <div class="footer">
            If you did not request a password reset, you can safely ignore this email. Your current password remains unchanged.<br/>
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[Campus GIKI] Password Reset Request`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      }
      this.logActionBanner(`Password Reset (${recipientName})`, toEmail, resetUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch SMTP email to ${toEmail}: ${error?.message || error}`);
      this.logActionBanner(`Password Reset Fallback (${recipientName})`, toEmail, resetUrl);

      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) {
        return { messageId: 'mock-dev-id' };
      }
      throw error;
    }
  }

  /**
   * Sends an invitation email to a newly added DDSA (Deputy Director Student Affairs) staff member.
   */
  async sendDdsaInvitationEmail(
    toEmail: string,
    fullName: string,
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
          .badge { background: #6366f1; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 14px rgba(99,102,241,0.4); }
          .link-fallback { background: #0f172a; border: 1px solid #334155; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 13px; color: #818cf8; margin-top: 12px; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">DSA Administration</span>
            <div class="title">Deputy Director Student Affairs (DDSA) Account</div>
          </div>
          <div class="body-text">
            Dear <strong>${fullName}</strong>,<br/><br/>
            You have been provisioned an official administrative account as <strong>Deputy Director of Student Affairs (DDSA)</strong> by the Director of Student Affairs.
            <br/><br/>
            You have administrative authority across society yearly plans, event review workflows, and campus clearance verifications.
            <br/><br/>
            Please click below to set your confidential password and activate your account:
          </div>
          <div class="btn-container">
            <a href="${activationUrl}" class="btn" target="_blank">Set Password & Activate Account &rarr;</a>
          </div>
          <div class="body-text">
            Link:
            <div class="link-fallback">${activationUrl}</div>
          </div>
          <div class="footer">
            This invitation link is valid for 48 hours.<br/>
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `[Campus GIKI] Action Required: Set Up Your DDSA Admin Account`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) {
        previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      }
      this.logActionBanner(`DDSA Staff Invitation (${fullName})`, toEmail, activationUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch SMTP email to ${toEmail}: ${error?.message || error}`);
      this.logActionBanner(`DDSA Staff Invitation Fallback (${fullName})`, toEmail, activationUrl);

      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) {
        return { messageId: 'mock-dev-id' };
      }
      throw error;
    }
  }

  /**
   * Notifies the Faculty Advisor that their assigned society has submitted an event proposal for review.
   */
  async sendEventSubmittedForAdvisorEmail(params: {
    advisorEmail: string;
    advisorName: string;
    societyName: string;
    eventTitle: string;
    eventDate: string;
    venue: string;
    eventId: string;
  }): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const reviewUrl = `${clientUrl}/advisor/events/${params.eventId}`;
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
          .badge { background: #3b82f6; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
          .info-label { color: #94a3b8; font-weight: 600; width: 35%; }
          .info-value { color: #f8fafc; font-weight: 500; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Faculty Advisor Review Required</span>
            <div class="title">New Event Proposal Submitted</div>
          </div>
          <div class="body-text">
            Dear <strong>${params.advisorName}</strong>,<br/><br/>
            <strong>${params.societyName}</strong> has submitted an event proposal for your academic and logistical evaluation:
          </div>
          <table class="info-table">
            <tr>
              <td class="info-label">Event Title:</td>
              <td class="info-value"><strong>${params.eventTitle}</strong></td>
            </tr>
            <tr>
              <td class="info-label">Proposed Date:</td>
              <td class="info-value">${params.eventDate}</td>
            </tr>
            <tr>
              <td class="info-label">Venue:</td>
              <td class="info-value">${params.venue}</td>
            </tr>
          </table>
          <div class="btn-container">
            <a href="${reviewUrl}" class="btn" target="_blank">Review Event Proposal &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.advisorEmail,
        subject: `[Campus GIKI] Event Review Required: ${params.eventTitle} (${params.societyName})`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logActionBanner(`Event Review Notice for Advisor (${params.advisorName})`, params.advisorEmail, reviewUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch event notice to advisor ${params.advisorEmail}: ${error?.message || error}`);
      this.logActionBanner(`Event Review Notice Fallback (${params.advisorName})`, params.advisorEmail, reviewUrl);
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) return { messageId: 'mock-dev-id' };
      throw error;
    }
  }

  /**
   * Notifies the DSA and DDSA administrative staff when a Faculty Advisor approves an event.
   */
  async sendEventForwardedToDsaEmail(params: {
    dsaEmails: string[];
    advisorName: string;
    societyName: string;
    eventTitle: string;
    eventDate: string;
    venue: string;
    eventId: string;
  }): Promise<void> {
    if (!params.dsaEmails || params.dsaEmails.length === 0) return;
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const reviewUrl = `${clientUrl}/admin/events/${params.eventId}`;
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
          .badge { background: #8b5cf6; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
          .info-label { color: #94a3b8; font-weight: 600; width: 35%; }
          .info-value { color: #f8fafc; font-weight: 500; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">DSA Executive Approval Required</span>
            <div class="title">Event Approved by Faculty Advisor</div>
          </div>
          <div class="body-text">
            Dear DSA Administration,<br/><br/>
            Faculty Advisor <strong>${params.advisorName}</strong> has evaluated and approved the upcoming event proposal for <strong>${params.societyName}</strong>. It is now awaiting final administrative review:
          </div>
          <table class="info-table">
            <tr>
              <td class="info-label">Event:</td>
              <td class="info-value"><strong>${params.eventTitle}</strong></td>
            </tr>
            <tr>
              <td class="info-label">Society:</td>
              <td class="info-value">${params.societyName}</td>
            </tr>
            <tr>
              <td class="info-label">Date & Venue:</td>
              <td class="info-value">${params.eventDate} at ${params.venue}</td>
            </tr>
          </table>
          <div class="btn-container">
            <a href="${reviewUrl}" class="btn" target="_blank">Open DSA Event Review &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    for (const email of params.dsaEmails) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `[Campus GIKI] Executive Review: ${params.eventTitle} (${params.societyName})`,
          html: htmlContent,
        });

        let previewUrl: string | undefined;
        if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        this.logActionBanner(`DSA Event Review Notice`, email, reviewUrl, previewUrl);
      } catch (error: any) {
        this.logger.warn(`Failed to dispatch DSA notice to ${email}: ${error?.message || error}`);
        this.logActionBanner(`DSA Event Review Fallback`, email, reviewUrl);
      }
    }
  }

  /**
   * Notifies the Society when their event status changes (Approved, Changes Requested, or Rejected).
   */
  async sendEventStatusUpdateToSocietyEmail(params: {
    societyEmail: string;
    societyName: string;
    eventTitle: string;
    status: 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED' | 'FORWARDED_TO_DSA';
    reviewerRole: 'Faculty Advisor' | 'DSA Directorate';
    comments?: string | null;
    eventId: string;
  }): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const actionUrl =
      params.status === 'CHANGES_REQUESTED'
        ? `${clientUrl}/events/${params.eventId}/edit`
        : `${clientUrl}/events/${params.eventId}`;

    const fromAddress =
      this.configService.get<string>('EMAIL_FROM') || '"Campus GIKI DSA" <dsa@giki.edu.pk>';

    const statusConfig = {
      APPROVED: {
        badgeColor: '#10b981',
        title: 'Event Proposal Approved! 🎉',
        desc: `Congratulations! Your event proposal <strong>${params.eventTitle}</strong> has been officially approved by the ${params.reviewerRole}.`,
        btnText: 'View Approved Event & Venue Slip',
      },
      FORWARDED_TO_DSA: {
        badgeColor: '#6366f1',
        title: 'Event Approved by Advisor & Sent to DSA',
        desc: `Your Faculty Advisor has approved <strong>${params.eventTitle}</strong>. It has now been submitted to the Directorate of Student Affairs (DSA) for final executive clearance.`,
        btnText: 'View Event Status',
      },
      CHANGES_REQUESTED: {
        badgeColor: '#f59e0b',
        title: 'Modifications Requested for Event',
        desc: `The ${params.reviewerRole} has reviewed <strong>${params.eventTitle}</strong> and requested revisions before approval.`,
        btnText: 'Edit Event Proposal',
      },
      REJECTED: {
        badgeColor: '#ef4444',
        title: 'Event Proposal Not Approved',
        desc: `Your event proposal <strong>${params.eventTitle}</strong> was not approved by the ${params.reviewerRole}.`,
        btnText: 'View Event Details',
      },
    }[params.status];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { background: ${statusConfig.badgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .comments-box { background: #0f172a; border-left: 4px solid ${statusConfig.badgeColor}; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; color: #e2e8f0; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: ${statusConfig.badgeColor}; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">${params.reviewerRole} Update</span>
            <div class="title">${statusConfig.title}</div>
          </div>
          <div class="body-text">
            Hello ${params.societyName},<br/><br/>
            ${statusConfig.desc}
          </div>
          ${
            params.comments
              ? `<div class="comments-box"><strong>Reviewer Feedback:</strong><br/>${params.comments.replace(/\n/g, '<br/>')}</div>`
              : ''
          }
          <div class="btn-container">
            <a href="${actionUrl}" class="btn" target="_blank">${statusConfig.btnText} &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.societyEmail,
        subject: `[Campus GIKI] Event Update: ${params.eventTitle} (${params.status.replace(/_/g, ' ')})`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logActionBanner(`Event Update to Society (${params.status})`, params.societyEmail, actionUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch event update to society ${params.societyEmail}: ${error?.message || error}`);
      this.logActionBanner(`Event Update to Society Fallback (${params.status})`, params.societyEmail, actionUrl);
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) return { messageId: 'mock-dev-id' };
      throw error;
    }
  }

  /**
   * Notifies the Faculty Advisor that their assigned society has submitted an Annual Calendar Plan.
   */
  async sendYearlyPlanSubmittedForAdvisorEmail(params: {
    advisorEmail: string;
    advisorName: string;
    societyName: string;
    year: number;
    eventsCount: number;
    planId: string;
  }): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const reviewUrl = `${clientUrl}/advisor/yearly-plans/${params.planId}`;
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
          .badge { background: #3b82f6; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid #334155; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
          .info-label { color: #94a3b8; font-weight: 600; width: 40%; }
          .info-value { color: #f8fafc; font-weight: 500; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Faculty Advisor Review Required</span>
            <div class="title">Annual Calendar Plan Submitted</div>
          </div>
          <div class="body-text">
            Dear <strong>${params.advisorName}</strong>,<br/><br/>
            <strong>${params.societyName}</strong> has submitted their Annual Activity Calendar for academic year <strong>${params.year}</strong>:
          </div>
          <table class="info-table">
            <tr>
              <td class="info-label">Academic Year:</td>
              <td class="info-value"><strong>${params.year}</strong></td>
            </tr>
            <tr>
              <td class="info-label">Planned Activities:</td>
              <td class="info-value">${params.eventsCount} events proposed</td>
            </tr>
          </table>
          <div class="btn-container">
            <a href="${reviewUrl}" class="btn" target="_blank">Review Yearly Calendar Plan &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.advisorEmail,
        subject: `[Campus GIKI] Annual Calendar Review Required: ${params.societyName} (${params.year})`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logActionBanner(`Yearly Plan Notice for Advisor (${params.advisorName})`, params.advisorEmail, reviewUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch yearly plan notice to advisor: ${error?.message || error}`);
      this.logActionBanner(`Yearly Plan Notice Fallback (${params.advisorName})`, params.advisorEmail, reviewUrl);
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) return { messageId: 'mock-dev-id' };
      throw error;
    }
  }

  /**
   * Notifies the DSA and DDSA administrative staff when a Faculty Advisor approves an annual calendar plan.
   */
  async sendYearlyPlanForwardedToDsaEmail(params: {
    dsaEmails: string[];
    advisorName: string;
    societyName: string;
    year: number;
    planId: string;
  }): Promise<void> {
    if (!params.dsaEmails || params.dsaEmails.length === 0) return;
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const reviewUrl = `${clientUrl}/admin/yearly-plans/${params.planId}`;
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
          .badge { background: #8b5cf6; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">DSA Executive Approval</span>
            <div class="title">Annual Calendar Approved by Advisor</div>
          </div>
          <div class="body-text">
            Dear DSA Administration,<br/><br/>
            Faculty Advisor <strong>${params.advisorName}</strong> has approved the Annual Calendar Plan for <strong>${params.societyName}</strong> (${params.year}). It is now ready for DSA review.
          </div>
          <div class="btn-container">
            <a href="${reviewUrl}" class="btn" target="_blank">Review Yearly Plan &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    for (const email of params.dsaEmails) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `[Campus GIKI] Annual Calendar Review: ${params.societyName} (${params.year})`,
          html: htmlContent,
        });

        let previewUrl: string | undefined;
        if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        this.logActionBanner(`DSA Yearly Plan Review Notice`, email, reviewUrl, previewUrl);
      } catch (error: any) {
        this.logger.warn(`Failed to dispatch DSA yearly plan notice to ${email}: ${error?.message || error}`);
        this.logActionBanner(`DSA Yearly Plan Review Fallback`, email, reviewUrl);
      }
    }
  }

  /**
   * Notifies the Society when their Yearly Calendar Plan status changes.
   */
  async sendYearlyPlanStatusUpdateToSocietyEmail(params: {
    societyEmail: string;
    societyName: string;
    year: number;
    status: 'APPROVED' | 'CHANGES_REQUESTED' | 'FORWARDED_TO_DSA';
    reviewerRole: 'Faculty Advisor' | 'DSA Directorate';
    comments?: string | null;
  }): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const actionUrl = `${clientUrl}/society/calendar`;
    const fromAddress =
      this.configService.get<string>('EMAIL_FROM') || '"Campus GIKI DSA" <dsa@giki.edu.pk>';

    const statusConfig = {
      APPROVED: {
        badgeColor: '#10b981',
        title: 'Annual Calendar Plan Approved! 🎉',
        desc: `Congratulations! Your society's Annual Activity Calendar for academic year <strong>${params.year}</strong> has received final approval from the ${params.reviewerRole}.`,
        btnText: 'View Approved Calendar',
      },
      FORWARDED_TO_DSA: {
        badgeColor: '#6366f1',
        title: 'Annual Plan Approved by Advisor & Sent to DSA',
        desc: `Your Faculty Advisor has approved your Annual Calendar for <strong>${params.year}</strong>. It has been forwarded to the Directorate of Student Affairs for final confirmation.`,
        btnText: 'Track Plan Status',
      },
      CHANGES_REQUESTED: {
        badgeColor: '#f59e0b',
        title: 'Modifications Requested for Annual Calendar',
        desc: `The ${params.reviewerRole} has reviewed your Annual Calendar for <strong>${params.year}</strong> and requested revisions.`,
        btnText: 'Update Calendar Plan',
      },
    }[params.status];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { background: ${statusConfig.badgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .comments-box { background: #0f172a; border-left: 4px solid ${statusConfig.badgeColor}; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; color: #e2e8f0; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: ${statusConfig.badgeColor}; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">${params.reviewerRole} Decision</span>
            <div class="title">${statusConfig.title}</div>
          </div>
          <div class="body-text">
            Hello ${params.societyName},<br/><br/>
            ${statusConfig.desc}
          </div>
          ${
            params.comments
              ? `<div class="comments-box"><strong>Reviewer Feedback:</strong><br/>${params.comments.replace(/\n/g, '<br/>')}</div>`
              : ''
          }
          <div class="btn-container">
            <a href="${actionUrl}" class="btn" target="_blank">${statusConfig.btnText} &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.societyEmail,
        subject: `[Campus GIKI] Annual Calendar Update (${params.year}): ${params.status.replace(/_/g, ' ')}`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logActionBanner(`Yearly Plan Update to Society (${params.status})`, params.societyEmail, actionUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch yearly plan update to society: ${error?.message || error}`);
      this.logActionBanner(`Yearly Plan Update Fallback`, params.societyEmail, actionUrl);
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) return { messageId: 'mock-dev-id' };
      throw error;
    }
  }

  /**
   * Notifies DSA administration that a Society has requested edit access for an Annual Calendar.
   */
  async sendYearlyPlanEditRequestedToDsaEmail(params: {
    dsaEmails: string[];
    societyName: string;
    year: number;
    reason: string;
    planId: string;
  }): Promise<void> {
    if (!params.dsaEmails || params.dsaEmails.length === 0) return;
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const reviewUrl = `${clientUrl}/admin/yearly-plans/${params.planId}`;
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
          .badge { background: #f59e0b; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .reason-box { background: #0f172a; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; font-size: 14px; color: #e2e8f0; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Edit Access Requested</span>
            <div class="title">Annual Calendar Edit Request</div>
          </div>
          <div class="body-text">
            Dear DSA Administration,<br/><br/>
            <strong>${params.societyName}</strong> has requested permission to unlock and edit their Annual Calendar Plan for academic year <strong>${params.year}</strong>.
          </div>
          <div class="reason-box">
            <strong>Reason for Edit Request:</strong><br/>
            ${params.reason ? params.reason.replace(/\n/g, '<br/>') : 'No reason provided'}
          </div>
          <div class="btn-container">
            <a href="${reviewUrl}" class="btn" target="_blank">Review & Resolve Request &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    for (const email of params.dsaEmails) {
      try {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: `[Campus GIKI] Edit Access Requested: ${params.societyName} (${params.year})`,
          html: htmlContent,
        });

        let previewUrl: string | undefined;
        if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        this.logActionBanner(`DSA Edit Request Notice`, email, reviewUrl, previewUrl);
      } catch (error: any) {
        this.logger.warn(`Failed to dispatch DSA edit request notice to ${email}: ${error?.message || error}`);
        this.logActionBanner(`DSA Edit Request Fallback`, email, reviewUrl);
      }
    }
  }

  /**
   * Notifies the Society when their Annual Calendar Edit Request is resolved (Approved or Rejected) by DSA.
   */
  async sendYearlyPlanEditRequestResolvedToSocietyEmail(params: {
    societyEmail: string;
    societyName: string;
    year: number;
    status: 'APPROVED' | 'REJECTED';
  }): Promise<{ messageId: string; previewUrl?: string }> {
    if (!this.transporter) await this.initTransporter();

    const clientUrl = this.configService.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const actionUrl = `${clientUrl}/society/calendar`;
    const fromAddress =
      this.configService.get<string>('EMAIL_FROM') || '"Campus GIKI DSA" <dsa@giki.edu.pk>';

    const isApproved = params.status === 'APPROVED';
    const badgeColor = isApproved ? '#10b981' : '#ef4444';
    const title = isApproved ? 'Edit Request Approved! 🔓' : 'Edit Request Declined';
    const desc = isApproved
      ? `The Directorate of Student Affairs (DSA) has <strong>approved</strong> your edit request for academic year <strong>${params.year}</strong>. Your annual calendar is now unlocked in <strong>DRAFT</strong> status so you can update planned activities and resubmit.`
      : `The Directorate of Student Affairs (DSA) has <strong>declined</strong> your edit request for academic year <strong>${params.year}</strong>. Your annual calendar remains in its current approved/locked state.`;
    const btnText = isApproved ? 'Edit Annual Calendar' : 'View Calendar';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
          .badge { background: ${badgeColor}; color: #ffffff; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .title { font-size: 22px; font-weight: bold; margin-top: 12px; color: #ffffff; }
          .body-text { color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: ${badgeColor}; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; }
          .footer { border-top: 1px solid #334155; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">DSA Directorate Decision</span>
            <div class="title">${title}</div>
          </div>
          <div class="body-text">
            Hello <strong>${params.societyName}</strong>,<br/><br/>
            ${desc}
          </div>
          <div class="btn-container">
            <a href="${actionUrl}" class="btn" target="_blank">${btnText} &rarr;</a>
          </div>
          <div class="footer">
            Ghulam Ishaq Khan Institute of Engineering Sciences and Technology &bull; Directorate of Student Affairs
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: params.societyEmail,
        subject: `[Campus GIKI] Annual Calendar Edit Request: ${params.status}`,
        html: htmlContent,
      });

      let previewUrl: string | undefined;
      if (this.isEthereal) previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      this.logActionBanner(`Yearly Plan Edit Decision to Society (${params.status})`, params.societyEmail, actionUrl, previewUrl);

      return { messageId: info.messageId, previewUrl };
    } catch (error: any) {
      this.logger.warn(`Failed to dispatch yearly plan edit decision to society: ${error?.message || error}`);
      this.logActionBanner(`Yearly Plan Edit Decision Fallback`, params.societyEmail, actionUrl);
      const isDev = this.configService.get<string>('NODE_ENV') !== 'production';
      if (isDev) return { messageId: 'mock-dev-id' };
      throw error;
    }
  }
}

