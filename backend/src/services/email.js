const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendPasswordResetEmail(to, resetUrl, name) {
  const mailOptions = {
    from: `"KN Classifieds" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request",
    html: `
      <h1>Hello ${name || ""},</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail };