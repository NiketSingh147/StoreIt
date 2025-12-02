import { Client, Account, Databases, Storage, Avatars, Functions } from "node-appwrite";

// 🔥 CONFIG
export const appwriteConfig = {
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!, // USE SGP REGION
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,
  secretKey: process.env.APPWRITE_API_KEY!,
};

// 🔥 ADMIN CLIENT (SERVER)
const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)   // FIXED HERE
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.secretKey);

export const adminAccount = new Account(client);
export const adminDatabases = new Databases(client);
export const adminStorage = new Storage(client);
export const adminAvatars = new Avatars(client);
export const adminFunctions = new Functions(client);

// EXPORT ALL
export default {
  client,
  account: adminAccount,
  databases: adminDatabases,
  storage: adminStorage,
  avatars: adminAvatars,
  functions: adminFunctions,
};

// 🔥 SESSION CLIENT (LOGGED-IN USER)
export const createSessionClient = async () => {
  const cookieStore = require("next/headers").cookies();
  const session = cookieStore.get("appwrite-session")?.value;

  if (!session) return null;

  const sessionClient = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)   // FIXED HERE TOO
    .setProject(appwriteConfig.projectId)
    .setSession(session);

  return {
    account: new Account(sessionClient),
    databases: new Databases(sessionClient),
    storage: new Storage(sessionClient),
  };
};
