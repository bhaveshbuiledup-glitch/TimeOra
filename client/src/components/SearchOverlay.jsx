import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const SearchOverlay = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const results = query.trim() === '' ? [] : products.filter(item => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.movement.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.gender.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col items-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <X size={26} />
      </button>

      <div className="w-full max-w-2xl">
        {/* Search input container */}
        <div className="relative border-b-2 border-[#2dd4bf] pb-3 mb-8">
          <Search size={26} className="absolute left-0 top-2 text-[#2dd4bf]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search watches, complications, models, or categories..."
            className="w-full bg-transparent pl-10 pr-10 text-xl sm:text-2xl text-white placeholder-gray-500 focus:outline-none font-['Cinzel']"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-0 top-3 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        {query === '' && (
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-gray-400 block font-semibold">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {['Chronograph', 'Diver', 'Moonphase', 'Skeleton', 'Gold', 'Diamonds', 'Men', 'Women'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3.5 py-1.5 rounded-full text-xs bg-[#1a1a24] text-gray-300 hover:bg-[#2dd4bf] hover:text-black transition-colors border border-[#2a2a38]"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query !== '' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest pb-2 border-b border-[#20202b]">
              <span>Search Results ({results.length})</span>
              {results.length > 0 && <span>Click to inspect</span>}
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No timepieces found matching "{query}". Try searching for Chronograph, Diver, or Moonphase.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.id}`}
                    onClick={onClose}
                    className="flex items-center space-x-4 p-3 rounded-xl bg-[#14141c] hover:bg-[#1e1e28] border border-[#22222d] hover:border-[#2dd4bf]/50 transition-all group"
                  >
                    <img 
                      src={item.images?.[0]} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg bg-[#0d0d12]" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-[10px] text-[#2dd4bf] uppercase tracking-wider">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.gender}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#2dd4bf] font-['Cinzel'] truncate transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">{item.movement}</p>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-sm font-bold text-white">
                        {BRAND_CONFIG.currency}{(item.discountPrice || item.price).toLocaleString()}
                      </span>
                      <div className="flex items-center text-[#2dd4bf] text-[10px] mt-0.5">
                        <Star size={10} fill="currentColor" className="mr-0.5" />
                        <span>{item.rating}</span>
                      </div>
                    </div>

                    <ArrowRight size={16} className="text-gray-500 group-hover:text-[#2dd4bf] group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchOverlay;
