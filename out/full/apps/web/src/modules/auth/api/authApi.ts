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

const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email()
});

export type AuthUser = z.infer<typeof authUserSchema>;

const logoutResponseSchema = z.object({
  success: z.boolean().optional()
});

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthUser> {
    const response = await httpClient.post("/auth/login", payload);
    return authUserSchema.parse(response.data);
  },
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const response = await httpClient.post("/auth/register", payload);
    return authUserSchema.parse(response.data);
  },
  async me(): Promise<AuthUser> {
    const response = await httpClient.get("/auth/me");
    return authUserSchema.parse(response.data);
  },
  async logout(): Promise<z.infer<typeof logoutResponseSchema>> {
    const response = await httpClient.post("/auth/logout");
    return logoutResponseSchema.parse(response.data ?? {});
  }
};

