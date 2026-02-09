import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const isDevelopment = process.env.NODE_ENV !== "production";

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: isDevelopment
      ? process.env.TURSO_DEV_DATABASE_URL!
      : process.env.TURSO_DATABASE_URL!,
    authToken: isDevelopment
      ? process.env.TURSO_DEV_AUTH_TOKEN!
      : process.env.TURSO_AUTH_TOKEN!,
  },
});
