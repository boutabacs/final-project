const Article = require("../models/article.model");
const Newsletter = require("../models/newsletter.model");
const sendMail = require("../config/mail");

const getArticles = async (req, res) => {
  const qStatus = req.query.status;
  try {
    let articles;
    if (qStatus) {
      articles = await Article.find({ status: qStatus }).sort({
        createdAt: -1,
      });
    } else {
      articles = await Article.find().sort({ createdAt: -1 });
    }
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json(err);
  }
};

const createArticle = async (req, res) => {
  const newArticle = new Article(req.body);
  try {
    const savedArticle = await newArticle.save();

    // Send notification to all newsletter subscribers
    try {
      const subscribers = await Newsletter.find();
      const emails = subscribers.map((s) => s.email);

      if (emails.length > 0 && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const subject = `New Blog Post: ${savedArticle.title}`;
        const plainDesc = savedArticle.desc.replace(/<[^>]*>?/gm, '');
        const content = `
          <h1>New Blog Post on hubrobe.</h1>
          <p>${plainDesc.substring(0, 200)}...</p>
          <a href="https://hubrobe.vercel.app/news/${savedArticle._id}">Read More</a>
        `;
        
        // Use allSettled to avoid failing everything if one email fails
        await Promise.allSettled(
          emails.map((email) => sendMail(email, subject, content))
        );
      }
    } catch (mailErr) {
      console.error("Blog notification email failed:", mailErr);
    }

    res.status(201).json(savedArticle);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteArticle = async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json("Article has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateArticle = async (req, res) => {
  try {
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true },
    );
    res.status(200).json(updatedArticle);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.status(200).json(article);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  deleteArticle,
  updateArticle,
};
