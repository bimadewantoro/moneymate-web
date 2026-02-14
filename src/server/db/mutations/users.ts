"use server";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function updateUserBaseCurrency(userId: string, baseCurrency: string) {
  await db.update(users).set({ baseCurrency }).where(eq(users.id, userId));
}
