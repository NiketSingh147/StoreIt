// app/api/send-reset-link/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ ok: false, error: "Email required" });
    }

    const { account } = await createAdminClient();

    await account.createMagicURLSession(
      "reset-session",
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.log("RESET ERROR:", err);
    return NextResponse.json({ ok: false, error: "Failed to send link" });
  }
}
