import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Landmark, Truck, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const Checkout = () => {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Alexander',
    lastName: user?.name ? user.name.split(' ')[1] || 'Wright' : 'Wright',
    email: user?.email || 'patron@timeora.com',
    phone: '+1 (555) 234-5678',
    address: '740 Park Avenue, Apt 14B',
    city: 'New York',
    state: 'NY',
    postalCode: '10021',
    country: 'United States',
    orderNotes: 'Please ring private concierge upon arrival.'
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'wire', 'cod'
  const [shippingMethod, setShippingMethod] = useState('express'); // 'express', 'priority'
  const [cardData, setCardData] = useState({
    cardNumber: '•••• •••• •••• 4242',
    cardHolder: 'ALEXANDER WRIGHT',
    expiry: '12/28',
    cvv: '888'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] pt-36 pb-24 text-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl font-['Cinzel'] font-bold text-white">No Items in Bag</h2>
          <p className="text-xs text-gray-400">Please add timepieces to your bag before proceeding to checkout.</p>
          <Link to="/watches" className="inline-block px-6 py-2.5 bg-[#c5a880] text-black text-xs uppercase font-bold rounded">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  const shippingCost = shippingMethod === 'priority' ? 120 : 0;
  const total = subtotal + shippingCost;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const order = addOrder({
        items: [...cartItems],
        total,
        subtotal,
        shippingCost,
        shippingInfo,
        paymentMethod,
        shippingMethod
      });

      clearCart();
      setIsSubmitting(false);
      navigate('/order-success', { state: { order } });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="text-xs font-semibold text-[#c5a880] uppercase tracking-[0.25em] block mb-1">
            Bespoke Procurement
          </span>
          <h1 className="text-3xl font-['Cinzel'] font-bold text-white">
            Secure Checkout
          </h1>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-2">
            <Lock size={14} className="text-[#c5a880]" />
            <span>Encrypted with 256-Bit SSL Horological Protocol</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left 2 Cols: Shipping & Payment */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* 1. Shipping Address */}
              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8 space-y-6">
                <h2 className="font-['Cinzel'] font-bold text-lg text-white pb-3 border-b border-[#20202c]">
                  1. Dispatch Destination
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">First Name</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Last Name</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Mobile Phone (For courier)</label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Street Address & Suite</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">City</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                      className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">State</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Courier Option */}
              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8 space-y-4">
                <h2 className="font-['Cinzel'] font-bold text-lg text-white pb-3 border-b border-[#20202c]">
                  2. Courier & Insurance Protocol
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label 
                    onClick={() => setShippingMethod('express')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      shippingMethod === 'express'
                        ? 'bg-[#181824] border-[#c5a880]'
                        : 'bg-[#121217] border-[#252533] opacity-70'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      checked={shippingMethod === 'express'} 
                      onChange={() => setShippingMethod('express')}
                      className="mt-1 accent-[#c5a880]"
                    />
                    <div>
                      <span className="font-semibold text-white text-xs block">Complimentary Insured Express</span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">2 - 4 Business Days worldwide</span>
                      <span className="text-xs font-bold text-emerald-400 mt-2 block">FREE</span>
                    </div>
                  </label>

                  <label 
                    onClick={() => setShippingMethod('priority')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      shippingMethod === 'priority'
                        ? 'bg-[#181824] border-[#c5a880]'
                        : 'bg-[#121217] border-[#252533] opacity-70'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="shippingMethod" 
                      checked={shippingMethod === 'priority'} 
                      onChange={() => setShippingMethod('priority')}
                      className="mt-1 accent-[#c5a880]"
                    />
                    <div>
                      <span className="font-semibold text-white text-xs block">Armored Overnight Courier</span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">Guaranteed next morning delivery</span>
                      <span className="text-xs font-bold text-[#c5a880] mt-2 block">+$120.00</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8 space-y-6">
                <h2 className="font-['Cinzel'] font-bold text-lg text-white pb-3 border-b border-[#20202c]">
                  3. Payment Authorization
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-[#1b1b26] border-[#c5a880] text-white shadow-md'
                        : 'bg-[#14141c] border-[#262635] text-gray-400 hover:text-white'
                    }`}
                  >
                    <CreditCard size={18} className="text-[#c5a880]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wire')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'wire'
                        ? 'bg-[#1b1b26] border-[#c5a880] text-white shadow-md'
                        : 'bg-[#14141c] border-[#262635] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Landmark size={18} className="text-[#c5a880]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Bank Wire</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-[#1b1b26] border-[#c5a880] text-white shadow-md'
                        : 'bg-[#14141c] border-[#262635] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Truck size={18} className="text-[#c5a880]" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">VIP Concierge COD</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 pt-2 text-xs">
                    <div>
                      <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Card Number</label>
                      <input
                        type="text"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                        className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Expires</label>
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                          className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 uppercase tracking-wider mb-2 font-medium">Security CVC</label>
                        <input
                          type="text"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                          className="w-full bg-[#181822] border border-[#2a2a38] rounded-lg px-3.5 py-2.5 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'wire' && (
                  <div className="p-4 bg-[#181824] rounded-xl border border-[#2a2a3a] text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white">Direct Horological Bank Transfer</p>
                    <p>Upon placing your order, our Geneva concierge will provide SWIFT / IBAN wire coordinates. Your timepieces will be placed in secure reservation for 72 hours.</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-[#181824] rounded-xl border border-[#2a2a3a] text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white">White-Glove Cash / Card Upon Arrival</p>
                    <p>Pay upon personal delivery with our certified courier. A dedicated horology agent will present the timepiece and verify timekeeping on-site.</p>
                  </div>
                )}

              </div>

            </div>

            {/* Right Col: Order Summary & Pay */}
            <div>
              <div className="bg-[#13131a] border border-[#22222e] rounded-2xl p-6 sm:p-8 space-y-6 sticky top-28">
                <h2 className="font-['Cinzel'] font-bold text-xl text-white pb-3 border-b border-[#20202c]">
                  Order Overview
                </h2>

                {/* Items preview */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex items-center space-x-3 text-xs">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-[#0d0d12]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{item.name}</h4>
                        <span className="text-gray-400 text-[11px]">{item.quantity} × {BRAND_CONFIG.currency}{item.price.toLocaleString()}</span>
                      </div>
                      <span className="text-white font-bold">
                        {BRAND_CONFIG.currency}{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#20202c] space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Timepieces Subtotal</span>
                    <span className="text-white font-medium">{BRAND_CONFIG.currency}{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Insurance</span>
                    <span className="text-emerald-400">{shippingCost === 0 ? 'Complimentary' : `$${shippingCost}`}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#20202c] flex justify-between items-baseline">
                  <span className="text-sm font-semibold uppercase tracking-wider text-gray-200">Total Due</span>
                  <span className="text-2xl font-bold text-[#c5a880]">
                    {BRAND_CONFIG.currency}{total.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#c5a880] hover:bg-[#d8be98] text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xl shadow-[#c5a880]/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Reservation...</span>
                  ) : (
                    <>
                      <span>Complete Reservation</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-gray-500 pt-2">
                  <ShieldCheck size={14} className="text-[#c5a880]" />
                  <span>5-Year Manufacturer Warranty & Insured Delivery</span>
                </div>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
};

export default Checkout;
