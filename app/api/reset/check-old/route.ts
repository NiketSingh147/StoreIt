import { NextResponse } from "next/server";
import { Client, Account, Users } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password) {
      return NextResponse.json({ samePassword: false });
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const account = new Account(client);
    const users = new Users(client);

    // 1️⃣ Fetch the user's email using userId
    const user = await users.get(userId);
    const email = user.email;

    // 2️⃣ Try login with (email + new password)
    try {
      await account.createEmailPasswordSession(email, password);
      return NextResponse.json({ samePassword: true }); // SAME password
    } catch {
      return NextResponse.json({ samePassword: false }); // DIFFERENT password
    }
  } catch {
    return NextResponse.json({ samePassword: false });
  }
}
