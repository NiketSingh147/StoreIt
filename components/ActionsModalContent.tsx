// components/ActionsModalContent.tsx

"use client";

import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// =======================
//  SMALL HELPER
// =======================
function resolveSenderName(owner: any) {
  if (!owner) return "Someone";

  return (
    owner.fullName ||
    owner.name ||
    owner.full_name ||
    owner.displayName ||
    owner.username ||
    "Someone"
  );
}

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />

        <DetailRow
          label="Owner:"
          value={resolveSenderName(file.owner)}
        />

        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, onInputChange, onRemove }: Props) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Resolve sender details from file.owner
  const owner = file?.owner || {};

  const senderName = resolveSenderName(owner);
  const senderEmail =
    owner.email || owner.emailAddress || owner.mail || "";

  // DEBUG LOG - IMPORTANT
  console.log("📌 DEBUG — OWNER OBJECT IN MODAL:", owner);
  console.log("📌 DEBUG — SENDER NAME:", senderName);
  console.log("📌 DEBUG — SENDER EMAIL:", senderEmail);

  const sendEmails = async () => {
    const cleaned = emails.map((e) => e.trim()).filter(Boolean);

    if (cleaned.length === 0) {
      setStatusMessage("Enter at least one email.");
      return;
    }

    setLoading(true);
    setStatusMessage("Sending share email...");

    try {
      console.log("📨 FRONTEND PAYLOAD:", {
        fileId: file.$id,
        senderName,
        senderEmail,
        fileOwner: owner,
      });

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: file.$id,
          fileName: file.name,
          fileLink: file.url,
          emails: cleaned,
          sender: { name: senderName, email: senderEmail },
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Failed to send email");

      setStatusMessage("File shared successfully!");
      setEmails([]);
      onInputChange([]);
    } catch (error) {
      console.error("❌ EMAIL SEND ERROR:", error);
      setStatusMessage("Error sending email. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMessage(""), 4000);
    }
  };

  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>

        {/* Email input */}
        <Input
          type="text"
          placeholder="Enter comma-separated emails"
          value={emails.join(",")}
          onChange={(e) => {
            const list = e.target.value
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);

            setEmails(list);
            onInputChange(list);
          }}
          className="share-input-field"
        />

        <Button
          className="primary-btn w-full mt-2"
          onClick={sendEmails}
          disabled={loading}
        >
          {loading ? "Sending..." : "Share via Email"}
        </Button>

        {statusMessage && (
          <p className="text-center text-sm text-light-100 mt-2">
            {statusMessage}
          </p>
        )}

        {/* Already shared list */}
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {Array.isArray(file.users) ? file.users.length : 0} users
            </p>
          </div>

          <ul className="pt-2">
            {Array.isArray(file.users) &&
              file.users.map((email: string) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-2"
                >
                  <p className="subtitle-2">{email}</p>

                  <Button
                    onClick={() => onRemove(email)}
                    className="share-remove-user"
                  >
                    <Image
                      src="/assets/icons/remove.svg"
                      alt="Remove"
                      width={20}
                      height={20}
                    />
                  </Button>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
};
