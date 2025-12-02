// scripts/testAdminClient.js
const { Client, Account, Databases } = require("node-appwrite");

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(process.env.APPWRITE_API_KEY);

(async () => {
  try {
    const account = new Account(client);
    const databases = new Databases(client);
    const r = await databases.listDocuments(process.env.NEXT_PUBLIC_APPWRITE_DATABASE, process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION);
    console.log("OK", r.total);
  } catch (e) {
    console.error("DIRECT TEST ERROR", e);
  }
})();
