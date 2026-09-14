import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const Orders = () => {
  const { orders } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-semibold text-[#c5a880] uppercase tracking-[0.25em] block mb-1">
            Provenance & Tracking
          </span>
          <h1 className="text-3xl font-['Cinzel'] font-bold text-white">
            My Orders & Acquisitions
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track real-time chronometer regulation and insured air express shipments.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#121218] border border-[#22222e] rounded-2xl p-12 text-center space-y-4">
            <Package size={40} className="text-[#c5a880] mx-auto opacity-60" />
            <h2 className="font-['Cinzel'] font-bold text-xl text-white">No Orders Found</h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              You haven't commissioned any timepieces yet. Explore our handcrafted collection to start your horological journey.
            </p>
            <Link
              to="/watches"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#c5a880] text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-[#d8be98] transition-colors"
            >
              <span>Explore Timepieces</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="bg-[#121218] border border-[#22222e] rounded-2xl overflow-hidden transition-all shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="p-6 bg-[#171722] border-b border-[#22222d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-white text-base">{order.orderId}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30 font-medium text-[10px] uppercase tracking-wider">
                        {order.status || 'Active Commission'}
                      </span>
                    </div>
                    <span className="text-gray-400 text-[11px] block mt-1">
                      Ordered: {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-gray-400 uppercase tracking-wider text-[10px] block">Total Amount</span>
                    <span className="text-lg font-bold text-[#c5a880]">
                      {BRAND_CONFIG.currency}{order.total?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="p-6 space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 text-xs pb-4 border-b border-[#1c1c26] last:border-b-0 last:pb-0">
                      <div className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-[#0b0b0d] border border-[#22222e]" />
                        <div>
                          <h4 className="font-['Cinzel'] font-bold text-white text-sm">{item.name}</h4>
                          <p className="text-[#c5a880] text-[11px] mt-0.5">Edition: {item.selectedColor}</p>
                          <span className="text-gray-400 text-[10px] block">Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-white text-sm">
                        {BRAND_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer / Shipping info */}
                <div className="px-6 py-4 bg-[#14141d] border-t border-[#20202b] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
                  <div className="flex items-center space-x-2">
                    <Truck size={15} className="text-[#c5a880]" />
                    <span>Dispatched to: {order.shippingInfo?.address}, {order.shippingInfo?.city}, {order.shippingInfo?.country}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                    <ShieldCheck size={14} />
                    <span>Insured Courier Protected</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
