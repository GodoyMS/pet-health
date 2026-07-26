import { z } from "zod";

import { httpClient } from "@shared/api/httpClient";

const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  provider: z.enum(["email", "google"]).default("email"),
  role: z.enum(["user", "admin"]).default("user")
});

export type AdminUser = z.infer<typeof adminUserSchema>;

export const authApi = {
  async login(payload: { email: string; password: string }): Promise<AdminUser> {
    const response = await httpClient.post("/auth/login", payload);
    return adminUserSchema.parse(response.data);
  },
  async me(): Promise<AdminUser> {
    const response = await httpClient.get("/auth/me");
    return adminUserSchema.parse(response.data);
  },
  async logout(): Promise<void> {
    await httpClient.post("/auth/logout");
  }
};
