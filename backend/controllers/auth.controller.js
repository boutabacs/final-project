const crypto = require("crypto");
const User = require("../models/user.model");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail, sendWelcomeEmail } = require("../services/email.service");

function clientBaseUrl() {
  return (process.env.CLIENT_URL || "https://hubrobe.vercel.app").replace(/\/$/, "");
}

// FORGOT PASSWORD (token link in email — same pattern as MERN Stack Boilerplate)
const forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || "").trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("User with this email does not exist!");
    }

    const resetToken = user.getResetPasswordToken();
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const resetUrl = `${clientBaseUrl()}/reset-password/${resetToken}`;

    void sendResetPasswordEmail(email, resetUrl).catch((mailErr) => {
      console.error("Reset password email failed:", mailErr.message);
    });

    res.status(200).json("Reset link sent to your email!");
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json(err.message || "An error occurred during the password reset process.");
  }
};

// RESET PASSWORD (body: { resetToken, newPassword })
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Invalid request." });
    }

    const resetPasswordToken = crypto.createHash("sha256").update(String(resetToken)).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json("Invalid or expired reset link!");
    }

    const encryptedPassword = CryptoJS.AES.encrypt(newPassword, process.env.PASS_SEC).toString();

    user.password = encryptedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json("Password has been reset successfully!");
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json(err.message || "An error occurred.");
  }
};

// REGISTER
const register = async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = new User({
    username,
    email,
    password: CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString(),
  });

  try {
    const savedUser = await newUser.save();

    sendWelcomeEmail(email, "WELCOME20").catch((err) =>
      console.error("Background welcome email failed:", err.message)
    );

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err.message || "An error occurred.");
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json("Wrong credentials!");
    }

    const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json("Wrong credentials!");
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err.message || "An error occurred.");
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
