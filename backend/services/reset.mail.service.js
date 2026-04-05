const { sendSingleEmail } = require("./mail.core");

function buildResetLinkTemplate(resetUrl) {
  return {
    subject: "Password Reset Request - hubrobe.",
    html: `
      <h2 style="text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
      <p>Tap the button below to choose a new password. If you didn't request this, you can ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 15px 35px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Reset Password</a>
      </div>
      <p style="font-size: 13px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 12px; word-break: break-all; color: #444;">${resetUrl}</p>
      <p style="font-size: 12px; color: #888;">This link expires in 10 minutes.</p>
    `,
  };
}

/** @param {string} email @param {string} resetUrl full URL including token */
async function sendResetPasswordEmail(email, resetUrl) {
  const { subject, html } = buildResetLinkTemplate(resetUrl);
  return sendSingleEmail(email, subject, html, "ResetMail");
}

module.exports = { sendResetPasswordEmail };
