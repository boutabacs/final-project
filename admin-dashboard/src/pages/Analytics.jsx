import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiPieChart, FiBarChart2, FiCalendar } from 'react-icons/fi';
import { userRequest } from '../requestMethods';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await userRequest.get("/stats");
        setStats(res.data);
      } catch (err) {
        console.log("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Process data for the revenue chart
  const revenueData = stats?.monthlyRevenue || [];
  const maxRevenue = Math.max(...revenueData.map(d => d.total), 1);

  return (
    <div className="flex-1 min-h-screen bg-[#F9FAFB]">
      <main className="p-4 md:p-8">
        {/* Date Range Selector */}
        <div className="flex justify-end mb-8">
          <button className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-sm text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-gray-50 transition-all">
            <FiCalendar /> Full Statistics
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[16px] font-bold text-black font-sofia-pro uppercase tracking-widest">Monthly Revenue</h3>
              <div className="flex items-center gap-2 text-green-500">
                <FiTrendingUp />
                <span className="text-[12px] font-bold">Real-time</span>
              </div>
            </div>
            
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : revenueData.length > 0 ? (
              <>
                <div className="h-64 flex items-end gap-2 px-2">
                  {revenueData.map((data, i) => {
                    const height = (data.total / maxRevenue) * 100;
                    return (
                      <div key={i} className="flex-1 bg-gray-50 hover:bg-black transition-all duration-300 rounded-t-sm relative group">
                        <div style={{ height: `${height}%` }} className="w-full bg-current opacity-10 group-hover:opacity-100"></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          ${data.total.toLocaleString()}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-black/20 uppercase">
                          {monthNames[data._id - 1]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-black/40 font-sofia-pro text-[14px]">
                No revenue data available yet.
              </div>
            )}
          </div>

          {/* Sales by Category */}
          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-[16px] font-bold text-black font-sofia-pro uppercase tracking-widest">Top Categories</h3>
              <FiPieChart className="text-black/20" size={20} />
            </div>
            <div className="flex flex-col gap-6">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                </div>
              ) : stats?.salesByCategory?.length > 0 ? (
                stats.salesByCategory.map((cat, i) => {
                  const colors = ['bg-black', 'bg-gray-400', 'bg-gray-300', 'bg-gray-200', 'bg-gray-100'];
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between text-[13px] font-sofia-pro">
                        <span className="font-bold text-black">{cat._id}</span>
                        <span className="text-black/40">{cat.count} sales</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div style={{ width: `${(cat.count / stats.orders) * 100}%` }} className={`h-full ${colors[i % colors.length]}`}></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-black/40 font-sofia-pro text-[14px]">
                  No category data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <p className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro mb-4">Total Customers</p>
            <h4 className="text-[32px] font-bold text-black font-gt-walsheim mb-2">{stats?.users || 0}</h4>
            <span className="text-[12px] font-bold text-green-500 font-sofia-pro">Total registered users</span>
          </div>
          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <p className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro mb-4">Total Orders</p>
            <h4 className="text-[32px] font-bold text-black font-gt-walsheim mb-2">{stats?.orders || 0}</h4>
            <span className="text-[12px] font-bold text-black/40 font-sofia-pro">Across all time</span>
          </div>
          <div className="bg-white border border-gray-100 p-8 rounded-sm">
            <p className="text-[11px] uppercase tracking-widest text-black/40 font-bold font-sofia-pro mb-4">Total Revenue</p>
            <h4 className="text-[32px] font-bold text-black font-gt-walsheim mb-2">${stats?.totalRevenue?.toLocaleString() || 0}</h4>
            <span className="text-[12px] font-bold text-green-500 font-sofia-pro">Gross income</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
