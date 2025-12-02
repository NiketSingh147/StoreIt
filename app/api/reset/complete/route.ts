import { Client, Account } from "node-appwrite";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, secret, password } = await req.json();

    if (!userId || !secret || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const account = new Account(client);

    // ✔ Correct call for Appwrite free-tier reset system
    await account.updateRecovery(
      userId,   // NOT secretId → free-tier uses userId
      secret,
      password,
      password
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("RESET COMPLETE ERROR:", err);

    // Pass exact Appwrite error to frontend
    const msg = err?.message || "Reset failed";

    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
