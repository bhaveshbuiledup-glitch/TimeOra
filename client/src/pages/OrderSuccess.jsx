import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Download, Clock } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order || {
    orderId: 'TM-ORD-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    total: 1850,
    shippingInfo: {
      firstName: 'Alexander',
      lastName: 'Wright',
      address: '740 Park Avenue',
      city: 'New York',
      country: 'United States'
    },
    items: [
      {
        name: 'TIMEORA Chrono Royal Noir',
        quantity: 1,
        price: 1850,
        selectedColor: 'Obsidian Black',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6">
        
        {/* Success Card */}
        <div className="bg-[#121218] border border-[#262634] rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          
          {/* Subtle gold top border accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c5a880] to-transparent" />

          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-[#1c1c28] border-2 border-[#c5a880] mx-auto flex items-center justify-center text-[#c5a880] shadow-xl shadow-[#c5a880]/20 mb-6">
            <CheckCircle2 size={40} />
          </div>

          <span className="text-xs font-semibold text-[#c5a880] uppercase tracking-[0.25em] block mb-2">
            Acquisition Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-['Cinzel'] font-bold text-white mb-3">
            Welcome to the TIMEORA Atelier
          </h1>
          <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed mb-8 font-light">
            Your horological timepiece has been registered under your name. Our master watchmakers have commenced the final chronometric inspection.
          </p>

          {/* Order Details Capsule */}
          <div className="bg-[#181822] border border-[#242432] rounded-xl p-6 mb-8 text-left grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Order Reference</span>
              <span className="font-mono text-white font-bold text-sm tracking-wider">{order.orderId}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Date of Certification</span>
              <span className="text-white font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Total Investment</span>
              <span className="text-[#c5a880] font-bold text-sm">{BRAND_CONFIG.currency}{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Timepieces Ordered */}
          <div className="text-left border-t border-[#20202c] pt-6 mb-8">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-4">
              Enclosed Timepieces ({order.items?.length})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#161620] border border-[#22222d] text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded bg-[#0d0d12]" />
                    <div>
                      <h4 className="text-white font-semibold font-['Cinzel']">{item.name}</h4>
                      <span className="text-gray-400 text-[11px]">{item.selectedColor} • Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-white">{BRAND_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dispatch Notice */}
          <div className="bg-[#161620] rounded-xl p-4 mb-8 flex items-start space-x-3 text-left text-xs border border-[#242432]">
            <Clock size={18} className="text-[#c5a880] flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold block">Estimated Express Arrival: 2-3 Business Days</span>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Armored air freight tracking coordinates will be transmitted to {order.shippingInfo?.email || 'your email'} once chronometer certification completes.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#c5a880] hover:bg-[#d8be98] text-black font-semibold text-xs uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Package size={16} />
              <span>Track in My Orders</span>
            </Link>

            <Link
              to="/watches"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1a1a24] hover:bg-[#252533] text-gray-200 text-xs uppercase tracking-widest font-semibold rounded-lg transition-colors border border-[#2e2e3e] flex items-center justify-center space-x-2"
            >
              <span>Return to Catalog</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;
