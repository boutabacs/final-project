import React, { useEffect, useMemo, useState } from 'react';
import CheckoutHero from '../components/CheckoutHero';
import { publicRequest, userRequest } from '../requestMethods';
import { FiPhone, FiMail, FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderReceived = () => {
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header - Company Info
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('HUBROBE', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('www.hubrobe.com', 14, 26);
    doc.text('hubrobeshop@gmail.com', 14, 31);

    // Invoice Info (Right aligned)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', pageWidth - 14, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.text(`Order: ${orderNumber}`, pageWidth - 14, 26, { align: 'right' });
    doc.text(`Date: ${today}`, pageWidth - 14, 31, { align: 'right' });

    // Line separator
    doc.setDrawColor(230, 230, 230);
    doc.line(14, 40, pageWidth - 14, 40);

    // Billing & Shipping info
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Billing Address', 14, 50);
    doc.text('Shipping Address', pageWidth / 2 + 7, 50);

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    
    const billingY = 56;
    if (order.address) {
      // Billing
      doc.text(`${order.address.firstName} ${order.address.lastName}`, 14, billingY);
      doc.text(`${order.address.streetAddress}`, 14, billingY + 5);
      doc.text(`${order.address.city}, ${order.address.zipCode}`, 14, billingY + 10);
      doc.text(`${order.address.country}`, 14, billingY + 15);
      doc.text(`Phone: ${order.address.phone}`, 14, billingY + 20);

      // Shipping
      doc.text(`${order.address.firstName} ${order.address.lastName}`, pageWidth / 2 + 7, billingY);
      doc.text(`${order.address.streetAddress}`, pageWidth / 2 + 7, billingY + 5);
      doc.text(`${order.address.city}, ${order.address.zipCode}`, pageWidth / 2 + 7, billingY + 10);
      doc.text(`${order.address.country}`, pageWidth / 2 + 7, billingY + 15);
    }

    // Products Table
    const tableData = orderItems.map(item => [
      item.title,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });

    // Totals
    const finalY = (doc).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    doc.text('Subtotal:', pageWidth - 60, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: 'right' });

    doc.text('Shipping:', pageWidth - 60, finalY + 7);
    doc.text('Free', pageWidth - 14, finalY + 7, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 60, finalY + 17);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 14, finalY + 17, { align: 'right' });

    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for shopping with HUBROBE!', pageWidth / 2, pageWidth + 30, { align: 'center' });

    // Save PDF
    doc.save(`hubrobe-invoice-${orderNumber}.pdf`);
  };

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const paymentMethod = useMemo(() => {
    return localStorage.getItem("lastPaymentMethod") || "Direct bank transfer";
  }, []);

  const paymentLabel = useMemo(() => {
    if (paymentMethod === "bank") return "Direct bank transfer";
    if (paymentMethod === "cod") return "Cash on delivery";
    if (paymentMethod === "paypal") return "PayPal";
    return paymentMethod;
  }, [paymentMethod]);

  const subtotal = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (Number(item.price) || 0) * (item.quantity || 0), 0);
  }, [orderItems]);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const lastOrderRaw = localStorage.getItem("lastOrder");
        if (lastOrderRaw) {
          const lastOrder = JSON.parse(lastOrderRaw);
          setOrder(lastOrder);
        } else if (user) {
          const res = await userRequest.get(`/orders/find/${user._id}`);
          const orders = Array.isArray(res.data) ? res.data : [];
          orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrder(orders[0] || null);
        }
      } catch (err) {
        console.error("Order fetch error:", err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user]);

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!order?.products?.length) {
        setOrderItems([]);
        return;
      }
      try {
        const results = await Promise.allSettled(
          order.products.map((p) =>
            publicRequest.get(`/products/find/${p.productId}`).then((prodRes) => ({
              ...prodRes.data,
              quantity: p.quantity,
            }))
          )
        );
        const items = results
          .filter((r) => r.status === "fulfilled" && r.value)
          .map((r) => r.value)
          .filter((p) => p && p._id);
        setOrderItems(items);
      } catch (err) {
        console.error("Order items fetch error:", err);
        setOrderItems([]);
      }
    };

    fetchOrderItems();
  }, [order]);

  const today = useMemo(() => {
    const dateValue = order?.createdAt ? new Date(order.createdAt) : new Date();
    return dateValue.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [order]);

  const orderNumber = useMemo(() => {
    if (!order?._id) return "—";
    return `#${String(order._id).slice(-6)}`;
  }, [order]);

  return (
    <div className="flex flex-col w-full bg-white pb-20 md:pb-32 relative">
      {/* Print Styles */}
      <style>
        {`
          @media print {
            .hidden-print, nav, footer, .checkout-steps, .checkout-hero {
              display: none !important;
            }
            .print-container {
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .print-border {
              border: 1px solid #eee !important;
              padding: 20px !important;
              border-radius: 8px !important;
            }
          }
        `}
      </style>

      {/* Hero Section */}
      <div className="checkout-hero">
        <CheckoutHero />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-10 print-container">
        
        {/* Checkout Steps */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 mb-20 border-b border-gray-100 pb-12 checkout-steps">
          <div className="flex items-center gap-4 opacity-30">
            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-[13px] font-bold">1</span>
            <span className="text-[14px] md:text-[15px] font-bold text-black uppercase tracking-widest font-sofia-pro">Shopping Cart</span>
          </div>
          <div className="flex items-center gap-4 opacity-30">
            <span className="w-8 h-8 rounded-full border border-black flex items-center justify-center text-[13px] font-bold">2</span>
            <span className="text-[14px] md:text-[15px] font-bold text-black uppercase tracking-widest font-sofia-pro">Payment</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[13px] font-bold">3</span>
            <span className="text-[14px] md:text-[15px] font-bold text-black uppercase tracking-widest font-sofia-pro">Order Received</span>
          </div>
        </div>

        <p className="text-[14px] text-black/60 font-sofia-pro max-w-md leading-relaxed mb-10">
          Your order has been placed successfully. We've sent a confirmation email to your inbox. 
          If you have any questions, please contact us at <span className="text-black font-bold">hubrobeshop@gmail.com</span>
        </p>

        {/* Order Info Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          <div className="flex flex-col gap-2 border-r border-gray-100 last:border-none">
            <span className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Order Number:</span>
            <span className="text-[14px] font-bold text-black font-sofia-pro">{loading ? "..." : orderNumber}</span>
          </div>
          <div className="flex flex-col gap-2 border-r border-gray-100 last:border-none">
            <span className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Date:</span>
            <span className="text-[14px] font-bold text-black font-sofia-pro">{today}</span>
          </div>
          <div className="flex flex-col gap-2 border-r border-gray-100 last:border-none">
            <span className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Total:</span>
            <span className="text-[14px] font-bold text-black font-sofia-pro">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2 border-r border-gray-100 last:border-none">
            <span className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Payment Method:</span>
            <span className="text-[14px] font-bold text-black font-sofia-pro">
              {paymentLabel}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-10">
          <h2 className="text-[32px] md:text-[40px] font-bold text-black font-gt-walsheim">
            Order details
          </h2>
          <button 
            onClick={generateInvoice}
            className="flex items-center gap-3 px-6 py-3 bg-black text-white text-[13px] font-bold uppercase tracking-widest rounded-md hover:bg-black/80 transition-all shadow-lg hover:shadow-black/20 hidden-print"
          >
            <FiDownload className="text-lg" /> Download Receipt
          </button>
        </div>

        {/* Order Details Table */}
        <div className="w-full mb-20 print-border">
          <div className="grid grid-cols-2 bg-[#f7f7f7] py-4 px-8 mb-4">
            <span className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Product</span>
            <span className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro text-right">Total</span>
          </div>
          
          <div className="flex flex-col">
            {loading ? (
              <div className="px-8 py-6 text-black/40">Loading...</div>
            ) : (
              orderItems.map((item) => (
                <div key={item._id} className="grid grid-cols-2 py-6 px-8 border-b border-gray-50 items-center">
                  <span className="text-[14px] text-blue-500 font-sofia-pro">
                    {item.title} <span className="text-black font-bold">× {item.quantity}</span>
                  </span>
                  <span className="text-[14px] font-bold text-black font-sofia-pro text-right">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            )}
            
            <div className="grid grid-cols-2 py-6 px-8 border-b border-gray-50 bg-gray-50/20">
              <span className="text-[14px] font-bold text-black font-sofia-pro">Subtotal:</span>
              <span className="text-[14px] font-bold text-black font-sofia-pro text-right">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="grid grid-cols-2 py-6 px-8 border-b border-gray-50">
              <span className="text-[14px] font-bold text-black font-sofia-pro">Shipping:</span>
              <span className="text-[14px] text-black/60 font-sofia-pro text-right">Free shipping</span>
            </div>
            
            <div className="grid grid-cols-2 py-6 px-8 border-b border-gray-50 bg-gray-50/20">
              <span className="text-[14px] font-bold text-black font-sofia-pro">Payment method:</span>
              <span className="text-[14px] text-black/60 font-sofia-pro text-right">{paymentLabel}</span>
            </div>
            
            <div className="grid grid-cols-2 py-8 px-8 border-b border-gray-50">
              <span className="text-[18px] font-bold text-black font-gt-walsheim uppercase tracking-widest">Total:</span>
              <span className="text-[18px] font-bold text-black font-gt-walsheim text-right">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Billing Address */}
          <div className="flex flex-col">
            <h3 className="text-[24px] md:text-[28px] font-bold text-black mb-8 font-gt-walsheim border-b border-gray-100 pb-4">
              Billing address
            </h3>
            <div className="bg-[#FAFAFA] rounded-xl p-8 md:p-10 text-[15px] text-black/80 font-sofia-pro shadow-sm hover:shadow-md transition-shadow duration-300">
              {order?.address ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-black/30 font-bold">Full Name</span>
                    <p className="font-bold text-black text-[17px]">
                      {(order.address.firstName || "").trim()} {(order.address.lastName || "").trim()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-black/30 font-bold">Address</span>
                    <p className="leading-relaxed">
                      {order.address.streetAddress || ""}<br />
                      {order.address.apartment && <span className="text-black/60 italic">{order.address.apartment}<br /></span>}
                      {order.address.zipCode || ""} {order.address.city || ""}<br />
                      {order.address.state || ""}, {order.address.country || ""}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-200/50 flex flex-col gap-3">
                    <div className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[14px] text-black/40 group-hover:text-black transition-colors">
                        <FiPhone />
                      </div>
                      <span className="font-medium group-hover:text-black transition-colors">{order.address.phone || ""}</span>
                    </div>
                    <div className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[14px] text-black/40 group-hover:text-black transition-colors">
                        <FiMail />
                      </div>
                      <span className="font-medium group-hover:text-black transition-colors">{order.address.email || ""}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-black/40 italic">Information not available</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="flex flex-col">
            <h3 className="text-[24px] md:text-[28px] font-bold text-black mb-8 font-gt-walsheim border-b border-gray-100 pb-4">
              Shipping address
            </h3>
            <div className="bg-[#FAFAFA] rounded-xl p-8 md:p-10 text-[15px] text-black/80 font-sofia-pro shadow-sm hover:shadow-md transition-shadow duration-300">
              {order?.address ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-black/30 font-bold">Recipient</span>
                    <p className="font-bold text-black text-[17px]">
                      {(order.address.firstName || "").trim()} {(order.address.lastName || "").trim()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-black/30 font-bold">Delivery Location</span>
                    <p className="leading-relaxed">
                      {order.address.streetAddress || ""}<br />
                      {order.address.apartment && <span className="text-black/60 italic">{order.address.apartment}<br /></span>}
                      {order.address.city || ""}<br />
                      {order.address.state || ""}<br />
                      {order.address.zipCode || ""}<br />
                      {order.address.country || ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-black/40 italic">Information not available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceived;
