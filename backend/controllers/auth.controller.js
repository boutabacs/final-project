const User = require("../models/user.model");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const sendMail = require("../config/mail");

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("User with this email does not exist!");
    }

    // Generate 6 digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendMail(
      user.email,
      "Password Reset Code - hubrobe.",
      `<h1>Password Reset</h1>
       <p>You requested a password reset. Your verification code is:</p>
       <h2 style="font-size: 32px; letter-spacing: 5px;">${resetCode}</h2>
       <p>This code will expire in 1 hour.</p>`
    );

    res.status(200).json("Reset code sent to your email!");
  } catch (err) {
    res.status(500).json(err);
  }
};

// VERIFY CODE
const verifyResetCode = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      resetPasswordCode: req.body.code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json("Invalid or expired reset code!");
    }

    res.status(200).json("Code verified successfully!");
  } catch (err) {
    res.status(500).json(err);
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
      resetPasswordCode: req.body.code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json("Invalid or expired reset code!");
    }

    user.password = CryptoJS.AES.encrypt(req.body.newPassword, process.env.PASS_SEC).toString();
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json("Password has been reset successfully!");
  } catch (err) {
    res.status(500).json(err);
  }
};

// REGISTER
const register = async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
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
    res.status(500).json(err);
  }
};

module.exports = { register, login };
