import {
  BadGatewayException,
  Injectable,
  Logger
} from "@nestjs/common";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { configEnvs } from "../../config/configEnvs";
import {
  buildPasswordResetEmail,
  buildVerificationEmail
} from "../infrastructure/email-templates";

export type MailSendResult = {
  delivered: boolean;
  /** Populated when SES is disabled or falls back in non-production. */
  previewCode?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly sesClient: SESv2Client | null;

  constructor() {
    this.sesClient = configEnvs.isSesEnabled
      ? new SESv2Client({
          region: configEnvs.AWS_REGION,
          ...(configEnvs.AWS_ACCESS_KEY_ID && configEnvs.AWS_SECRET_ACCESS_KEY
            ? {
                credentials: {
                  accessKeyId: configEnvs.AWS_ACCESS_KEY_ID,
                  secretAccessKey: configEnvs.AWS_SECRET_ACCESS_KEY
                }
              }
            : {})
        })
      : null;
  }

  async sendEmailVerification(params: {
    to: string;
    name: string;
    code: string;
  }): Promise<MailSendResult> {
    const template = buildVerificationEmail({
      name: params.name,
      code: params.code
    });
    return this.dispatch({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      previewCode: params.code
    });
  }

  async sendPasswordReset(params: {
    to: string;
    name: string;
    code: string;
  }): Promise<MailSendResult> {
    const template = buildPasswordResetEmail({
      name: params.name,
      code: params.code
    });
    return this.dispatch({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      previewCode: params.code
    });
  }

  private async dispatch(params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    previewCode: string;
  }): Promise<MailSendResult> {
    if (!this.sesClient || !configEnvs.SES_FROM_EMAIL) {
      return this.consoleDeliver(params);
    }

    try {
      await this.sesClient.send(
        new SendEmailCommand({
          FromEmailAddress: configEnvs.SES_FROM_EMAIL,
          Destination: { ToAddresses: [params.to] },
          Content: {
            Simple: {
              Subject: { Data: params.subject, Charset: "UTF-8" },
              Body: {
                Html: { Data: params.html, Charset: "UTF-8" },
                Text: { Data: params.text, Charset: "UTF-8" }
              }
            }
          },
          ...(configEnvs.SES_CONFIGURATION_SET
            ? { ConfigurationSetName: configEnvs.SES_CONFIGURATION_SET }
            : {})
        })
      );
      return { delivered: true };
    } catch (err) {
      const detail = this.describeSesError(err);
      this.logger.error(`SES send failed for ${params.to}: ${detail}`);

      // SES sandbox rejects unverified recipients — keep local workflows usable.
      if (configEnvs.NODE_ENV !== "production") {
        this.logger.warn(
          "Falling back to console delivery. In SES sandbox, verify the recipient " +
            "identity or request production access: " +
            "https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html"
        );
        return this.consoleDeliver(params);
      }

      throw new BadGatewayException(
        "Could not send verification email. Please try again later."
      );
    }
  }

  private consoleDeliver(params: {
    to: string;
    subject: string;
    previewCode: string;
  }): MailSendResult {
    this.logger.warn(
      `[mail:console] To=${params.to} Subject="${params.subject}" Code=${params.previewCode}`
    );
    return { delivered: false, previewCode: params.previewCode };
  }

  private describeSesError(err: unknown): string {
    if (!err || typeof err !== "object") {
      return String(err);
    }
    const maybe = err as {
      name?: string;
      message?: string;
      Code?: string;
    };
    return [maybe.name ?? maybe.Code, maybe.message].filter(Boolean).join(": ");
  }
}
