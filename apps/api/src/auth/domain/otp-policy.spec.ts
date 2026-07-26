import {
  canResendChallenge,
  generateOtpCode,
  hashOtpCode,
  OTP_CODE_LENGTH,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  otpCodesMatch,
  validateChallengeAttempt
} from "./otp-policy";

describe("otp-policy", () => {
  it("generates a zero-padded numeric code of the expected length", () => {
    const code = generateOtpCode();
    expect(code).toHaveLength(OTP_CODE_LENGTH);
    expect(code).toMatch(/^\d+$/);
  });

  it("hashes codes deterministically", () => {
    expect(hashOtpCode("123456")).toBe(hashOtpCode("123456"));
    expect(otpCodesMatch("123456", hashOtpCode("123456"))).toBe(true);
    expect(otpCodesMatch("000000", hashOtpCode("123456"))).toBe(false);
  });

  it("rejects expired, consumed, over-attempted, and wrong codes", () => {
    const now = new Date("2026-01-01T12:00:00.000Z");
    const codeHash = hashOtpCode("123456");
    const base = {
      code: "123456",
      codeHash,
      expiresAt: new Date("2026-01-01T12:10:00.000Z"),
      consumedAt: null as Date | null,
      attempts: 0,
      now
    };

    expect(validateChallengeAttempt(base)).toEqual({ ok: true });
    expect(
      validateChallengeAttempt({
        ...base,
        expiresAt: new Date("2026-01-01T11:59:00.000Z")
      })
    ).toEqual({ ok: false, reason: "expired" });
    expect(
      validateChallengeAttempt({
        ...base,
        consumedAt: now
      })
    ).toEqual({ ok: false, reason: "consumed" });
    expect(
      validateChallengeAttempt({
        ...base,
        attempts: OTP_MAX_ATTEMPTS
      })
    ).toEqual({ ok: false, reason: "too_many_attempts" });
    expect(
      validateChallengeAttempt({
        ...base,
        code: "654321"
      })
    ).toEqual({ ok: false, reason: "invalid_code" });
  });

  it("enforces resend cooldown", () => {
    const sentAt = new Date("2026-01-01T12:00:00.000Z");
    expect(
      canResendChallenge(sentAt, new Date(sentAt.getTime() + OTP_RESEND_COOLDOWN_MS - 1000))
    ).toEqual({ ok: false, retryAfterSeconds: 1 });
    expect(
      canResendChallenge(sentAt, new Date(sentAt.getTime() + OTP_RESEND_COOLDOWN_MS))
    ).toEqual({ ok: true });
  });
});
