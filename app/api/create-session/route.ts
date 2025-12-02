// app/api/create-session/route.ts
import { NextResponse } from "next/server";
import appwrite from "@/lib/appwrite/config";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { accountId, secret } = await req.json();

    if (!accountId || !secret) {
      return NextResponse.json({ ok: false, error: "Missing accountId or secret" }, { status: 400 });
    }

    // Use the ADMIN client from your config to verify the OTP and create a session
    // (account.createSession(userId, secret) works for OTP secret in your SDK)
    const session = await appwrite.account.createSession(accountId, secret);

    // Save the session secret in a cookie so createSessionClient can find it
    cookies().set("appwrite-session", session.secret, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("create-session error:", err);
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
