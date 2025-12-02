import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite"; // matches your lib/appwrite/index.ts

export async function GET() {
  try {
    const client = await createAdminClient();
    // Use admin databases to list collections as a safe test
    const { databases } = client;
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!
    );
    return NextResponse.json({ ok: true, total: res.total });
  } catch (err: any) {
    console.error("test-admin error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
