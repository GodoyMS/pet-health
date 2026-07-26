import "reflect-metadata";

/**
 * Promote (or demote) a user's backoffice role directly in the database,
 * without booting Nest. Usage:
 *
 *   pnpm run admin:promote user@example.com          # role = admin
 *   pnpm run admin:promote user@example.com user     # role = user (demote)
 */

function say(message: string): void {
  console.error(`[admin] ${message}`);
}

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();
  const role = (process.argv[3]?.trim() || "admin").toLowerCase();

  if (!email) {
    throw new Error("Usage: pnpm run admin:promote <email> [admin|user]");
  }
  if (role !== "admin" && role !== "user") {
    throw new Error(`Invalid role "${role}". Use "admin" or "user".`);
  }

  const dotenv = await import("dotenv");
  dotenv.config({});
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Same untyped-require pattern as seed.cli.ts: `pg` ships no types here.
  const { Client } = require("pg") as {
    Client: new (config: { connectionString: string }) => {
      connect(): Promise<void>;
      query(
        sql: string,
        params?: unknown[]
      ): Promise<{ rowCount: number | null; rows: { email: string; role: string }[] }>;
      end(): Promise<void>;
    };
  };
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const res = await client.query(
      'UPDATE users SET role = $1 WHERE LOWER(email) = $2 RETURNING id, email, role',
      [role, email]
    );
    if (res.rowCount === 0) {
      throw new Error(`No user found with email "${email}". Register first.`);
    }
    say(`${res.rows[0].email} is now "${res.rows[0].role}".`);
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[admin] failed: ${msg}`);
  process.exit(1);
});
