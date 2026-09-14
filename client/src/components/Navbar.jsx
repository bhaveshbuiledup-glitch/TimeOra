import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  Watch, 
  ChevronRight 
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brandConfig';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { totalItemsCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Watches', path: '/watches' },
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'New Arrivals', path: '/new-arrivals' },
    { name: 'Best Sellers', path: '/best-sellers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-[#0b0b0d]/90 backdrop-blur-md border-b border-[#2a2a2a]/80 py-3 shadow-2xl' 
            : 'bg-gradient-to-b from-[#0b0b0d]/90 via-[#0b0b0d]/50 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-300 hover:text-[#c5a880] p-1.5 focus:outline-none transition-colors"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <Link to="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 rounded-full border border-[#c5a880]/40 flex items-center justify-center bg-[#18181f] group-hover:border-[#c5a880] transition-colors">
                  <Watch size={18} className="text-[#c5a880]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-['Cinzel'] tracking-[0.25em] text-xl sm:text-2xl font-bold text-white group-hover:text-[#c5a880] transition-colors">
                    {BRAND_CONFIG.name}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#c5a880] -mt-1 font-medium">
                    Geneve
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-xs uppercase tracking-[0.2em] font-medium transition-all relative py-1 hover:text-[#c5a880] ${
                      isActive 
                        ? 'text-[#c5a880] font-semibold' 
                        : 'text-gray-300'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#c5a880] rounded-full animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Icons (Search, Wishlist, Cart, Account) */}
            <div className="flex items-center space-x-4 sm:space-x-5">
              
              {/* Search Button */}
              <button 
                onClick={onOpenSearch}
                className="text-gray-300 hover:text-[#c5a880] transition-colors p-1"
                title="Search Watches"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist Button */}
              <Link 
                to="/wishlist" 
                className="text-gray-300 hover:text-[#c5a880] transition-colors relative p-1"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart size={20} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c5a880] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="text-gray-300 hover:text-[#c5a880] transition-colors relative p-1"
                title="Shopping Bag"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#c5a880] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-[#c5a880]/30">
                    {totalItemsCount}
                  </span>
                )}
              </button>

              {/* Account Link */}
              <Link 
                to={isAuthenticated ? "/account" : "/login"} 
                className="text-gray-300 hover:text-[#c5a880] transition-colors p-1 flex items-center space-x-1"
                title={isAuthenticated ? `Account (${user?.name})` : "Sign In"}
                aria-label="User Account"
              >
                <User size={20} />
                {isAuthenticated && (
                  <span className="hidden md:inline text-xs tracking-wider text-[#c5a880] font-medium max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </Link>

            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-[#111116] border-r border-[#2a2a2a] h-full overflow-y-auto p-6 flex flex-col justify-between z-50">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#22222b]">
                <div className="flex items-center space-x-2">
                  <Watch size={20} className="text-[#c5a880]" />
                  <span className="font-['Cinzel'] tracking-[0.2em] font-bold text-white text-lg">
                    {BRAND_CONFIG.name}
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="py-6 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="flex items-center justify-between py-2.5 px-3 text-sm uppercase tracking-[0.15em] text-gray-200 hover:text-[#c5a880] hover:bg-white/5 rounded-md transition-all"
                  >
                    <span>{link.name}</span>
                    <ChevronRight size={16} className="text-gray-500" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#22222b] space-y-4">
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="w-full block text-center py-2.5 px-4 bg-[#c5a880] text-black font-semibold text-xs tracking-widest uppercase rounded hover:bg-[#d8be98] transition-colors"
              >
                {isAuthenticated ? "My Account" : "Sign In / Register"}
              </Link>
              <p className="text-center text-xs text-gray-500">
                {BRAND_CONFIG.tagline}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
