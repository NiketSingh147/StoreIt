"use server";

import { createAdminClient } from "@/lib/appwrite";

export async function sendPasswordResetEmail(email: string) {
  try {
    const { account } = await createAdminClient();

    await account.createRecovery(
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    );

    return { ok: true };
  } catch (err) {
    console.error("Password reset error:", err);
    return { ok: false };
  }
}
