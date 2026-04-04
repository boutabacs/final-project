import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { 
  FiDollarSign, 
  FiShoppingCart, 
  FiUsers, 
  FiPackage,
  FiArrowUpRight,
  FiMoreHorizontal
} from 'react-icons/fi';
import { userRequest } from '../requestMethods';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          userRequest.get("/stats"),
          userRequest.get("/orders"),
          userRequest.get("/products")
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
        setTopProducts(productsRes.data.slice(0, 3).map(p => ({
          name: p.title,
          sales: `${Math.floor(Math.random() * 100) + 50} sales`, // Simulation car le backend n'a pas encore de compteur de ventes
          price: `$${p.price}`,
          img: Array.isArray(p.img) ? p.img[0] : p.img
        })));
      } catch (err) {
        console.log("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [topProducts, setTopProducts] = useState([]);

  return (
    <div className="flex-1 min-h-screen bg-[#F9FAFB]">
      <main className="p-4 md:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
          <StatCard 
            title="Total Revenue" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={<FiDollarSign size={24} />} 
            trend="up" 
            trendValue="12.5" 
          />
          <StatCard 
            title="Total Orders" 
            value={stats.orders.toString()} 
            icon={<FiShoppingCart size={24} />} 
            trend="up" 
            trendValue="8.2" 
          />
          <StatCard 
            title="Total Customers" 
            value={stats.users.toString()} 
            icon={<FiUsers size={24} />} 
            trend="up" 
            trendValue="5.1" 
          />
          <StatCard 
            title="Total Products" 
            value={stats.products.toString()} 
            icon={<FiPackage size={24} />} 
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-black font-sofia-pro uppercase tracking-widest">Recent Orders</h3>
              <button className="text-[12px] font-bold text-black font-sofia-pro hover:underline">View All</button>
            </div>
            {/* Mobile View: Cards */}
            <div className="md:hidden flex flex-col divide-y divide-gray-50">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-8 text-center text-black/40 font-sofia-pro text-[13px]">No recent orders.</div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-black font-gt-walsheim">#{order._id.slice(-4)}</span>
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest font-sofia-pro ${
                        order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                        order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[13px] font-medium text-black font-sofia-pro">{order.userId}</p>
                        <p className="text-[11px] text-black/40 font-sofia-pro">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-[14px] font-bold text-black font-sofia-pro">${order.amount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Order ID</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Customer</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-black/40 font-sofia-pro">Total</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mx-auto"></div>
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-black/40 font-sofia-pro">No recent orders.</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 text-[13px] font-bold text-black font-gt-walsheim">#{order._id.slice(-4)}</td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-medium text-black font-sofia-pro">{order.userId}</p>
                          <p className="text-[11px] text-black/40 font-sofia-pro">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-sofia-pro ${
                            order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                            'bg-red-50 text-red-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] font-bold text-black font-sofia-pro">${order.amount}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-black/20 hover:text-black transition-colors"><FiMoreHorizontal /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-[16px] font-bold text-black font-sofia-pro uppercase tracking-widest">Top Products</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              {topProducts.length > 0 ? topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-14 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-black font-sofia-pro truncate">{product.name}</p>
                    <p className="text-[11px] text-black/40 font-medium font-sofia-pro">{product.sales}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-bold text-black font-sofia-pro">{product.price}</p>
                    <FiArrowUpRight className="inline text-green-500 ml-1" size={14} />
                  </div>
                </div>
              )) : (
                <div className="text-center text-black/40 font-sofia-pro text-[13px]">No products yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
