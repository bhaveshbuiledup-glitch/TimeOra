import React from 'react';
import { Link } from 'react-router-dom';
import { Watch, ArrowLeft } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-36 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#161622] border border-[#2a2a38] mx-auto flex items-center justify-center text-[#c5a880]">
          <Watch size={36} />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-[#c5a880] font-semibold block">
          Error 404 • Lost in Time
        </span>
        <h1 className="text-3xl font-['Cinzel'] font-bold text-white">
          Timepiece Not Located
        </h1>
        <p className="text-xs text-gray-400 font-light leading-relaxed">
          The horological chapter you are seeking does not exist or has been retired to our private historical archives.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#c5a880] text-black font-semibold text-xs uppercase tracking-widest rounded-lg hover:bg-[#d8be98] transition-colors shadow-lg"
        >
          <ArrowLeft size={16} />
          <span>Return to {BRAND_CONFIG.name}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
