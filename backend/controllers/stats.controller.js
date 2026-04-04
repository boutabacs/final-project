const User = require("../models/user.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    const income = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Monthly Revenue for Analytics
    const monthlyRevenue = await Order.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
      { $sort: { "_id": 1 } }
    ]);

    // Sales by Category
    const salesByCategory = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      { $unwind: "$productDetails.categories" },
      {
        $group: {
          _id: "$productDetails.categories",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      users: userCount,
      products: productCount,
      orders: orderCount,
      totalRevenue: income[0]?.total || 0,
      monthlyRevenue,
      salesByCategory
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = { getStats };
