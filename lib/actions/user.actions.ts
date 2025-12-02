"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

// ==================================================
// GET USER BY EMAIL
// ==================================================
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

// ==================================================
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// ==================================================
// SEND OTP
// ==================================================
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    // keep using createEmailToken flow (returns userId). Use ID.unique() server-side if needed.
    const session = await account.createEmailToken("unique()", email);
    console.log("sendEmailOTP success:", session);
    return session.userId;
  } catch (error: any) {
    console.error(
      "sendEmailOTP failed - raw error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    throw error; // rethrow so caller sees failure
  }
};

// ==================================================
// CREATE USER RECORD
// ==================================================
export async function createUserRecord({
  userId,
  fullName,
  email,
}: {
  userId: string;
  fullName: string;
  email: string;
}) {
  const { databases } = await createAdminClient();

  try {
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      userId,
      {
        fullName,
        email,
        accountId: userId,
        owner: userId,
        avatar: avatarPlaceholderUrl,
      }
    );

    console.log("✔ User record created:", fullName);
  } catch (err) {
    console.log("❌ Failed to create user record:", err);
  }
}

// ==================================================
// CREATE ACCOUNT (SIGN UP)
// - NOTE: still uses OTP flow: we send OTP and create a user record in your DB.
// - The *actual* Auth account is created later when the user sets a password.
// ==================================================
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    await createUserRecord({
      userId: accountId,
      fullName,
      email,
    });
  }

  return parseStringify({ accountId });
};

// ==================================================
// VERIFY OTP & SET PASSWORD
//
// This is the important patch:
// When the user submits password (from set-password page) we:
//  1) find your DB doc by accountId,
//  2) create a real Appwrite Auth user (account.create(...)) using the same accountId,
//  3) create an email/password session and set cookie.
// ==================================================
export const verifySecret = async ({
  accountId,
  password,
  fullName,
  email
}: {
  accountId: string;
  password: string;
  fullName: string;
  email: string;
}) => {
  try {
    const { account } = await createAdminClient();

    // 1️⃣ Try creating a REAL Auth user (only if it doesn’t already exist)
    try {
      await account.create(accountId, email, password, fullName);
      console.log("✔ Auth user created");
    } catch (err: any) {
      // If user already exists — ignore conflict
      if (err.code === 409) {
        console.log("ℹ Auth user already exists (409 conflict)");
      } else {
        console.error("❌ Failed to create Auth user:", err);
        throw err;
      }
    }

    // 2️⃣ Start an Appwrite password session (login)
    const session = await account.createEmailPasswordSession(email, password);

    // 3️⃣ Save session token in secure cookie
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    };

    (await cookies()).set("appwrite-session", session.secret, cookieOptions);

    console.log("✔ OTP Verified → Session created");
    return { ok: true, sessionId: session.$id };

  } catch (error) {
    console.error("❌ verifySecret error:", error);
    return { ok: false, error: "Failed to verify OTP" };
  }
};
// ==================================================
// CURRENT USER  (PATCHED FOR SAFE SESSION)
// ==================================================
export const getCurrentUser = async () => {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) {
      console.warn("⚠ getCurrentUser(): No session — returning null");
      return null;
    }

    const { databases, account } = sessionClient;

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)]
    );

    if (user.total <= 0) return null;
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log("getCurrentUser error:", error);
    return null;
  }
};

// ==================================================
// SIGN OUT USER (PATCHED)
// ==================================================
export const signOutUser = async () => {
  const sessionClient = await createSessionClient();
  if (!sessionClient) {
    console.warn("⚠ signOutUser(): No session — skipping deleteSession");
    (await cookies()).delete("appwrite-session");
    redirect("/sign-in");
    return;
  }

  const { account } = sessionClient;

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

// ==================================================
// GET USER BY ACCOUNT ID  (OWNER INFO FOR FILES)
// ==================================================
export async function getUserById(userId: string) {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("$id", userId)]
    );

    if (result.total > 0) return result.documents[0];

    console.log("⚠ No user doc found for:", userId);
    return null;
  } catch (error) {
    console.log("Failed to fetch user:", error);
    return null;
  }
}

// ==================================================
// SIGN IN USER
// ==================================================
export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

// ==================================================
// LOGIN WITH PASSWORD
// ==================================================

export const loginWithPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    // 1. Check if email exists in our DB
    const user = await getUserByEmail(email);
    if (!user) {
      return { ok: false, errorType: "NO_USER", error: "User not registered" };
    }

    // 2. Try password login
    try {
      const session = await account.createEmailPasswordSession(email, password);

      // Store cookie
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        sameSite: "strict" as const,
        secure: process.env.NODE_ENV === "production",
      };

      (await cookies()).set("appwrite-session", session.secret, cookieOptions);

      return { ok: true };
    } catch (err: any) {
      // Appwrite error 401 = wrong password
      return { ok: false, errorType: "WRONG_PASSWORD", error: "Incorrect password" };
    }
  } catch (err: any) {
    console.error("Password login error:", err);
    return { ok: false, errorType: "UNKNOWN", error: "Login failed" };
  }
};
