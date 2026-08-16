// backend/services/email.js

const nodemailer = require("nodemailer");

// ============================================================
// ENVIRONMENT VALIDATION
// ============================================================

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn(
    "⚠️ EMAIL_USER or EMAIL_PASS is not configured."
  );
}

// ============================================================
// SMTP TRANSPORTER
// ============================================================
//
// Gmail:
// EMAIL_USER = your Gmail address
// EMAIL_PASS = Google App Password
//
// IMPORTANT:
// EMAIL_PASS must NOT be your normal Gmail password.
// ============================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",

  port: 465,

  secure: true,

  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },

  // Prevent SMTP from hanging indefinitely.
  connectionTimeout: 10000,

  greetingTimeout: 10000,

  socketTimeout: 15000,

  // Require TLS certificate validation.
  tls: {
    rejectUnauthorized: true,
  },
});

// ============================================================
// VERIFY EMAIL CONFIGURATION
// ============================================================

const verifyEmailTransporter = async () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      "⚠️ Email transporter verification skipped."
    );

    console.warn(
      "⚠️ Set EMAIL_USER and EMAIL_PASS in Render Environment Variables."
    );

    return false;
  }

  try {
    await transporter.verify();

    console.log(
      `✅ Email transporter is ready: ${EMAIL_USER}`
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Email transporter verification failed:"
    );

    console.error(
      "   Code:",
      error.code || "N/A"
    );

    console.error(
      "   Command:",
      error.command || "N/A"
    );

    console.error(
      "   Response:",
      error.response || "N/A"
    );

    console.error(
      "   Message:",
      error.message
    );

    return false;
  }
};

// Verify in the background.
// Do not prevent the server from starting if
// Gmail is temporarily unavailable.
verifyEmailTransporter();

// ============================================================
// HTML ESCAPE
// ============================================================
//
// Prevent user-provided values such as the user's name
// from being inserted directly into HTML.
// ============================================================

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

async function sendPasswordResetEmail(
  to,
  resetUrl,
  name
) {
  // ----------------------------------------------------------
  // Validate environment
  // ----------------------------------------------------------

  if (!EMAIL_USER) {
    throw new Error(
      "EMAIL_USER is not configured"
    );
  }

  if (!EMAIL_PASS) {
    throw new Error(
      "EMAIL_PASS is not configured"
    );
  }

  // ----------------------------------------------------------
  // Validate recipient
  // ----------------------------------------------------------

  if (!to) {
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
  // Escape display name
  // ----------------------------------------------------------

  const safeName =
    escapeHtml(name || "there");

  // ----------------------------------------------------------
  // Email
  // ----------------------------------------------------------

  const mailOptions = {
    from: `"KN Classifieds" <${EMAIL_USER}>`,

    to,

    subject:
      "Reset Your KN Classifieds Password",

    text: `
Hello ${name || "there"},

We received a request to reset your KN Classifieds account password.

Reset your password here:

${resetUrl}

This password reset link will expire in 1 hour.

If you did not request this password reset, you can safely ignore this email.

KN Classifieds
    `.trim(),

    html: `
<!DOCTYPE html>
<html>
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
    background: #f3f4f6;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <div
    style="
      width: 100%;
      padding: 40px 0;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 12px;
        padding: 35px;
        box-sizing: border-box;
      "
    >

      <h2
        style="
          margin: 0 0 20px;
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
        Hello ${safeName},
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
        Click the button below to create a
        new password:
      </p>

      <div
        style="
          margin: 30px 0;
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
            font-weight: bold;
            font-size: 15px;
          "
        >
          Reset Password
        </a>
      </div>

      <p
        style="
          color: #374151;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        This password reset link will expire
        in <strong>1 hour</strong>.
      </p>

      <p
        style="
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        If you did not request this password
        reset, you can safely ignore this email.
      </p>

      <hr
        style="
          border: none;
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
    `.trim(),
  };

  // ----------------------------------------------------------
  // Send email
  // ----------------------------------------------------------

  try {
    console.log(
      `📧 Sending password reset email to: ${to}`
    );

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "✅ Password reset email sent successfully."
    );

    console.log(
      "📨 Message ID:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "❌ Failed to send password reset email:"
    );

    console.error(
      "   Code:",
      error.code || "N/A"
    );

    console.error(
      "   Command:",
      error.command || "N/A"
    );

    console.error(
      "   Response:",
      error.response || "N/A"
    );

    console.error(
      "   Message:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendPasswordResetEmail,
  verifyEmailTransporter,
};