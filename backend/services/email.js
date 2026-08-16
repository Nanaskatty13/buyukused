
// backend/services/email.js

const nodemailer = require("nodemailer");

// ======================================================
// GMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// SEND PASSWORD RESET EMAIL
// ======================================================

async function sendPasswordResetEmail(
  to,
  resetUrl,
  name
) {
  if (!to) {
    throw new Error(
      "Password reset email recipient is required."
    );
  }

  if (!resetUrl) {
    throw new Error(
      "Password reset URL is required."
    );
  }

  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "Email service is not configured. Missing EMAIL_USER or EMAIL_PASS."
    );
  }

  const mailOptions = {
    from: `"KN Classifieds" <${process.env.EMAIL_USER}>`,

    to,

    subject:
      "Password Reset Request",

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Password Reset</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              padding: 32px;
              background: #ffffff;
              border-radius: 12px;
            "
          >

            <h1
              style="
                color: #111827;
                margin-bottom: 20px;
              "
            >
              Hello ${name || ""},
            </h1>

            <p
              style="
                color: #4b5563;
                line-height: 1.6;
              "
            >
              You requested a password reset for
              your KN Classifieds account.
            </p>

            <p
              style="
                color: #4b5563;
                line-height: 1.6;
              "
            >
              Click the button below to create
              a new password.
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
                  background: #7c3aed;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>
            </div>

            <p
              style="
                color: #6b7280;
                font-size: 14px;
                line-height: 1.6;
              "
            >
              This password reset link will
              expire in 1 hour.
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
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 30px 0;
              "
            />

            <p
              style="
                color: #111827;
                font-size: 14px;
              "
            >
              Regards,<br />
              <strong>KN Classifieds</strong>
            </p>

          </div>
        </body>
      </html>
    `,
  };

  try {
    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "✅ Password reset email sent:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "❌ Password reset email failed:",
      error.message
    );

    throw error;
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  sendPasswordResetEmail,
};
