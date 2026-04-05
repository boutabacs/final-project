const Newsletter = require("../models/newsletter.model");
const Coupon = require("../models/coupon.model");
const { sendWelcomeEmail, sendNewsletterBulk } = require("../services/email.service");

// SUBSCRIBE
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  try {
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: "Already subscribed", alreadySubscribed: true });
    }
    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();

    // Ensure WELCOME20 coupon exists
    const welcomeCoupon = await Coupon.findOne({ code: "WELCOME20" });
    if (!welcomeCoupon) {
      const newCoupon = new Coupon({
        code: "WELCOME20",
        discount: 20,
        discountType: "percentage",
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // 10 years
        isActive: true,
      });
      await newCoupon.save();
    }

    // Send Welcome Email using the new service
    sendWelcomeEmail(email, "WELCOME20")
      .catch(mailErr => console.error("Welcome email failed:", mailErr.message));

    res.status(201).json({ message: "Successfully subscribed", alreadySubscribed: false });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET ALL SUBSCRIBERS
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json(subscribers);
  } catch (err) {
    res.status(500).json(err);
  }
};

// SEND MANUAL NEWSLETTER
const sendNewsletter = async (req, res) => {
  const { subject, content } = req.body;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ 
      error: "Email configuration missing on server (EMAIL_USER or EMAIL_PASS).",
      details: "Make sure these variables are set in the environment variables (e.g. Render dashboard)."
    });
  }

  try {
    const subscribers = await Newsletter.find();
    const emails = subscribers.map((s) => s.email);

    if (emails.length === 0) {
      return res.status(200).json("No subscribers found.");
    }

    const results = await sendNewsletterBulk(emails, subject, content);

    const failures = results.filter((r) => r.status === "rejected");
    const successes = results.filter((r) => r.status === "fulfilled");

    if (failures.length > 0) {
      console.error(`${failures.length} emails failed to send.`);
      return res.status(200).json({
        message: `Newsletter sent partially: ${successes.length} success, ${failures.length} failures.`,
        details: failures.map(f => f.reason.message || f.reason)
      });
    }

    res.status(200).json("Newsletter sent successfully to all subscribers!");
  } catch (err) {
    console.error("Newsletter send error:", err);
    res.status(500).json({ error: "Failed to process newsletter sending", details: err.message });
  }
};

module.exports = {
  subscribeNewsletter,
  getSubscribers,
  sendNewsletter,
};
