import { z } from "zod";

import { httpClient } from "@shared/api/httpClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface VerifyCodePayload {
  email: string;
  code: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  provider: z.enum(["email", "google"]).default("email"),
  emailVerified: z.boolean().optional().default(true)
});

const verificationStartedSchema = z.object({
  email: z.string().email(),
  requiresVerification: z.literal(true),
  previewCode: z.string().optional()
});

const messageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  previewCode: z.string().optional()
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthProvider = AuthUser["provider"];
export type VerificationStarted = z.infer<typeof verificationStartedSchema>;
export type AuthMessageResponse = z.infer<typeof messageResponseSchema>;

const logoutResponseSchema = z.object({
  success: z.boolean().optional()
});

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const response = await httpClient.post("/auth/login", payload);
    return authUserSchema.parse(response.data);
  },
  async register(payload: RegisterPayload): Promise<VerificationStarted> {
    const response = await httpClient.post("/auth/register", payload);
    return verificationStartedSchema.parse(response.data);
  },
  async verifyEmail(payload: VerifyCodePayload): Promise<AuthUser> {
    const response = await httpClient.post("/auth/verify-email", payload);
    return authUserSchema.parse(response.data);
  },
  async resendVerification(email: string): Promise<AuthMessageResponse> {
    const response = await httpClient.post("/auth/resend-verification", { email });
    return messageResponseSchema.parse(response.data);
  },
  async forgotPassword(email: string): Promise<AuthMessageResponse> {
    const response = await httpClient.post("/auth/forgot-password", { email });
    return messageResponseSchema.parse(response.data);
  },
  async resetPassword(payload: ResetPasswordPayload): Promise<AuthMessageResponse> {
    const response = await httpClient.post("/auth/reset-password", payload);
    return messageResponseSchema.parse(response.data);
  },
  async me(): Promise<AuthUser> {
    const response = await httpClient.get("/auth/me");
    return authUserSchema.parse(response.data);
  },
  async logout(): Promise<z.infer<typeof logoutResponseSchema>> {
    const response = await httpClient.post("/auth/logout");
    return logoutResponseSchema.parse(response.data ?? {});
  },
  async deleteAccount(): Promise<z.infer<typeof logoutResponseSchema>> {
    const response = await httpClient.delete("/auth/me");
    return logoutResponseSchema.parse(response.data ?? {});
  }
};
