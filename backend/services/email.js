// backend/services/email.js

const { Resend } = require("resend");

// ============================================================
// RESEND CONFIGURATION
// ============================================================

const RESEND_API_KEY =
  String(
    process.env.RESEND_API_KEY || ""
  ).trim();

const EMAIL_FROM =
  String(
    process.env.EMAIL_FROM ||
      "buyukused <onboarding@resend.dev>"
  ).trim();

// ============================================================
// RESEND CLIENT
// ============================================================

const resend =
  RESEND_API_KEY
    ? new Resend(
        RESEND_API_KEY
      )
    : null;

// ============================================================
// STARTUP LOGGING
// ============================================================

if (!RESEND_API_KEY) {
  console.error(
    "❌ RESEND_API_KEY is NOT configured."
  );
} else {
  console.log(
    "✅ Resend API key configured."
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
  // CHECK RESEND
  // ----------------------------------------------------------

  if (!resend) {
    const error =
      new Error(
        "RESEND_API_KEY is not configured"
      );

    error.code =
      "RESEND_API_KEY_MISSING";

    throw error;
  }

  // ----------------------------------------------------------
  // RECIPIENT
  // ----------------------------------------------------------

  const recipient =
    String(to || "")
      .trim()
      .toLowerCase();

  if (!recipient) {
    const error =
      new Error(
        "Recipient email is missing"
      );

    error.code =
      "RECIPIENT_MISSING";

    throw error;
  }

  // ----------------------------------------------------------
  // RESET URL
  // ----------------------------------------------------------

  if (!resetUrl) {
    const error =
      new Error(
        "Password reset URL is missing"
      );

    error.code =
      "RESET_URL_MISSING";

    throw error;
  }

  // ----------------------------------------------------------
  // DISPLAY NAME
  // ----------------------------------------------------------

  const displayName =
    String(
      name || "there"
    ).trim();

  // ----------------------------------------------------------
  // TEXT EMAIL
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

<div
style="
max-width:600px;
margin:40px auto;
padding:20px;
"
>

<div
style="
background:#ffffff;
border-radius:14px;
padding:35px;
box-shadow:0 4px 20px rgba(0,0,0,0.06);
"
>

<h2
style="
margin:0 0 18px;
color:#111827;
font-size:25px;
font-weight:800;
"
>
Reset Your Password
</h2>

<p
style="
margin:0 0 15px;
color:#374151;
font-size:15px;
line-height:1.6;
"
>
Hello ${displayName},
</p>

<p
style="
margin:0 0 15px;
color:#374151;
font-size:15px;
line-height:1.6;
"
>
We received a request to reset your
KN Classifieds account password.
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
href="${resetUrl}"
style="
display:inline-block;
padding:14px 26px;
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
This password reset link will expire
in <strong>1 hour</strong>.
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
  // SEND EMAIL
  // ----------------------------------------------------------

  try {
    console.log(
      "📨 Sending password reset email..."
    );

    console.log(
      "📬 Recipient:",
      recipient
    );

    console.log(
      "📤 From:",
      EMAIL_FROM
    );

    const result =
      await resend.emails.send({
        from: EMAIL_FROM,

        to: [
          recipient,
        ],

        subject:
          "Reset Your KN Classifieds Password",

        text,

        html,
      });

    // --------------------------------------------------------
    // RESEND ERROR
    // --------------------------------------------------------

    if (result?.error) {
      console.error(
        "❌ Resend returned an error:"
      );

      console.error(
        "Name:",
        result.error.name
      );

      console.error(
        "Message:",
        result.error.message
      );

      console.error(
        "Full error:",
        result.error
      );

      const error =
        new Error(
          result.error.message ||
            "Resend failed to send email"
        );

      error.code =
        result.error.name ||
        "RESEND_ERROR";

      error.data =
        result.error;

      throw error;
    }

    // --------------------------------------------------------
    // SUCCESS
    // --------------------------------------------------------

    console.log(
      "✅ Password reset email sent."
    );

    console.log(
      "📨 Resend message ID:",
      result?.data?.id ||
        "N/A"
    );

    return result?.data;
  } catch (error) {
    console.error(
      "❌ Email sending failed."
    );

    console.error(
      "Message:",
      error?.message ||
        error
    );

    console.error(
      "Code:",
      error?.code ||
        "N/A"
    );

    console.error(
      "Data:",
      error?.data ||
        "N/A"
    );

    throw error;
  }
}

// ============================================================
// VERIFY CONFIGURATION
// ============================================================

async function verifyEmailConfiguration() {
  if (!resend) {
    console.error(
      "❌ Resend is not configured."
    );

    return false;
  }

  console.log(
    "✅ Resend client is configured."
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