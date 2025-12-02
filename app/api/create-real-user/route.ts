import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite";

export async function POST(req: Request) {
  try {
    const { userId, email, fullName, password } = await req.json();

    const { account } = await createAdminClient();

    // Create REAL Appwrite Auth User
    await account.create(userId, email, password, fullName);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || err },
      { status: 500 }
    );
  }
}
