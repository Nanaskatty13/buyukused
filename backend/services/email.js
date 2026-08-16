// backend/services/email.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Gmail connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error(
      "❌ Email transporter error:",
      error.message
    );
  } else {
    console.log(
      "✅ Email transporter is ready"
    );
  }
});

async function sendPasswordResetEmail(
  to,
  resetUrl,
  name
) {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "EMAIL_USER or EMAIL_PASS is not configured"
    );
  }

  const mailOptions = {
    from: `"KN Classifieds" <${process.env.EMAIL_USER}>`,

    to,

    subject:
      "Reset Your KN Classifieds Password",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px;">
        
        <h2 style="color: #111827;">
          Reset Your Password
        </h2>

        <p>
          Hello ${name || "there"},
        </p>

        <p>
          We received a request to reset your
          KN Classifieds account password.
        </p>

        <p>
          Click the button below to create a
          new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #111827;
              color: white;
              text-decoration: none;
              border-radius: 6px;
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

        <p style="font-size: 12px; color: #6b7280;">
          KN Classifieds
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendPasswordResetEmail,
};