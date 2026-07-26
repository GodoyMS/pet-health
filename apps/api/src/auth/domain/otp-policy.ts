import { createHash, randomInt } from "crypto";

export type AuthChallengePurpose = "email_verification" | "password_reset";

export const OTP_CODE_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

export function generateOtpCode(length = OTP_CODE_LENGTH): string {
  const max = 10 ** length;
  return randomInt(0, max).toString().padStart(length, "0");
}

export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export function otpCodesMatch(code: string, codeHash: string): boolean {
  return hashOtpCode(code) === codeHash;
}

export type ChallengeValidationResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "consumed" | "too_many_attempts" | "invalid_code" };

export function validateChallengeAttempt(input: {
  code: string;
  codeHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
  now?: Date;
}): ChallengeValidationResult {
  const now = input.now ?? new Date();

  if (input.consumedAt) {
    return { ok: false, reason: "consumed" };
  }
  if (input.expiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: "expired" };
  }
  if (input.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }
  if (!otpCodesMatch(input.code, input.codeHash)) {
    return { ok: false, reason: "invalid_code" };
  }
  return { ok: true };
}

export function canResendChallenge(
  lastSentAt: Date,
  now: Date = new Date()
): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const elapsed = now.getTime() - lastSentAt.getTime();
  if (elapsed >= OTP_RESEND_COOLDOWN_MS) {
    return { ok: true };
  }
  return {
    ok: false,
    retryAfterSeconds: Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000)
  };
}
