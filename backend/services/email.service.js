const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Common Email Layout
 */
const emailLayout = (content) => `
  <div style="font-family: 'Sofia Pro', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; color: #000;">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0;">hubrobe.</h1>
    </div>
    ${content}
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
      <p style="font-size: 12px; color: #888; margin-bottom: 10px;">&copy; 2026 hubrobe. All rights reserved.</p>
      <div style="font-size: 12px; color: #888;">
        <a href="#" style="color: #888; text-decoration: underline;">Unsubscribe</a> | 
        <a href="#" style="color: #888; text-decoration: underline;">Privacy Policy</a>
      </div>
    </div>
  </div>
`;

/**
 * Email Templates
 */
const templates = {
  welcome: (couponCode) => ({
    subject: "Welcome to hubrobe. - Your 20% Discount Inside",
    html: `
      <h2 style="text-align: center; margin-bottom: 20px;">Welcome to the family!</h2>
      <p>We're thrilled to have you with us. As a special welcome, here's an exclusive discount for your first order:</p>
      <div style="background: #f9f9f9; padding: 30px; text-align: center; font-size: 28px; font-weight: bold; border: 2px dashed #000; margin: 30px 0; letter-spacing: 2px;">
        ${couponCode}
      </div>
      <p style="text-align: center; font-weight: bold;">Use this code at checkout to get 20% OFF your entire purchase.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://hubrobe.vercel.app/shop" style="display: inline-block; background: #000; color: #fff; padding: 15px 35px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Shop Now</a>
      </div>
    `
  }),
  resetPassword: (resetCode) => ({
    subject: "Password Reset Code - hubrobe.",
    html: `
      <h2 style="text-align: center; margin-bottom: 20px;">Reset Your Password</h2>
      <p>You requested a password reset for your hubrobe account. Use the code below to complete the process:</p>
      <div style="background: #f9f9f9; padding: 30px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000; margin: 30px 0;">
        ${resetCode}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">This code will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `
  }),
  newsletter: (subject, content) => ({
    subject: subject,
    html: `
      <div style="line-height: 1.6; color: #333;">
        ${content}
      </div>
    `
  }),
  blog: (blogTitle, blogDesc, blogId) => ({
    subject: `New on the Blog: ${blogTitle}`,
    html: `
      <h2 style="color: #000; margin-bottom: 15px;">${blogTitle}</h2>
      <p style="color: #444; line-height: 1.6; margin-bottom: 25px;">${blogDesc}</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://hubrobe.vercel.app/news/${blogId}" style="display: inline-block; background: #000; color: #fff; padding: 15px 35px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Read Full Article</a>
      </div>
    `
  })
};

/**
 * Core Mail Sender
 */
const sendMail = async (to, templateName, templateData) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables.");
    }

    const template = templates[templateName](...templateData);

    const info = await transporter.sendMail({
      from: `"hubrobe" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: emailLayout(template.html),
    });

    console.log(`Email (${templateName}) sent successfully to:`, to, "ID:", info.messageId);
    return info;
  } catch (error) {
    console.error(`Error sending email (${templateName}) to:`, to, "Error:", error.message);
    throw error;
  }
};

/**
 * Exported Services
 */
const emailService = {
  sendWelcomeEmail: (email, couponCode) => sendMail(email, 'welcome', [couponCode]),
  sendResetPasswordEmail: (email, resetCode) => sendMail(email, 'resetPassword', [resetCode]),
  sendNewsletterEmail: (email, subject, content) => sendMail(email, 'newsletter', [subject, content]),
  sendNewBlogEmail: (email, blogTitle, blogDesc, blogId) => sendMail(email, 'blog', [blogTitle, blogDesc, blogId])
};

module.exports = emailService;
