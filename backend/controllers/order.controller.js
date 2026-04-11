const Order = require("../models/order.model");
const Product = require("../models/product.model");
const { jsPDF } = require("jspdf");
require("jspdf-autotable");


const createOrder = async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();

    
    if (req.body.products && req.body.products.length > 0) {
      for (const item of req.body.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { countInStock: -item.quantity },
        });
      }
    }

    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
};


const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
};


const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
};


const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
};


const getMonthlyIncome = async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
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
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json("Order not found");

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("HUBROBE", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text("INVOICE / FACTURE", 105, 30, { align: "center" });
    
    // Order Info
    doc.setFontSize(10);
    doc.text(`Order ID: ${order._id}`, 20, 45);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, 52);
    doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 20, 59);
    doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 20, 66);

    // Shipping Address
    doc.text("Shipping Address:", 140, 45);
    doc.text(`${order.address.firstName} ${order.address.lastName}`, 140, 52);
    doc.text(`${order.address.streetAddress}`, 140, 59);
    doc.text(`${order.address.city}, ${order.address.state} ${order.address.zipCode}`, 140, 66);
    doc.text(`${order.address.country}`, 140, 73);

    // Products Table
    const tableData = await Promise.all(order.products.map(async (p) => {
      const product = await Product.findById(p.productId);
      return [
        product ? product.title : "Product",
        p.quantity,
        `$${product ? product.price : 0}`,
        `$${(product ? product.price : 0) * p.quantity}`
      ];
    }));

    doc.autoTable({
      startY: 85,
      head: [["Product", "Quantity", "Price", "Total"]],
      body: tableData,
    });

    const finalY = doc.lastAutoTable.finalY || 150;
    
    // Totals
    doc.text(`Subtotal: $${order.amount + order.discountAmount}`, 140, finalY + 10);
    doc.text(`Discount: -$${order.discountAmount}`, 140, finalY + 17);
    doc.setFontSize(12);
    doc.text(`Total Amount: $${order.amount}`, 140, finalY + 27);

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your purchase!", 105, finalY + 50, { align: "center" });

    const pdfOutput = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${order._id}.pdf`);
    res.send(Buffer.from(pdfOutput));
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json(err);
  }
};

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders,
  getAllOrders,
  getMonthlyIncome,
  downloadInvoice,
};
