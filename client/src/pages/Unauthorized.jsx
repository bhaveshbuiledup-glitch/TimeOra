import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-32 pb-24 text-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 text-center space-y-6">
        
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-950/40 border border-red-900/50 mx-auto flex items-center justify-center">
          <ShieldOff size={36} className="text-red-400" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-[0.3em] block">
            Access Denied
          </span>
          <h1 className="text-3xl font-['Cinzel'] font-bold text-white">
            Unauthorized Access
          </h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm mx-auto">
            You do not have the required permissions to access this area. 
            This section is restricted to authorized administrators only.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-[#181822] hover:bg-[#222230] border border-[#2d2d3d] text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-widest rounded-lg flex items-center space-x-2 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>
          <Link
            to="/home"
            className="px-6 py-3 bg-[#2dd4bf] hover:bg-[#5eead4] text-black text-xs font-semibold uppercase tracking-widest rounded-lg flex items-center space-x-2 transition-all"
          >
            <Home size={14} />
            <span>Return Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Unauthorized;
