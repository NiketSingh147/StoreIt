import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  try {
    const { emails, fileName, fileLink, sender } = await req.json();

    console.log("SENDER RECEIVED ON SERVER:", sender);

    const senderName =
      sender?.name ||
      sender?.fullName ||
      sender?.displayName ||
      "Someone";

    const senderEmail =
      sender?.email ||
      sender?.emailAddress ||
      sender?.mail ||
      "";

    const senderLine = senderEmail
      ? `${senderName} (${senderEmail}) has shared a file with you`
      : `${senderName} has shared a file with you`;

    // Get file extension for icon
    const extension = fileName.split(".").pop()?.toUpperCase() ?? "";

    const html = `
    <div style="background:#f5f7fa; padding:32px; font-family:Arial, sans-serif;">
      <div style="
        max-width:520px;
        margin:0 auto;
        background:white;
        border-radius:12px;
        padding:32px;
        border:1px solid #e5e7eb;
      ">
      
        <!-- Logo -->
        <div style="text-align:center; margin-bottom:24px;">
          <img src="https://i.imgur.com/I9QvF9U.png" 
               alt="StoreIt Logo" 
               style="width:120px; opacity:0.92;" />
        </div>

        <!-- Message -->
        <h2 style="margin:0 0 18px; font-size:20px; font-weight:600; color:#111;">
          ${senderLine}
        </h2>

        <!-- File Card -->
        <div style="
          border:1px solid #e5e7eb;
          padding:20px;
          border-radius:8px;
          margin-bottom:22px;
          display:flex;
          background:#fafafa;
        ">
          <!-- File Icon -->
          <div style="
            width:48px;
            height:48px;
            border-radius:8px;
            background:#2563eb;
            color:white;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:14px;
            font-weight:bold;
            margin-right:16px;
          ">
            ${extension}
          </div>

          <!-- File Info -->
          <div style="flex:1;">
            <p style="margin:0; font-size:16px; font-weight:600; color:#111;">
              ${fileName}
            </p>
            <p style="margin:4px 0 0; font-size:13px; color:#666;">
              Click below to download your shared file.
            </p>
          </div>
        </div>

        <!-- Button -->
        <div style="text-align:center; margin-top:20px;">
          <a 
            href="${fileLink}" 
            style="
              background:#2563eb;
              color:white;
              padding:12px 22px;
              border-radius:6px;
              text-decoration:none;
              font-size:16px;
              font-weight:bold;
              display:inline-block;
            "
          >
            Download File
          </a>
        </div>

        <!-- Footer -->
        <p style="color:#888; font-size:12px; margin-top:25px; text-align:center;">
          This file was shared with you via <strong>StoreIt</strong>.
        </p>

      </div>
    </div>
    `;

    for (let email of emails) {
      await sendEmail({
        to: email,
        subject: `📁 ${fileName} shared with you`,
        html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.log("send-email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



// import { NextResponse } from "next/server";
// import { sendEmail } from "@/lib/sendEmail";

// export async function POST(req: Request) {
//   try {
//     const { emails, fileName, fileLink, sender } = await req.json();

//     console.log("SENDER RECEIVED ON SERVER:", sender);

//     // Extract sender details safely
//     const senderName =
//       sender?.name ||
//       sender?.fullName ||
//       sender?.displayName ||
//       "Someone";

//     const senderEmail =
//       sender?.email ||
//       sender?.emailAddress ||
//       sender?.mail ||
//       "";

//     // Build sender line: include email only if available
//     const senderLine = senderEmail
//       ? `${senderName} (${senderEmail}) has shared a file with you.`
//       : `${senderName} has shared a file with you.`;

//     // Email template
//     const html = `
//       <div style="font-family: Arial, sans-serif; font-size: 15px; color:#111;">
//         <p><strong>${senderLine}</strong></p>

//         <p style="margin: 6px 0; font-size: 15px;">
//           <strong>${fileName}</strong>
//         </p>

//         <a href="${fileLink}"
//            style="display:inline-block; padding:10px 14px; border-radius:6px;
//                   background:#2563eb; color:white; text-decoration:none; font-weight:bold;">
//           Download File
//         </a>

//         <p style="margin-top:12px; font-size:12px; color:#666;">
//           Shared via StoreIt.
//         </p>
//       </div>
//     `;

//     // Send email to each recipient
//     for (let email of emails) {
//       await sendEmail({
//         to: email,
//         subject: `📁 ${fileName} shared with you`,
//         html,
//       });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.log("send-email error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }



