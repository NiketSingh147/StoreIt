import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    const sessionClient = await createSessionClient();
    if (!sessionClient) {
      return NextResponse.json(
        { ok: false, error: "No active session" },
        { status: 401 }
      );
    }

    const { account } = sessionClient;

    // 1. Get current OTP user
    const me = await account.get(); // returns userId + temp_email

    // 2. Make sure user has an email (needed for password accounts)
    if (!me.email) {
      return NextResponse.json(
        { ok: false, error: "User email missing" },
        { status: 400 }
      );
    }

    // 3. Convert OTP account → real email/password account
    await account.updatePassword(password);

    // 4. Destroy OTP session, force login with new password
    (await cookies()).delete("appwrite-session");

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Password update error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
