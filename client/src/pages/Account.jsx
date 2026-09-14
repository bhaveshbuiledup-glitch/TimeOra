import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, Shield, LogOut, Award, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const Account = () => {
  const { user, logout, orders } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] pt-36 pb-24 text-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <h2 className="text-2xl font-['Cinzel'] font-bold text-white">Patron Access Required</h2>
          <p className="text-xs text-gray-400">Please sign in to view your bespoke horological portfolio.</p>
          <Link to="/login" className="inline-block px-8 py-3 bg-[#c5a880] text-black text-xs font-bold uppercase tracking-widest rounded-lg">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Banner */}
        <div className="bg-[#121218] border border-[#242432] rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full border-2 border-[#c5a880] bg-[#1a1a26] flex items-center justify-center text-[#c5a880] shadow-xl text-2xl font-['Cinzel'] font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-[0.2em] text-[#c5a880] font-semibold">
                  {user.membershipTier || 'TIMEORA Royal Patron'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-['Cinzel'] font-bold text-white mt-0.5">
                {user.name}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-[#181822] hover:bg-red-950/40 border border-[#2d2d3d] hover:border-red-800 text-gray-300 hover:text-red-400 text-xs uppercase tracking-wider font-semibold rounded-lg flex items-center space-x-2 transition-colors"
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Link
            to="/orders"
            className="bg-[#14141c] border border-[#22222d] hover:border-[#c5a880]/50 p-6 rounded-xl flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Acquired Timepieces</span>
              <span className="text-2xl font-bold text-white font-['Cinzel']">{orders.length}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1c1c28] border border-[#2a2a38] group-hover:border-[#c5a880] flex items-center justify-center text-[#c5a880] transition-colors">
              <Package size={20} />
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="bg-[#14141c] border border-[#22222d] hover:border-[#c5a880]/50 p-6 rounded-xl flex items-center justify-between group transition-all"
          >
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Curated Wishlist</span>
              <span className="text-2xl font-bold text-white font-['Cinzel']">{wishlist.length}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1c1c28] border border-[#2a2a38] group-hover:border-[#c5a880] flex items-center justify-center text-[#c5a880] transition-colors">
              <Heart size={20} />
            </div>
          </Link>

          <div className="bg-[#14141c] border border-[#22222d] p-6 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Horology Warranty</span>
              <span className="text-2xl font-bold text-emerald-400 font-['Cinzel']">5-Year Active</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1c1c28] border border-[#2a2a38] flex items-center justify-center text-[#c5a880]">
              <Shield size={20} />
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-[#121218] border border-[#242432] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#20202c]">
            <div>
              <h2 className="font-['Cinzel'] font-bold text-lg text-white">Recent Orders</h2>
              <p className="text-xs text-gray-400">Track and view invoices for your acquisitions</p>
            </div>
            <Link to="/orders" className="text-xs uppercase tracking-wider text-[#c5a880] hover:underline font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Clock size={32} className="text-gray-500 mx-auto" />
              <h3 className="text-sm font-semibold text-white font-['Cinzel']">No Previous Orders Found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                You have not placed any orders yet. Discover our latest automatic watches and start your collection.
              </p>
              <Link to="/watches" className="inline-block mt-2 px-6 py-2 bg-[#c5a880] text-black text-xs font-semibold uppercase tracking-wider rounded">
                Browse Timepieces
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.orderId} className="p-4 rounded-xl bg-[#161620] border border-[#22222d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-white text-sm block">{order.orderId}</span>
                    <span className="text-gray-400 text-[11px] block mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length} items
                    </span>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {order.status || 'Processing & Chronometer Testing'}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-[#c5a880] block">
                      {BRAND_CONFIG.currency}{order.total?.toLocaleString()}
                    </span>
                    <Link to="/orders" className="text-[11px] text-gray-300 hover:text-[#c5a880] underline mt-1 inline-block">
                      View Certificate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Account;
