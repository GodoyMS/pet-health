import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";

import { MailService } from "../../mail/application/mail.service";
import {
  AuthChallengePurpose,
  canResendChallenge,
  generateOtpCode,
  hashOtpCode,
  OTP_TTL_MS,
  validateChallengeAttempt
} from "../domain/otp-policy";
import { AuthChallengeOrmEntity } from "../infrastructure/typeorm/auth-challenge.orm-entity";

@Injectable()
export class AuthChallengeService {
  constructor(
    @InjectRepository(AuthChallengeOrmEntity)
    private readonly repo: Repository<AuthChallengeOrmEntity>,
    private readonly mailService: MailService
  ) {}

  async issueChallenge(params: {
    email: string;
    purpose: AuthChallengePurpose;
    name: string;
    force?: boolean;
  }): Promise<{ previewCode?: string }> {
    const email = params.email.trim().toLowerCase();
    const now = new Date();

    const existing = await this.repo.findOne({
      where: { email, purpose: params.purpose, consumedAt: IsNull() },
      order: { createdAt: "DESC" }
    });

    if (existing && !params.force) {
      const resend = canResendChallenge(existing.lastSentAt, now);
      if (!resend.ok) {
        throw new HttpException(
          `Please wait ${resend.retryAfterSeconds}s before requesting another code.`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }

    const code = generateOtpCode();
    const mailResult =
      params.purpose === "email_verification"
        ? await this.mailService.sendEmailVerification({
            to: email,
            name: params.name,
            code
          })
        : await this.mailService.sendPasswordReset({
            to: email,
            name: params.name,
            code
          });

    if (existing) {
      await this.repo.update({ id: existing.id }, { consumedAt: now });
    }

    const challenge = this.repo.create({
      email,
      purpose: params.purpose,
      codeHash: hashOtpCode(code),
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
      attempts: 0,
      consumedAt: null,
      lastSentAt: now
    });
    await this.repo.save(challenge);

    return mailResult.previewCode ? { previewCode: mailResult.previewCode } : {};
  }

  async consumeChallenge(params: {
    email: string;
    purpose: AuthChallengePurpose;
    code: string;
  }): Promise<void> {
    const email = params.email.trim().toLowerCase();
    const challenge = await this.repo.findOne({
      where: { email, purpose: params.purpose, consumedAt: IsNull() },
      order: { createdAt: "DESC" }
    });

    if (!challenge) {
      throw new BadRequestException("Invalid or expired verification code.");
    }

    const result = validateChallengeAttempt({
      code: params.code,
      codeHash: challenge.codeHash,
      expiresAt: challenge.expiresAt,
      consumedAt: challenge.consumedAt,
      attempts: challenge.attempts
    });

    if (!result.ok) {
      if (result.reason === "invalid_code") {
        challenge.attempts += 1;
        await this.repo.save(challenge);
        throw new BadRequestException("Invalid or expired verification code.");
      }
      if (result.reason === "too_many_attempts") {
        throw new BadRequestException(
          "Too many incorrect attempts. Please request a new code."
        );
      }
      throw new BadRequestException("Invalid or expired verification code.");
    }

    challenge.consumedAt = new Date();
    await this.repo.save(challenge);
  }

  /** Remove all OTP / reset challenges for an email (e.g. on account deletion). */
  async deleteByEmail(email: string): Promise<void> {
    await this.repo.delete({ email: email.trim().toLowerCase() });
  }
}
