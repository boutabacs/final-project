const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with connection issues on some hosts
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Nodemailer configuration error:", error.message);
  } else {
    console.log("Nodemailer: Server is ready to take our messages");
  }
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"hubrobe" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully to:", to, "ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email to:", to, "Error:", error.message);
    throw error;
  }
};

module.exports = sendMail;
