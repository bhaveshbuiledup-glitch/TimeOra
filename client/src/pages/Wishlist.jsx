import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-semibold text-[#c5a880] uppercase tracking-[0.3em] block mb-2">
            Personal Curation
          </span>
          <h1 className="text-3xl sm:text-5xl font-['Cinzel'] font-bold text-white mb-3">
            Your Horological Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-light">
            Timepieces reserved in your private gaze for future acquisition.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-[#121217] border border-[#22222e] rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#181822] border border-[#2a2a38] mx-auto flex items-center justify-center text-[#c5a880]">
              <Heart size={28} />
            </div>
            <h2 className="font-['Cinzel'] font-bold text-xl text-white">Your Wishlist is Empty</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore our handcrafted collections and click the heart icon on any timepiece to curate your private favorites.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-[#121217] border border-[#22222e] rounded-xl overflow-hidden flex flex-col justify-between group hover:border-[#c5a880]/50 transition-all shadow-xl"
              >
                <div className="relative aspect-[4/5] bg-[#161620] overflow-hidden">
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-gray-300 hover:text-red-400 flex items-center justify-center transition-colors"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] text-[#c5a880] uppercase tracking-wider block mb-1">
                      {item.category}
                    </span>
                    <Link to={`/product/${item.id}`} className="font-['Cinzel'] font-bold text-sm text-white hover:text-[#c5a880] transition-colors block line-clamp-1">
                      {item.name}
                    </Link>
                    <div className="mt-2 text-sm font-bold text-white">
                      {BRAND_CONFIG.currency}{(item.discountPrice || item.price).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1e1e28]">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full py-2.5 bg-[#1a1a24] hover:bg-[#c5a880] text-gray-200 hover:text-black border border-[#2c2c3c] hover:border-[#c5a880] text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2 transition-all"
                    >
                      <ShoppingBag size={14} />
                      <span>Move to Bag</span>
                    </button>
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

export default Wishlist;
