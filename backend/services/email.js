// ============================================================
// backend/services/email.js
// BuyUKUsed - Resend Email Service
// ============================================================

const { Resend } = require("resend");

// ============================================================
// CONFIGURATION
// ============================================================

const RESEND_API_KEY = String(
  process.env.RESEND_API_KEY || ""
).trim();

const NODE_ENV =
  process.env.NODE_ENV || "development";

// ------------------------------------------------------------
// Sender
// ------------------------------------------------------------
//
// DEVELOPMENT / TESTING:
//
//   onboarding@resend.dev
//
// PRODUCTION:
//
//   Use an email address from a domain you verified
//   inside Resend.
//
// Example:
//
//   BuyUKUsed <noreply@buyukused.com>
//
// Set this in Render:
//
//   EMAIL_FROM=BuyUKUsed <noreply@buyukused.com>
//
// ============================================================

const EMAIL_FROM =
  String(
    process.env.EMAIL_FROM ||
      "BuyUKUsed <onboarding@resend.dev>"
  ).trim();

// ============================================================
// FRONTEND URL
// ============================================================

const FRONTEND_URL = String(
  process.env.FRONTEND_URL ||
    "https://buyukused.vercel.app"
)
  .trim()
  .replace(/\/+$/, "");

// ============================================================
// INITIALIZE RESEND
// ============================================================

let resend = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);

  console.log(
    "============================================================"
  );

  console.log(
    "📧 EMAIL SERVICE"
  );

  console.log(
    "============================================================"
  );

  console.log(
    "✅ RESEND_API_KEY configured"
  );

  console.log(
    "📤 Email sender:",
    EMAIL_FROM
  );

  console.log(
    "🌐 Frontend URL:",
    FRONTEND_URL
  );

  console.log(
    "🌍 Environment:",
    NODE_ENV
  );

  console.log(
    "============================================================"
  );
} else {
  console.error(
    "============================================================"
  );

  console.error(
    "❌ RESEND_API_KEY IS NOT CONFIGURED"
  );

  console.error(
    "============================================================"
  );
}

// ============================================================
// VALIDATE EMAIL
// ============================================================

