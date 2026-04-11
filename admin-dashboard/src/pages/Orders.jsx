import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiEye, FiDownload } from 'react-icons/fi';
import { userRequest } from '../requestMethods';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await userRequest.put(`/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.log("Error updating order status:", err);
      alert("Failed to update order status");
    }
  };

  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await userRequest.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.log("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-[#F9FAFB]">
      <main className="p-4 md:p-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full bg-white border border-gray-100 pl-12 pr-4 py-3 rounded-sm text-[14px] font-sofia-pro focus:border-black outline-none transition-all"
              />
            </div>
            <button className="p-3 bg-white border border-gray-100 rounded-sm hover:bg-gray-50 transition-colors">
              <FiFilter size={20} />
            </button>
          </div>
          <button className="w-full md:w-auto flex items-center justify-center gap-2 border border-gray-100 bg-white text-black px-6 py-3 rounded-sm text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-gray-50 transition-all">
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Mobile View: Order Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <div className="bg-white p-8 text-center border border-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-8 text-center border border-gray-100 text-black/40 font-sofia-pro text-[14px]">No orders found.</div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-100 p-5 rounded-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[14px] font-bold text-black font-gt-walsheim">#{order._id.slice(-4)}</span>
                    <p className="text-[12px] text-black/40 font-sofia-pro mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-sofia-pro ${
                    order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                    order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                    order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Change Status</label>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 p-2 rounded-sm text-[12px] font-sofia-pro outline-none focus:border-black transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex justify-between items-center py-3 border-y border-gray-50">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Customer</p>
                    <p className="text-[13px] font-medium text-black font-sofia-pro">{order.userId}</p>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <p className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro">Total</p>
                    <p className="text-[14px] font-bold text-black font-gt-walsheim">${order.amount}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-black/40 font-sofia-pro">{order.products.length} items</span>
                  <button className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-black hover:underline font-sofia-pro">
                    <FiEye size={16} /> Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Orders Table */}
        <div className="hidden md:block bg-white border border-gray-100 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Order ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Total</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Items</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-black/40 font-sofia-pro text-[14px]">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-4 text-[13px] font-bold text-black font-gt-walsheim">#{order._id.slice(-4)}</td>
                      <td className="px-6 py-4 text-[13px] font-medium text-black font-sofia-pro">{order.userId}</td>
                      <td className="px-6 py-4 text-[13px] text-black/60 font-sofia-pro">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-black font-gt-walsheim">${order.amount}</td>
                      <td className="px-6 py-4 text-[13px] text-black/60 font-sofia-pro">{order.products.length} items</td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-sofia-pro outline-none cursor-pointer border-none appearance-none ${
                            order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                            'bg-red-50 text-red-600'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-black/20 hover:text-black transition-colors"><FiEye size={18} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-6 border-t border-gray-50 flex justify-between items-center">
            <span className="text-[13px] text-black/40 font-sofia-pro">Showing 1-5 of 124 orders</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-100 text-[12px] font-bold uppercase font-sofia-pro hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button className="px-4 py-2 bg-black text-white text-[12px] font-bold uppercase font-sofia-pro">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;
