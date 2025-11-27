"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// ==========================================================
// UPLOAD FILE
// ==========================================================
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

// ==========================================================
// CREATE QUERIES
// ==========================================================
const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }

  return queries;
};

// ==========================================================
// GET FILES — FULLY PATCHED (NO SESSION ERRORS)
// ==========================================================
export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    // ⭐ IMPORTANT: No more crashes
    if (!currentUser) {
      console.warn("⚠ getFiles(): No logged-in user — returning []");
      return { documents: [] };
    }

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const filesRes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries
    );

    // ⭐ Fetch owner info from Users collection
    const filesWithOwners = await Promise.all(
      filesRes.documents.map(async (file) => {
        try {
          const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            file.owner
          );

          return {
            ...file,
            owner: {
              fullName: user.fullName,
              email: user.email,
              avatar: user.avatar,
              $id: user.$id,
            },
          };
        } catch {
          return {
            ...file,
            owner: {
              fullName: "Unknown User",
              email: "",
              avatar: "",
            },
          };
        }
      })
    );

    // console.log("FILES WITH OWNERS:", filesWithOwners);

    return parseStringify({
      ...filesRes,
      documents: filesWithOwners,
    });
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

// ==========================================================
// RENAME FILE
// ==========================================================
export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { name: newName }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

// ==========================================================
// UPDATE FILE USERS
// ==========================================================
export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { users: emails }
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

// ==========================================================
// DELETE FILE
// ==========================================================
export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    const deleted = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );

    if (deleted) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

// ==========================================================
// TOTAL SPACE USED — PATCHED FOR SAFE SESSION
// ==========================================================
export async function getTotalSpaceUsed() {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) {
      console.warn("⚠ getTotalSpaceUsed(): No session — returning 0");
      return parseStringify({
        used: 0,
        all: 2 * 1024 * 1024 * 1024,
      });
    }

    const { databases } = sessionClient;

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.warn("⚠ getTotalSpaceUsed(): No user — returning 0");
      return { used: 0, all: 2 * 1024 * 1024 * 1024 };
    }

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])]
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used");
  }
}
