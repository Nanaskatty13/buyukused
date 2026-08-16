// backend/services/email.js

const nodemailer = require("nodemailer");

// ============================================================
// EMAIL CONFIGURATION
// ============================================================

const EMAIL_USER = String(
  process.env.EMAIL_USER || ""
).trim();

const EMAIL_PASS = String(
  process.env.EMAIL_PASS || ""
).trim();

// ============================================================
// VALIDATE EMAIL CONFIGURATION
// ============================================================

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn(
    "⚠️ EMAIL_USER or EMAIL_PASS is not configured."
  );
}

// ============================================================
// GMAIL SMTP TRANSPORTER
// ============================================================
//
// IMPORTANT:
// - Use port 587 instead of 465.
// - Force IPv4 with family: 4.
// - This avoids Render IPv6 connection problems.
// - Gmail requires an App Password when 2-Step
//   Verification is enabled.
//
// ============================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",

  port: 587,

  secure: false,

  family: 4,

  requireTLS: true,

  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },

  connectionTimeout: 15000,

  greetingTimeout: 15000,

  socketTimeout: 20000,

  tls: {
    minVersion: "TLSv1.2",
  },
});

// ============================================================
// VERIFY EMAIL TRANSPORTER
// ============================================================

const verifyEmailTransporter = async () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      "⚠️ Email transporter verification skipped because EMAIL_USER or EMAIL_PASS is missing."
    );

    return false;
  }

  try {
    await transporter.verify();

    console.log(
      "✅ Email transporter is ready"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Email transporter verification failed:"
    );

    console.error(
      "Message:",
      error?.message || error
    );

    console.error(
      "Code:",
      error?.code || "N/A"
    );

    console.error(
      "Command:",
      error?.command || "N/A"
    );

    console.error(
      "Response:",
      error?.response || "N/A"
    );

    return false;
  }
};

// Verify when the backend starts.
//
// IMPORTANT:
// Do NOT crash the server if Gmail is temporarily
// unavailable. The rest of the website should remain
// operational.

verifyEmailTransporter();

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

async function sendPasswordResetEmail(
  to,
  resetUrl,
  name
) {
  // ----------------------------------------------------------
  // Validate configuration
  // ----------------------------------------------------------

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASS is not configured"
    );
  }

  // ----------------------------------------------------------
  // Validate recipient
  // ----------------------------------------------------------

  const recipient = String(
    to || ""
  )
    .trim()
    .toLowerCase();

  if (!recipient) {
    throw new Error(
      "Password reset recipient email is missing"
    );
  }

  // ----------------------------------------------------------
  // Validate reset URL
  // ----------------------------------------------------------

  if (!resetUrl) {
    throw new Error(
      "Password reset URL is missing"
    );
  }

  // ----------------------------------------------------------
  // Safe display name
  // ----------------------------------------------------------

  const displayName =
    String(name || "there")
      .trim();

  // ----------------------------------------------------------
  // Email
  // ----------------------------------------------------------

  const mailOptions = {
    from: `"KN Classifieds" <${EMAIL_USER}>`,

    to: recipient,

    subject:
      "Reset Your KN Classifieds Password",

    text: `
Hello ${displayName},

We received a request to reset your KN Classifieds account password.

Use the following link to create a new password:

${resetUrl}

This password reset link will expire in 1 hour.

If you did not request this password reset, you can safely ignore this email.

KN Classifieds
    `.trim(),

    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <title>Reset Your Password</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f5f7fa;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      max-width: 600px;
      margin: 40px auto;
      padding: 0 20px;
    "
  >
    <div
      style="
        background: #ffffff;
        border-radius: 12px;
        padding: 35px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      "
    >

      <h2
        style="
          margin: 0 0 15px;
          color: #111827;
          font-size: 24px;
        "
      >
        Reset Your Password
      </h2>

      <p
        style="
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        "
      >
        Hello ${displayName},
      </p>

      <p
        style="
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        "
      >
        We received a request to reset your
        KN Classifieds account password.
      </p>

      <p
        style="
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        "
      >
        Click the button below to create a new password:
      </p>

      <div
        style="
          margin: 30px 0;
          text-align: center;
        "
      >
        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background: #111827;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            font-size: 15px;
          "
        >
          Reset Password
        </a>
      </div>

      <p
        style="
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        This password reset link will expire
        in <strong>1 hour</strong>.
      </p>

      <p
        style="
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        If you did not request this password reset,
        you can safely ignore this email.
      </p>

      <hr
        style="
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 30px 0;
        "
      />

      <p
        style="
          margin: 0;
          color: #9ca3af;
          font-size: 12px;
        "
      >
        KN Classifieds
      </p>

    </div>
  </div>
</body>
</html>
    `,
  };

  // ----------------------------------------------------------
  // Send
  // ----------------------------------------------------------

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "✅ Password reset email sent:",
      info?.messageId || "message sent"
    );

    return info;
  } catch (error) {
    console.error(
      "❌ Password reset email failed:"
    );

    console.error(
      "Message:",
      error?.message || error
    );

    console.error(
      "Code:",
      error?.code || "N/A"
    );

    console.error(
      "Command:",
      error?.command || "N/A"
    );

    console.error(
      "Response:",
      error?.response || "N/A"
    );

    throw error;
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendPasswordResetEmail,
  verifyEmailTransporter,
};