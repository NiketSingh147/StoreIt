import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"StoreIt" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
