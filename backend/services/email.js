// backend/services/email.js

const { Resend } = require("resend");

// ============================================================
// RESEND CONFIGURATION
// ============================================================

const RESEND_API_KEY = String(
  process.env.RESEND_API_KEY || ""
).trim();

// Sender email.
//
// IMPORTANT:
// For initial testing you can use:
// onboarding@resend.dev
//
// Once you verify your own domain in Resend, change this to:
// "KN Classifieds <no-reply@yourdomain.com>"
//
const EMAIL_FROM = String(
  process.env.EMAIL_FROM ||
    "KN Classifieds <onboarding@resend.dev>"
).trim();

// ============================================================
// RESEND CLIENT
// ============================================================

const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null;

// ============================================================
// CONFIGURATION CHECK
// ============================================================

if (!RESEND_API_KEY) {
  console.warn(
    "⚠️ RESEND_API_KEY is not configured."
  );
} else {
  console.log(
    "✅ Resend email API configured"
  );
}

console.log(
  "📧 Email sender:",
  EMAIL_FROM
);

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

async function sendPasswordResetEmail(
  to,
  resetUrl,
  name
) {
  // ----------------------------------------------------------
  // Validate API key
  // ----------------------------------------------------------

  if (!resend) {
    throw new Error(
      "RESEND_API_KEY is not configured"
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

  const displayName = String(
    name || "there"
  ).trim();

  // ----------------------------------------------------------
  // Plain text version
  // ----------------------------------------------------------

  const text = `
Hello ${displayName},

We received a request to reset your KN Classifieds account password.

Click the link below to create a new password:

${resetUrl}

This password reset link will expire in 1 hour.

If you did not request this password reset, you can safely ignore this email.

KN Classifieds
  `.trim();

  // ----------------------------------------------------------
  // HTML version
  // ----------------------------------------------------------

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
      padding: 20px;
    "
  >

    <div
      style="
        background: #ffffff;
        border-radius: 14px;
        padding: 35px;
        box-shadow:
          0 4px 20px rgba(0, 0, 0, 0.06);
      "
    >

      <!-- HEADER -->

      <h2
        style="
          margin: 0 0 18px;
          color: #111827;
          font-size: 25px;
          font-weight: 800;
        "
      >
        Reset Your Password
      </h2>

      <!-- GREETING -->

      <p
        style="
          margin: 0 0 15px;
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        "
      >
        Hello ${displayName},
      </p>

      <!-- MESSAGE -->

      <p
        style="
          margin: 0 0 15px;
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
          margin: 0 0 25px;
          color: #374151;
          font-size: 15px;
          line-height: 1.6;
        "
      >
        Click the button below to create a new password:
      </p>

      <!-- RESET BUTTON -->

      <div
        style="
          text-align: center;
          margin: 30px 0;
        "
      >

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 14px 26px;
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

      <!-- EXPIRATION -->

      <p
        style="
          margin: 0 0 15px;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        This password reset link will expire
        in <strong>1 hour</strong>.
      </p>

      <!-- SECURITY MESSAGE -->

      <p
        style="
          margin: 0;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
        "
      >
        If you did not request this password reset,
        you can safely ignore this email.
      </p>

      <!-- DIVIDER -->

      <hr
        style="
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 30px 0;
        "
      />

      <!-- FOOTER -->

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
  `.trim();

  // ----------------------------------------------------------
  // SEND THROUGH RESEND HTTP API
  // ----------------------------------------------------------

  try {
    console.log(
      "📨 Sending password reset email to:",
      recipient
    );

    const { data, error } =
      await resend.emails.send({
        from: EMAIL_FROM,

        to: [recipient],

        subject:
          "Reset Your KN Classifieds Password",

        text,

        html,
      });

    // --------------------------------------------------------
    // Resend returned an error
    // --------------------------------------------------------

    if (error) {
      console.error(
        "❌ Resend API error:",
        error
      );

      const resendError =
        new Error(
          error.message ||
            "Unable to send email"
        );

      resendError.code =
        error.name ||
        "RESEND_ERROR";

      resendError.data =
        error;

      throw resendError;
    }

    // --------------------------------------------------------
    // Success
    // --------------------------------------------------------

    console.log(
      "✅ Password reset email sent successfully"
    );

    console.log(
      "📨 Resend message ID:",
      data?.id || "N/A"
    );

    return data;

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
      "Data:",
      error?.data || "N/A"
    );

    throw error;
  }
}

// ============================================================
// OPTIONAL TEST FUNCTION
// ============================================================
//
// This does NOT send an email automatically.
// It can be imported if you want to test the API manually.
//

async function verifyEmailConfiguration() {
  if (!resend) {
    console.warn(
      "⚠️ Cannot verify Resend configuration."
    );

    return false;
  }

  console.log(
    "✅ Resend API client is configured."
  );

  return true;
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendPasswordResetEmail,
  verifyEmailConfiguration,
};