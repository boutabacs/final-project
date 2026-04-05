const Article = require("../models/article.model");
const Newsletter = require("../models/newsletter.model");
const { sendNewBlogEmail } = require("../services/email.service");

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
    res.status(500).json(err.message || "An error occurred.");
  }
};

const createArticle = async (req, res) => {
  const newArticle = new Article(req.body);
  try {
    const savedArticle = await newArticle.save();

    // Send notification to all newsletter subscribers in background
    Newsletter.find()
      .then(subscribers => {
        const emails = subscribers.map((s) => s.email);
        if (emails.length > 0) {
          const plainDesc = savedArticle.desc.replace(/<[^>]*>?/gm, '').substring(0, 200);
          return Promise.allSettled(
            emails.map((email) => sendNewBlogEmail(email, savedArticle.title, plainDesc, savedArticle._id))
          );
        }
      })
      .catch(mailErr => console.error("Blog notification email background process failed:", mailErr.message));

    res.status(201).json(savedArticle);
  } catch (err) {
    res.status(500).json(err.message || "An error occurred.");
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
