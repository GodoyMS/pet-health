export type AuthProvider = "email" | "google";

export type UserRole = "user" | "admin";

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string | null,
    public readonly provider: AuthProvider = "email",
    public readonly googleId: string | null = null,
    public readonly role: UserRole = "user"
  ) {}
}
