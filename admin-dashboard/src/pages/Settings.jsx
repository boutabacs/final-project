import React, { useState } from 'react';
import { FiUser, FiGlobe, FiLock, FiBell, FiShield } from 'react-icons/fi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: <FiGlobe /> },
    { id: 'profile', name: 'Profile', icon: <FiUser /> },
    { id: 'security', name: 'Security', icon: <FiLock /> },
    { id: 'notifications', name: 'Notifications', icon: <FiBell /> },
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#F9FAFB]">
      <main className="p-4 md:p-8">
        <div className="max-w-5xl">
          {/* Tabs */}
          <div className="flex gap-4 md:gap-8 border-b border-gray-100 mb-8 md:mb-12 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 pb-4 text-[13px] font-bold uppercase tracking-widest font-sofia-pro transition-all relative ${
                  activeTab === tab.id ? 'text-black' : 'text-black/30 hover:text-black/60'
                }`}
              >
                {tab.icon}
                {tab.name}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-sm">
            {activeTab === 'general' && (
              <form className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Site Name</label>
                    <input type="text" defaultValue="hubrobe." className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Support Email</label>
                    <input type="email" defaultValue="hubrobeshop@gmail.com" className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]" />
                  </div>
                  <div className="flex flex-col gap-3 md:col-span-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Store Currency</label>
                    <select className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px] bg-white appearance-none">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>DZD (DA)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="bg-black text-white px-10 py-4 text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-black/80 transition-all rounded-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'profile' && (
              <div className="flex flex-col items-center py-10">
                <div className="w-24 h-24 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[32px] font-bold text-black font-sofia-pro mb-6">
                  A
                </div>
                <button className="text-[13px] font-bold text-black font-sofia-pro hover:underline mb-12">Change Photo</button>
                
                <form className="w-full flex flex-col gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Full Name</label>
                      <input type="text" defaultValue="Admin Hub" className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Role</label>
                      <input type="text" defaultValue="Super Admin" disabled className="w-full border border-gray-100 p-4 bg-gray-50 text-black/40 font-sofia-pro text-[14px] cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button className="bg-black text-white px-10 py-4 text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-black/80 transition-all rounded-sm">
                      Update Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <form className="flex flex-col gap-10">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-3">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-black font-sofia-pro">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-gray-100 p-4 outline-none focus:border-black transition-colors font-sofia-pro text-[14px]" />
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 rounded-sm flex items-center gap-4">
                  <FiShield className="text-black/40" size={24} />
                  <div className="flex-1">
                    <p className="text-[14px] font-bold text-black font-sofia-pro">Two-Factor Authentication</p>
                    <p className="text-[13px] text-black/40 font-sofia-pro">Add an extra layer of security to your account.</p>
                  </div>
                  <button type="button" className="text-[12px] font-bold text-blue-500 hover:underline">Enable</button>
                </div>

                <div className="flex justify-end">
                  <button className="bg-black text-white px-10 py-4 text-[13px] font-bold uppercase tracking-widest font-sofia-pro hover:bg-black/80 transition-all rounded-sm">
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
