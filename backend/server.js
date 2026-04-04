const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectDB = require("./config/db");

// Routes
const authRoute = require("./routes/auth.routes");
const userRoute = require("./routes/user.routes");
const productRoute = require("./routes/product.routes");
const cartRoute = require("./routes/cart.routes");
const orderRoute = require("./routes/order.routes");
const statsRoute = require("./routes/stats.routes");
const wishlistRoute = require("./routes/wishlist.routes");
const articlesRoute = require("./routes/articles.routes");
const faqRoute = require("./routes/faq.routes");
const couponRoute = require("./routes/coupon.routes");
const newsletterRoute = require("./routes/newsletter.routes");

// Database Connection
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Endpoints
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/stats", statsRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/articles", articlesRoute);
app.use("/api/faq", faqRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/newsletter", newsletterRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}!`);
});
