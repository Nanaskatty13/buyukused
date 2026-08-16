// backend/services/email.js

const nodemailer = require("nodemailer");

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

if (!process.env.EMAIL_USER) {
  console.warn(
    "⚠️ EMAIL_USER is not configured."
  );
}

if (!process.env.EMAIL_PASS) {
  console.warn(
    "⚠️ EMAIL_PASS is not configured."
  );
}

// ============================================================
// EMAIL TRANSPORTER
// ============================================================

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ============================================================
// VERIFY EMAIL CONNECTION
// ============================================================

transporter.verify((error, success) => {
  if (error) {
    console.error(
      "❌ Email transporter verification failed:",
      error.message
    );
  } else {
    console.log(
      "✅ Email transporter is ready"
    );
  }
});

// ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

async function sendPasswordResetEmail(
  to,
  resetUrl,
  name
) {
  if (!process.env.EMAIL_USER) {
    throw new Error(
      "EMAIL_USER is not configured on the server"
    );
  }

  if (!process.env.EMAIL_PASS) {
    throw new Error(
      "EMAIL_PASS is not configured on the server"
    );
  }

  if (!to) {
    throw new Error(
      "Recipient email is required"
    );
  }

  if (!resetUrl) {
    throw new Error(
      "Password reset URL is required"
    );
  }

  const mailOptions = {
    from: `"BuyUk Used" <${process.env.EMAIL_USER}>`,

    to,

    subject:
      "Password Reset Request - BuyUk Used",

    html: `
      <!DOCTYPE html>

      <html>
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
              background: #ffffff;
              padding: 32px;
              border-radius: 12px;
            "
          >

            <h1>
              Hello ${name || "there"},
            </h1>

            <p>
              You requested to reset your
              KN Classifieds account password.
            </p>

            <p>
              Click the button below to create
              a new password.
            </p>

            <p style="margin: 30px 0;">
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
            </p>

            <p>
              This password reset link will expire
              in 1 hour.
            </p>

            <p>
              If you did not request this password
              reset, you can safely ignore this email.
            </p>

            <hr />

            <p
              style="
                color: #777;
                font-size: 12px;
              "
            >
              KN Classifieds
            </p>

          </div>

        </body>
      </html>
    `,
  };

  const result =
    await transporter.sendMail(
      mailOptions
    );

  console.log(
    "✅ Password reset email sent:",
    {
      messageId:
        result.messageId,
      to,
    }
  );

  return result;
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  sendPasswordResetEmail,
};