const dns = require("dns");
const nodemailer = require("nodemailer");
const path = require("path");
// Ensure dotenv is loaded from the correct path
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// Render and similar hosts often lack working IPv6 egress; Gmail resolves to IPv6 first.
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (_) {
  /* ignore */
}

const SMTP_HOSTNAME = "smtp.gmail.com";
const SMTP_IPV4_CACHE_TTL_MS = 5 * 60 * 1000;
let smtpIpv4Cache = { address: null, expires: 0 };

/** Gmail A records only — nodemailer can still open IPv6 sockets despite custom lookup. */
async function getSmtpIpv4Address() {
  const now = Date.now();
  if (smtpIpv4Cache.address && smtpIpv4Cache.expires > now) {
    return smtpIpv4Cache.address;
  }
  const records = await dns.promises.resolve4(SMTP_HOSTNAME);
  if (!records?.length) {
    throw new Error(`[EmailService] No IPv4 (A) for ${SMTP_HOSTNAME}`);
  }
  const address = records[Math.floor(Math.random() * records.length)];
  smtpIpv4Cache = { address, expires: now + SMTP_IPV4_CACHE_TTL_MS };
  return address;
}

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
  console.log(`[EmailService] Attempting to send ${templateName} to: ${to}`);
  
  try {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      console.error("[EmailService] Missing credentials in process.env");
      throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables.");
    }

    // Connect to a literal IPv4 from A records + SNI hostname (avoids broken IPv6 egress on Render).
    const smtpHost = await getSmtpIpv4Address();
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
        servername: SMTP_HOSTNAME,
      },
      connectionTimeout: 25000,
      greetingTimeout: 25000,
      socketTimeout: 25000,
    });

    const templateFunc = templates[templateName];
    if (!templateFunc) {
      throw new Error(`Template ${templateName} not found.`);
    }

    const template = templateFunc(...templateData);

    const info = await transporter.sendMail({
      from: `"hubrobe" <${user}>`,
      to,
      subject: template.subject,
      html: emailLayout(template.html),
    });

    console.log(`[EmailService] Success: ${templateName} sent to ${to}. ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EmailService] Failure: ${templateName} to ${to}. Error:`, error.message);
    throw error;
  }
};

/**
 * Exported functions (named exports for better compatibility)
 */
module.exports.sendWelcomeEmail = (email, couponCode) => sendMail(email, 'welcome', [couponCode]);
module.exports.sendResetPasswordEmail = (email, resetCode) => sendMail(email, 'resetPassword', [resetCode]);
module.exports.sendNewsletterEmail = (email, subject, content) => sendMail(email, 'newsletter', [subject, content]);
module.exports.sendNewBlogEmail = (email, blogTitle, blogDesc, blogId) => sendMail(email, 'blog', [blogTitle, blogDesc, blogId]);
