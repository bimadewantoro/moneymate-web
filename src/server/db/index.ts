import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const isDevelopment = process.env.NODE_ENV !== "production";

const url =
  (isDevelopment
    ? process.env.TURSO_DEV_DATABASE_URL
    : process.env.TURSO_DATABASE_URL) || "file:local.db";

const authToken = isDevelopment
  ? process.env.TURSO_DEV_AUTH_TOKEN
  : process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });
