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
    const session = await account.createEmailToken("unique()", email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
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
// VERIFY OTP
// ==================================================
export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    const cookieOptions = {
      path: "/",
      httpOnly: true,
      sameSite: "strict" as const,
      secure: process.env.NODE_ENV === "production",
    };

    (await cookies()).set("appwrite-session", session.secret, cookieOptions);

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
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
