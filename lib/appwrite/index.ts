"use server";

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";

// SESSION CLIENT (USER)
export const createSessionClient = async () => {
  const session = (await cookies()).get("appwrite-session")?.value;

  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl) // SAME REGION
    .setProject(appwriteConfig.projectId);

  if (!session) {
    console.warn("⚠ No session found");
    return null;
  }

  client.setSession(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
};

// ADMIN CLIENT (SERVER)
export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl) // SAME REGION
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.secretKey);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    avatars: new Avatars(client),
  };
};
