// ============================================================
// backend/services/email.js
// BuyUKUsed / KN Classifieds Email Service
// Resend
// ============================================================

const { Resend } = require("resend");

// ============================================================
// ENVIRONMENT CONFIGURATION
// ============================================================

const RESEND_API_KEY = String(
  process.env.RESEND_API_KEY || ""
).trim();

const EMAIL_FROM = String(
  process.env.EMAIL_FROM ||
    "buyukused <onboarding@resend.dev>"
).trim();

// ============================================================
// RESEND CLIENT
// ============================================================

const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null;

// ============================================================
// STARTUP LOGGING
// ============================================================

console.log("============================================================");
console.log("📧 EMAIL SERVICE");
console.log("============================================================");

if (RESEND_API_KEY) {
  console.log("✅ RESEND_API_KEY configured");
} else {
  console.error("❌ RESEND_API_KEY NOT configured");
}

console.log("📤 Email sender:", EMAIL_FROM);

console.log("============================================================");

// ============================================================
// VALIDATE EMAIL
// ============================================================

const isValidEmail = (email) => {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(
    String(email || "").trim()
  );
};

// ============================================================
// ESCAPE HTML
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
  // ==========================================================
  // CHECK RESEND CLIENT
  // ==========================================================

  if (!resend) {
    const error = new Error(
      "RESEND_API_KEY is not configured."
    );

    error.code = "RESEND_API_KEY_MISSING";

    throw error;
  }

  // ==========================================================
  // NORMALIZE RECIPIENT
  // ==========================================================

  const recipient = String(to || "")
    .trim()
    .toLowerCase();

  if (!recipient) {
    const error = new Error(
      "Recipient email is missing."
    );

    error.code = "RECIPIENT_MISSING";

    throw error;
  }

  // ==========================================================
  // VALIDATE RECIPIENT
  // ==========================================================

  if (!isValidEmail(recipient)) {
    const error = new Error(
      `Invalid recipient email address: ${recipient}`
    );

    error.code = "INVALID_RECIPIENT";

    throw error;
  }

  // ==========================================================
  // CHECK RESET URL
  // ==========================================================

  const passwordResetUrl =
    String(resetUrl || "").trim();

  if (!passwordResetUrl) {
    const error = new Error(
      "Password reset URL is missing."
    );

    error.code = "RESET_URL_MISSING";

    throw error;
  }

  // ==========================================================
  // DISPLAY NAME
  // ==========================================================

  const displayName = String(
    name || "there"
  ).trim();

  const safeDisplayName =
    escapeHtml(displayName);

  // ==========================================================
  // TEXT EMAIL
  // ==========================================================

  const text = `
Hello ${displayName},

We received a request to reset your BuyUKUsed account password.

Click the link below to create a new password:

${passwordResetUrl}

This password reset link will expire in 1 hour.

If you did not request this password reset, you can safely ignore this email.

BuyUKUsed
  `.trim();

  // ==========================================================
  // HTML EMAIL
  // ==========================================================

  const html = `
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
margin:0;
padding:0;
background:#f5f7fa;
font-family:Arial,Helvetica,sans-serif;
"
>

<table
width="100%"
cellpadding="0"
cellspacing="0"
border="0"
style="
background:#f5f7fa;
padding:40px 20px;
"
>

<tr>

<td align="center">

<table
width="100%"
cellpadding="0"
cellspacing="0"
border="0"
style="
max-width:600px;
background:#ffffff;
border-radius:14px;
overflow:hidden;
"
>

<!-- HEADER -->

<tr>

<td
style="
background:#111827;
padding:28px 35px;
text-align:center;
"
>

<h1
style="
margin:0;
color:#ffffff;
font-size:24px;
font-weight:800;
"
>
BuyUKUsed
</h1>

</td>

</tr>

<!-- CONTENT -->

<tr>

<td
style="
padding:35px;
"
>

<h2
style="
margin:0 0 18px;
color:#111827;
font-size:24px;
font-weight:800;
"
>
Reset Your Password
</h2>

<p
style="
margin:0 0 16px;
color:#374151;
font-size:15px;
line-height:1.6;
"
>
Hello ${safeDisplayName},
</p>

<p
style="
margin:0 0 16px;
color:#374151;
font-size:15px;
line-height:1.6;
"
>
We received a request to reset your
BuyUKUsed account password.
</p>

<p
style="
margin:0 0 25px;
color:#374151;
font-size:15px;
line-height:1.6;
"
>
Click the button below to create a new password:
</p>

<div
style="
text-align:center;
margin:30px 0;
"
>

<a
href="${passwordResetUrl}"
style="
display:inline-block;
padding:14px 28px;
background:#111827;
color:#ffffff;
text-decoration:none;
border-radius:8px;
font-weight:700;
font-size:15px;
"
>
Reset Password
</a>

</div>

<p
style="
margin:0 0 15px;
color:#4b5563;
font-size:14px;
line-height:1.6;
"
>
This password reset link will expire in
<strong>1 hour</strong>.
</p>

<p
style="
margin:0;
color:#4b5563;
font-size:14px;
line-height:1.6;
"
>
If you did not request this password reset,
you can safely ignore this email.
</p>

<hr
style="
border:0;
border-top:1px solid #e5e7eb;
margin:30px 0;
"
/>

<p
style="
margin:0;
color:#9ca3af;
font-size:12px;
line-height:1.5;
"
>
This is an automated message from BuyUKUsed.
</p>

</td>

</tr>

<!-- FOOTER -->

<tr>

<td
style="
padding:20px 35px;
background:#f9fafb;
text-align:center;
"
>

<p
style="
margin:0;
color:#9ca3af;
font-size:12px;
"
>
© ${new Date().getFullYear()} BuyUKUsed
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
  `.trim();

  // ==========================================================
  // SEND WITH RESEND
  // ==========================================================

  try {
    console.log("============================================================");
    console.log("📨 PASSWORD RESET EMAIL");
    console.log("============================================================");

    console.log("📬 Recipient:", recipient);
    console.log("📤 From:", EMAIL_FROM);
    console.log("🔗 Reset URL generated: YES");
    console.log("🔐 Reset token: NOT LOGGED");

    // --------------------------------------------------------
    // RESEND REQUEST
    // --------------------------------------------------------

    const result =
      await resend.emails.send({
        from: EMAIL_FROM,
        to: [recipient],
        subject:
          "Reset Your BuyUKUsed Password",
        text,
        html,
      });

    // --------------------------------------------------------
    // RESEND API ERROR
    // --------------------------------------------------------

    if (result?.error) {
      console.error(
        "============================================================"
      );

      console.error(
        "❌ RESEND API ERROR"
      );

      console.error(
        "============================================================"
      );

      console.error(
        "Name:",
        result.error.name || "N/A"
      );

      console.error(
        "Message:",
        result.error.message || "N/A"
      );

      console.error(
        "Status:",
        result.error.statusCode ||
          result.error.status ||
          "N/A"
      );

      console.error(
        "Full error:",
        result.error
      );

      const error = new Error(
        result.error.message ||
          "Resend failed to send the email."
      );

      error.code =
        result.error.name ||
        "RESEND_API_ERROR";

      error.statusCode =
        result.error.statusCode ||
        result.error.status;

      error.data = result.error;

      throw error;
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log(
      "============================================================"
    );

    console.log(
      "✅ PASSWORD RESET EMAIL SENT"
    );

    console.log(
      "============================================================"
    );

    console.log(
      "📨 Resend ID:",
      result?.data?.id || "N/A"
    );

    return result?.data;

  } catch (error) {
    // ========================================================
    // EMAIL ERROR
    // ========================================================

    console.error(
      "============================================================"
    );

    console.error(
      "❌ PASSWORD RESET EMAIL FAILED"
    );

    console.error(
      "============================================================"
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
      "Status:",
      error?.statusCode ||
        error?.status ||
        "N/A"
    );

    console.error(
      "Data:",
      error?.data || "N/A"
    );

    console.error(
      "Stack:",
      error?.stack || "N/A"
    );

    console.error(
      "============================================================"
    );

    throw error;
  }
}

// ============================================================
// VERIFY EMAIL CONFIGURATION
// ============================================================

async function verifyEmailConfiguration() {
  try {
    if (!RESEND_API_KEY) {
      console.error(
        "❌ Email verification failed: RESEND_API_KEY missing."
      );

      return false;
    }

    if (!resend) {
      console.error(
        "❌ Email verification failed: Resend client unavailable."
      );

      return false;
    }

    console.log(
      "✅ Resend email service is configured."
    );

    console.log(
      "📤 Configured sender:",
      EMAIL_FROM
    );

    return true;

  } catch (error) {
    console.error(
      "❌ Email configuration verification failed:",
      error
    );

    return false;
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConfiguration,
};