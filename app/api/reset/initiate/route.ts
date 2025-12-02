// app/api/reset/initiate/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { ok: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const { account } = await createAdminClient();

    // IMPORTANT: Appwrite expects EMAIL, not userId.
    await account.createRecovery(
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("RESET ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Reset failed" },
      { status: 500 }
    );
  }
}
