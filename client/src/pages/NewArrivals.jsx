import React, { useState } from 'react';
import { WATCH_PRODUCTS } from '../data/watches';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { Sparkles } from 'lucide-react';

const NewArrivals = () => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const newProducts = WATCH_PRODUCTS.filter(w => w.newArrival);

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#1c1c28] border border-[#c5a880]/40 text-[#c5a880] text-xs uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} />
            <span>Latest Atelier Creations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-['Cinzel'] font-bold text-white mb-4">
            New Arrivals
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-light">
            Be the first to experience the latest innovations in contemporary watchmaking from TIMEORA.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={setQuickViewProduct}
            />
          ))}
        </div>

      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};

export default NewArrivals;