const isValidEmail = (email) => {
  const value = String(email || "")
    .trim()
    .toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
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
// PASSWORD RESET EMAIL
// ============================================================

const sendPasswordResetEmail = async (
  recipientEmail,
  resetUrl,
  recipientName = "there"
) => {
  // ----------------------------------------------------------
  // VALIDATE RESEND
  // ----------------------------------------------------------

  if (!resend) {
    const error =
      new Error(
        "RESEND_API_KEY is not configured."
      );

    error.code =
      "RESEND_API_KEY_MISSING";

    throw error;
  }

  // ----------------------------------------------------------
  // VALIDATE RECIPIENT
  // ----------------------------------------------------------

  const email = String(
    recipientEmail || ""
  )
    .trim()
    .toLowerCase();

  if (!isValidEmail(email)) {
    const error =
      new Error(
        "Invalid recipient email address."
      );

    error.code =
      "INVALID_RECIPIENT_EMAIL";

    throw error;
  }

  // ----------------------------------------------------------
  // VALIDATE RESET URL
  // ----------------------------------------------------------

  if (!resetUrl) {
    const error =
      new Error(
        "Password reset URL is missing."
      );

    error.code =
      "RESET_URL_MISSING";

    throw error;
  }

  // ----------------------------------------------------------
  // NAME
  // ----------------------------------------------------------

  const safeName = escapeHtml(
    recipientName || "there"
  );

  // ----------------------------------------------------------
  // HTML EMAIL
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

  <title>Reset your BuyUKUsed password</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
    color:#111827;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background:#f5f5f5;padding:40px 15px;"
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
            box-shadow:0 4px 20px rgba(0,0,0,0.08);
          "
        >

          <!-- HEADER -->

          <tr>
            <td
              style="
                background:#111827;
                padding:28px 30px;
                text-align:center;
              "
            >

              <div
                style="
                  color:#ffffff;
                  font-size:25px;
                  font-weight:800;
                "
              >
                BuyUKUsed
              </div>

              <div
                style="
                  color:#d1d5db;
                  font-size:13px;
                  margin-top:6px;
                "
              >
                Your trusted marketplace
              </div>

            </td>
          </tr>

          <!-- BODY -->

          <tr>
            <td
              style="
                padding:40px 35px;
              "
            >

              <h1
                style="
                  margin:0 0 18px;
                  font-size:26px;
                  line-height:1.3;
                  color:#111827;
                "
              >
                Reset your password
              </h1>

              <p
                style="
                  margin:0 0 18px;
                  font-size:16px;
                  line-height:1.7;
                  color:#374151;
                "
              >
                Hello ${safeName},
              </p>

              <p
                style="
                  margin:0 0 22px;
                  font-size:15px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                We received a request to reset the
                password for your BuyUKUsed account.
              </p>

              <p
                style="
                  margin:0 0 28px;
                  font-size:15px;
                  line-height:1.7;
                  color:#4b5563;
                "
              >
                Click the button below to create a
                new password.
              </p>

              <!-- BUTTON -->

              <table
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin:0 auto 30px;"
              >

                <tr>
                  <td
                    align="center"
                    style="
                      border-radius:8px;
                      background:#111827;
                    "
                  >

                    <a
                      href="${resetUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display:inline-block;
                        padding:14px 28px;
                        color:#ffffff;
                        text-decoration:none;
                        font-size:15px;
                        font-weight:700;
                        border-radius:8px;
                      "
                    >
                      Reset My Password
                    </a>

                  </td>
                </tr>

              </table>

              <p
                style="
                  margin:0 0 12px;
                  font-size:13px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                This password reset link expires
                in <strong>1 hour</strong>.
              </p>

              <p
                style="
                  margin:0 0 20px;
                  font-size:13px;
                  line-height:1.6;
                  color:#6b7280;
                "
              >
                If you did not request a password
                reset, you can safely ignore this
                email.
              </p>

              <!-- FALLBACK URL -->

              <div
                style="
                  margin-top:25px;
                  padding:15px;
                  background:#f9fafb;
                  border:1px solid #e5e7eb;
                  border-radius:8px;
                "
              >

                <p
                  style="
                    margin:0 0 8px;
                    font-size:12px;
                    color:#6b7280;
                  "
                >
                  If the button does not work,
                  copy and paste this link into
                  your browser:
                </p>

                <a
                  href="${resetUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    word-break:break-all;
                    font-size:12px;
                    color:#2563eb;
                  "
                >
                  ${resetUrl}
                </a>

              </div>

            </td>
          </tr>

          <!-- FOOTER -->

          <tr>
            <td
              style="
                padding:22px 30px;
                background:#f9fafb;
                border-top:1px solid #e5e7eb;
                text-align:center;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:12px;
                  color:#9ca3af;
                  line-height:1.6;
                "
              >
                © ${new Date().getFullYear()}
                BuyUKUsed. All rights reserved.
              </p>

              <p
                style="
                  margin:6px 0 0;
                  font-size:12px;
                  color:#9ca3af;
                "
              >
                ${FRONTEND_URL}
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
`;

  // ----------------------------------------------------------
  // PLAIN TEXT VERSION
  // ----------------------------------------------------------

  const text = `
Hello ${recipientName || "there"},

We received a request to reset the password
for your BuyUKUsed account.

Reset your password here:

${resetUrl}

This password reset link expires in 1 hour.

If you did not request a password reset,
you can safely ignore this email.

BuyUKUsed
${FRONTEND_URL}
`.trim();

  // ----------------------------------------------------------
  // SEND
  // ----------------------------------------------------------

  console.log(
    "============================================================"
  );

  console.log(
    "📨 RESEND EMAIL REQUEST"
  );

  console.log(
    "============================================================"
  );

  console.log(
    "📤 From:",
    EMAIL_FROM
  );

  console.log(
    "📬 To:",
    email
  );

  console.log(
    "📝 Subject:",
    "Reset your BuyUKUsed password"
  );

  try {
    const result =
      await resend.emails.send({
        from: EMAIL_FROM,

        to: [email],

        subject:
          "Reset your BuyUKUsed password",

        html,

        text,

        replyTo:
          process.env.EMAIL_REPLY_TO ||
          undefined,
      });

    // --------------------------------------------------------
    // RESEND SDK ERROR
    // --------------------------------------------------------

    if (result?.error) {
      const resendError =
        new Error(
          result.error.message ||
            "Resend failed to send email."
        );

      // Preserve useful Resend information.
      resendError.code =
        result.error.name ||
        "RESEND_API_ERROR";

      resendError.statusCode =
        result.error.statusCode ||
        result.error.status ||
        null;

      resendError.resendError =
        result.error;

      console.error(
        "❌ Resend returned an error:"
      );

      console.error(
        JSON.stringify(
          result.error,
          null,
          2
        )
      );

      throw resendError;
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log(
      "✅ Password reset email sent."
    );

    console.log(
      "📬 Recipient:",
      email
    );

    console.log(
      "🆔 Resend ID:",
      result?.data?.id ||
        "unknown"
    );

    console.log(
      "============================================================"
    );

    return result;
  } catch (error) {
    // --------------------------------------------------------
    // ERROR LOGGING
    // --------------------------------------------------------

    console.error(
      "============================================================"
    );

    console.error(
      "❌ RESEND EMAIL FAILED"
    );

    console.error(
      "============================================================"
    );

    console.error(
      "Message:",
      error?.message ||
        "Unknown error"
    );

    console.error(
      "Name:",
      error?.name ||
        "Unknown"
    );

    console.error(
      "Code:",
      error?.code ||
        "Unknown"
    );

    console.error(
      "Status:",
      error?.statusCode ??
        error?.status ??
        "Unknown"
    );

    if (error?.resendError) {
      console.error(
        "Resend error:",
        JSON.stringify(
          error.resendError,
          null,
          2
        )
      );
    }

    console.error(
      "Stack:",
      error?.stack ||
        "No stack"
    );

    console.error(
      "============================================================"
    );

    throw error;
  }
};

// ============================================================
// GENERIC EMAIL FUNCTION
// ============================================================

const sendEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
}) => {
  if (!resend) {
    throw new Error(
      "RESEND_API_KEY is not configured."
    );
  }

  const recipient = String(
    to || ""
  )
    .trim()
    .toLowerCase();

  if (!isValidEmail(recipient)) {
    throw new Error(
      "Invalid recipient email address."
    );
  }

  const result =
    await resend.emails.send({
      from: EMAIL_FROM,

      to: [recipient],

      subject:
        String(subject || "").trim() ||
        "BuyUKUsed",

      html:
        html ||
        "<p>BuyUKUsed</p>",

      text:
        text ||
        undefined,

      replyTo:
        replyTo ||
        process.env.EMAIL_REPLY_TO ||
        undefined,
    });

  if (result?.error) {
    const error =
      new Error(
        result.error.message ||
          "Unable to send email."
      );

    error.code =
      result.error.name ||
      "RESEND_API_ERROR";

    error.statusCode =
      result.error.statusCode ||
      result.error.status ||
      null;

    error.resendError =
      result.error;

    throw error;
  }

  return result;
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
};