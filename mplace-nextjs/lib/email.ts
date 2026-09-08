import nodemailer from "nodemailer";

// Create transporter function to ensure env vars are loaded
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();

  // Remove all whitespace (spaces, tabs, newlines) from password
  // Also remove quotes if present (sometimes .env files have quotes)
  let password = process.env.SMTP_PASSWORD?.trim() || "";
  password = password.replace(/\s+/g, "").replace(/^["']|["']$/g, "");

  if (!user || !password) {
    throw new Error(
      "SMTP_USER and SMTP_PASSWORD must be set in environment variables"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // true for 465, false for other ports
    auth: {
      user: user.trim(),
      pass: password, // Use App Password for Gmail, not regular password
    },
    // Increase timeouts for better reliability
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 30000, // 30 seconds
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}) {
  try {
    // Create transporter on each call to ensure fresh env vars
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
      replyTo,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    // Provide helpful error messages
    if (error?.code === "EAUTH") {
      return {
        success: false,
        error:
          "SMTP authentication failed. Please check your SMTP_USER and SMTP_PASSWORD. For Gmail, use an App Password (16 characters, no spaces).",
      };
    }

    return { success: false, error };
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your email",
    html: `
      <h1>Verify your email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <h1>Reset your password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
}

export async function sendContactEmail({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const authorEmail =
    process.env.AUTHOR_EMAIL ||
    process.env.SMTP_USER ||
    "support@backtheme.com";

  const emailHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br>")}</p>
    <hr>
    <p><small>This message was sent from the contact form on ${
      process.env.NEXTAUTH_URL || "your website"
    }</small></p>
  `;

  const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ""}
Subject: ${subject}

Message:
${message}

---
This message was sent from the contact form on ${
    process.env.NEXTAUTH_URL || "your website"
  }
  `;

  // Send email with reply-to set to the user's email so admin can reply directly
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: authorEmail,
      replyTo: email, // Set reply-to to the user's email
      subject: `Contact Form: ${subject}`,
      text: emailText,
      html: emailHtml,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    return { success: false, error };
  }
}
