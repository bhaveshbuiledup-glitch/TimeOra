import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Tag, 
  PackageX, 
  PackageCheck, 
  Search, 
  Check, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Mail, 
  DollarSign, 
  Eye, 
  ArrowUpRight,
  Sparkles,
  Percent,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { BRAND_CONFIG } from '../config/brandConfig';

const PRESET_WATCH_IMAGES = [
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200",
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200",
  "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1200",
  "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1200",
  "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1200",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200"
];

const Admin = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    markOutOfStock, 
    markAvailable, 
    setProductOffer, 
    removeProductOffer,
    resetCatalog 
  } = useProducts();

  const { adminEmail, updateAdminEmail } = useAuth();

  // Email editing state (ensuring lowercase always)
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(adminEmail.toLowerCase().trim());
  const [emailSuccessMsg, setEmailSuccessMsg] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'out_of_stock', 'on_offer'

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingProductId, setEditingProductId] = useState(null);

  // Form State for Create / Edit Product
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    description: '',
    stock: 10,
    category: 'Chronograph',
    gender: 'Men',
    image: PRESET_WATCH_IMAGES[0],
    tagline: ''
  });

  // Offer Modal State
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedProductForOffer, setSelectedProductForOffer] = useState(null);
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [offerPercentInput, setOfferPercentInput] = useState('15');

  // Confirmation Delete State
  const [productToDelete, setProductToDelete] = useState(null);

  // Handle saving admin email in lowercase
  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    const lowercased = emailInput.toLowerCase().trim();
    updateAdminEmail(lowercased);
    setEmailInput(lowercased);
    setIsEditingEmail(false);
    setEmailSuccessMsg('Admin email saved in lowercase.');
    setTimeout(() => setEmailSuccessMsg(''), 3000);
  };

  // Open modal for new product
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingProductId(null);
    setFormData({
      name: '',
      price: '',
      discountPrice: '',
      description: '',
      stock: 10,
      category: 'Chronograph',
      gender: 'Men',
      image: PRESET_WATCH_IMAGES[Math.floor(Math.random() * PRESET_WATCH_IMAGES.length)],
      tagline: 'Handcrafted Haute Horlogerie'
    });
    setIsProductModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice || '',
      description: product.description,
      stock: product.stock,
      category: product.category || 'Chronograph',
      gender: product.gender || 'Men',
      image: product.images?.[0] || product.image || PRESET_WATCH_IMAGES[0],
      tagline: product.tagline || ''
    });
    setIsProductModalOpen(true);
  };

  // Submit Create or Edit Product
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) return;

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      description: formData.description.trim(),
      stock: Number(formData.stock) >= 0 ? Number(formData.stock) : 0,
      category: formData.category,
      gender: formData.gender,
      images: [formData.image],
      image: formData.image,
      tagline: formData.tagline || 'Engineered with Precision'
    };

    if (modalMode === 'create') {
      addProduct(payload);
    } else {
      updateProduct(editingProductId, payload);
    }

    setIsProductModalOpen(false);
  };

  // Open Offer modal
  const handleOpenOfferModal = (product) => {
    setSelectedProductForOffer(product);
    if (product.discountPrice) {
      setOfferPriceInput(product.discountPrice);
      const discountPct = Math.round(((product.price - product.discountPrice) / product.price) * 100);
      setOfferPercentInput(discountPct);
    } else {
      const calculated = Math.round(product.price * 0.85); // 15% off default
      setOfferPriceInput(calculated);
      setOfferPercentInput(15);
    }
    setIsOfferModalOpen(true);
  };

  // Apply offer from percentage
  const handlePercentChange = (pct) => {
    setOfferPercentInput(pct);
    if (selectedProductForOffer) {
      const discounted = Math.round(selectedProductForOffer.price * (1 - pct / 100));
      setOfferPriceInput(discounted);
    }
  };

  // Save offer
  const handleSaveOffer = (e) => {
    e.preventDefault();
    if (selectedProductForOffer && offerPriceInput) {
      setProductOffer(selectedProductForOffer.id, offerPriceInput);
      setIsOfferModalOpen(false);
    }
  };

  // Remove offer
  const handleRemoveOffer = (productId) => {
    removeProductOffer(productId);
    setIsOfferModalOpen(false);
  };

  // Toggle Out of Stock
  const handleToggleStock = (product) => {
    if (product.stock <= 0) {
      markAvailable(product.id, 10);
    } else {
      markOutOfStock(product.id);
    }
  };

  // Filter products by search and status
  const filteredProducts = products.filter(item => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCategory) return false;
    }

    // Status filter
    if (statusFilter === 'available') {
      return item.stock > 0 && !item.discountPrice;
    }
    if (statusFilter === 'out_of_stock') {
      return item.stock <= 0;
    }
    if (statusFilter === 'on_offer') {
      return item.discountPrice && item.discountPrice < item.price;
    }

    return true;
  });

  // Calculate statistics
  const totalCount = products.length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const onOfferCount = products.filter(p => p.discountPrice && p.discountPrice < p.price).length;
  const availableCount = products.filter(p => p.stock > 0).length;

  return (
    <div className="min-h-screen bg-[#0b0b0d] pt-28 pb-24 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Admin Email Bar */}
        <div className="bg-[#121218] border border-[#242432] rounded-2xl p-6 sm:p-8 mb-8 relative shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  Atelier Control Center
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-ping" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-['Cinzel'] font-bold text-white mt-1">
                Admin Panel & Inventory
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Manage luxury timepieces, inventory stock, exclusive offers, and atelier status.
              </p>
            </div>

            {/* Admin Email Box: strictly lowercase display and auto-convert */}
            <div className="bg-[#161622] border border-[#2e2e42] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail size={14} className="text-[#c5a880]" />
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Admin Email</span>
                </div>
                {!isEditingEmail && (
                  <button
                    onClick={() => {
                      setEmailInput(adminEmail.toLowerCase().trim());
                      setIsEditingEmail(true);
                    }}
                    className="text-[11px] text-[#c5a880] hover:underline"
                  >
                    Change Email
                  </button>
                )}
              </div>

              {isEditingEmail ? (
                <form onSubmit={handleSaveEmail} className="flex items-center gap-2 mt-2">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    // Automatically convert input to lowercase
                    onChange={(e) => setEmailInput(e.target.value.toLowerCase().trim())}
                    placeholder="admin@timeora.com"
                    className="bg-[#0f0f15] border border-[#3a3a4e] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#c5a880] font-mono lowercase"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#c5a880] text-black text-xs font-bold rounded hover:bg-[#d8be98]"
                    title="Save Email"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-2.5 py-1 bg-[#22222f] text-gray-300 text-xs rounded hover:bg-white/10"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-2 mt-1">
                  {/* Display admin email strictly in lowercase */}
                  <span className="font-mono text-sm font-semibold text-white tracking-wide lowercase select-all">
                    {adminEmail.toLowerCase().trim()}
                  </span>
                  <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded uppercase font-bold">
                    Active
                  </span>
                </div>
              )}

              {emailSuccessMsg && (
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  {emailSuccessMsg}
                </span>
              )}
            </div>

          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#20202c]">
            <div 
              onClick={() => setStatusFilter('all')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'all' 
                  ? 'bg-[#1c1c28] border-[#c5a880]' 
                  : 'bg-[#14141c] border-[#22222d] hover:border-gray-600'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-medium">Total Timepieces</span>
              <span className="text-xl font-bold text-white font-['Cinzel']">{totalCount}</span>
            </div>

            <div 
              onClick={() => setStatusFilter('available')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'available' 
                  ? 'bg-[#1c1c28] border-emerald-500' 
                  : 'bg-[#14141c] border-[#22222d] hover:border-gray-600'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-medium">Available</span>
              <span className="text-xl font-bold text-emerald-400 font-['Cinzel']">{availableCount}</span>
            </div>

            <div 
              onClick={() => setStatusFilter('out_of_stock')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'out_of_stock' 
                  ? 'bg-[#1c1c28] border-red-500' 
                  : 'bg-[#14141c] border-[#22222d] hover:border-gray-600'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-red-400 block font-medium">Out of Stock</span>
              <span className="text-xl font-bold text-red-400 font-['Cinzel']">{outOfStockCount}</span>
            </div>

            <div 
              onClick={() => setStatusFilter('on_offer')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                statusFilter === 'on_offer' 
                  ? 'bg-[#1c1c28] border-[#c5a880]' 
                  : 'bg-[#14141c] border-[#22222d] hover:border-gray-600'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider text-[#c5a880] block font-medium">On Offer</span>
              <span className="text-xl font-bold text-[#c5a880] font-['Cinzel']">{onOfferCount}</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="bg-[#121217] border border-[#22222d] rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, SKU..."
              className="w-full bg-[#181822] border border-[#2c2c3c] rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a880]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Pills & Add Button */}
          <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center space-x-1.5 bg-[#171722] p-1 rounded-lg border border-[#262636] text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-[#c5a880] text-black font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  statusFilter === 'available' ? 'bg-emerald-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Available
              </button>
              <button
                onClick={() => setStatusFilter('out_of_stock')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  statusFilter === 'out_of_stock' ? 'bg-red-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                Out of Stock
              </button>
              <button
                onClick={() => setStatusFilter('on_offer')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  statusFilter === 'on_offer' ? 'bg-amber-600 text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                On Offer
              </button>
            </div>

            {/* "+ New Product" Button */}
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-[#c5a880] hover:bg-[#d8be98] text-black font-bold text-xs uppercase tracking-widest rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-[#c5a880]/20"
            >
              <Plus size={16} />
              <span>New Product</span>
            </button>
          </div>

        </div>

        {/* Product Inventory Table / Cards */}
        <div className="bg-[#121217] border border-[#22222d] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#20202c] bg-[#161622] text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Timepiece</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Inventory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2a]">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      No timepieces matching the current query or status filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const isOutOfStock = Number(product.stock) <= 0;
                    const isOnOffer = Boolean(product.discountPrice && product.discountPrice < product.price);
                    const discountPercent = isOnOffer 
                      ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
                      : 0;

                    return (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                        
                        {/* Timepiece info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={product.images?.[0] || product.image || PRESET_WATCH_IMAGES[0]}
                              alt={product.name}
                              className="w-14 h-14 object-cover rounded-lg bg-[#0c0c10] border border-[#262634] flex-shrink-0"
                            />
                            <div>
                              <span className="font-mono text-[10px] text-[#c5a880] uppercase tracking-wider block">
                                REF: {product.sku || product.id}
                              </span>
                              <h3 className="font-['Cinzel'] font-bold text-white text-sm line-clamp-1">
                                {product.name}
                              </h3>
                              <span className="text-gray-400 text-[11px]">
                                {product.category} • {product.gender}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price & Offer info */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {isOnOffer ? (
                            <div>
                              <span className="font-bold text-[#c5a880] text-sm block">
                                {BRAND_CONFIG.currency}{product.discountPrice.toLocaleString()}
                              </span>
                              <span className="text-[11px] text-gray-500 line-through block">
                                {BRAND_CONFIG.currency}{product.price.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">
                                {discountPercent}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-white text-sm">
                              {BRAND_CONFIG.currency}{product.price.toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Quantity / Stock */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`font-mono text-xs font-semibold ${isOutOfStock ? 'text-red-400' : 'text-gray-200'}`}>
                            {product.stock} units
                          </span>
                        </td>

                        {/* Status Badges: Available | Out of Stock | On Offer */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            {isOutOfStock ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                Available
                              </span>
                            )}

                            {isOnOffer && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800">
                                On Offer (-{discountPercent}%)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            
                            {/* Toggle Out of Stock Button */}
                            <button
                              onClick={() => handleToggleStock(product)}
                              className={`p-2 rounded-lg border transition-all text-xs flex items-center space-x-1 ${
                                isOutOfStock
                                  ? 'bg-emerald-950/50 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                                  : 'bg-red-950/40 hover:bg-red-900 border-red-800 text-red-300'
                              }`}
                              title={isOutOfStock ? "Mark as Available" : "Mark as Out of Stock"}
                            >
                              {isOutOfStock ? <PackageCheck size={14} /> : <PackageX size={14} />}
                              <span className="hidden sm:inline">
                                {isOutOfStock ? "Restock" : "Out of Stock"}
                              </span>
                            </button>

                            {/* Discount / Offer Button */}
                            <button
                              onClick={() => handleOpenOfferModal(product)}
                              className={`p-2 rounded-lg border transition-all text-xs flex items-center space-x-1 ${
                                isOnOffer
                                  ? 'bg-amber-950/60 hover:bg-amber-900 border-amber-700 text-amber-300'
                                  : 'bg-[#1c1c28] hover:bg-[#28283a] border-[#2e2e42] text-gray-300 hover:text-white'
                              }`}
                              title="Set or Adjust Offer"
                            >
                              <Tag size={14} className={isOnOffer ? 'text-amber-400' : 'text-[#c5a880]'} />
                              <span className="hidden sm:inline">
                                {isOnOffer ? "Edit Offer" : "Add Offer"}
                              </span>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-2 rounded-lg bg-[#1a1a24] hover:bg-[#252533] border border-[#2e2e3e] text-gray-300 hover:text-[#c5a880] transition-colors"
                              title="Edit Timepiece"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setProductToDelete(product)}
                              className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/60 border border-red-900/50 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Timepiece"
                            >
                              <Trash2 size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 1. CREATE / EDIT PRODUCT MODAL                            */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsProductModalOpen(false)}
          />

          <div className="relative bg-[#13131a] border border-[#2e2e40] rounded-2xl max-w-2xl w-full p-6 sm:p-8 z-10 shadow-2xl my-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#222232] mb-6">
              <div>
                <h2 className="font-['Cinzel'] font-bold text-xl text-white">
                  {modalMode === 'create' ? 'Add New Timepiece' : 'Edit Timepiece Specifications'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure watch details, images, stock quantity, and pricing.
                </p>
              </div>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4 text-xs">
              
              {/* Name */}
              <div>
                <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. TIMEORA Grand Complication Rose"
                  className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Price & Quantity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                    Price ({BRAND_CONFIG.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="1850"
                    className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="10"
                    className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                    Offer Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                    placeholder="e.g. 1550"
                    className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880] font-mono"
                  />
                </div>
              </div>

              {/* Category & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880] cursor-pointer"
                  >
                    <option value="Chronograph">Chronograph</option>
                    <option value="Dress">Dress</option>
                    <option value="Diver">Diver</option>
                    <option value="Complication">Complication</option>
                    <option value="Skeleton">Skeleton</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Vintage">Vintage</option>
                    <option value="Haute Horlogerie">Haute Horlogerie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                    Gender Target
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880] cursor-pointer"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>

              {/* Product Image URL */}
              <div>
                <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                  Product Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="preview"
                      className="w-10 h-10 object-cover rounded-lg border border-[#2c2c3e] bg-black"
                    />
                  )}
                </div>

                {/* Preset Image Suggestions */}
                <div className="mt-2">
                  <span className="text-[10px] text-gray-500 block mb-1">Select from high-res horology presets:</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_WATCH_IMAGES.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({...formData, image: url})}
                        className={`w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                          formData.image === url ? 'border-[#c5a880] ring-2 ring-[#c5a880]' : 'border-white/10 opacity-60'
                        }`}
                      >
                        <img src={url} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                  Product Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed horological description including materials, movement, sapphire crystal..."
                  className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#222232]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2.5 bg-[#1b1b26] hover:bg-[#252535] text-gray-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#c5a880] hover:bg-[#d8be98] text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg"
                >
                  {modalMode === 'create' ? 'Publish Timepiece' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DISCOUNT / OFFER CONFIGURATION MODAL                   */}
      {/* ========================================================= */}
      {isOfferModalOpen && selectedProductForOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsOfferModalOpen(false)}
          />

          <div className="relative bg-[#13131a] border border-[#2e2e40] rounded-2xl max-w-md w-full p-6 sm:p-8 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#222232] mb-6">
              <div className="flex items-center space-x-2 text-[#c5a880]">
                <Tag size={18} />
                <h2 className="font-['Cinzel'] font-bold text-lg text-white">
                  Configure Special Offer
                </h2>
              </div>
              <button 
                onClick={() => setIsOfferModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-[#181822] border border-[#252533] flex items-center space-x-3">
              <img
                src={selectedProductForOffer.images?.[0] || selectedProductForOffer.image}
                alt={selectedProductForOffer.name}
                className="w-12 h-12 object-cover rounded-lg bg-black"
              />
              <div>
                <h4 className="font-['Cinzel'] font-bold text-white text-xs">{selectedProductForOffer.name}</h4>
                <span className="text-gray-400 text-[11px]">
                  Regular Price: {BRAND_CONFIG.currency}{selectedProductForOffer.price.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-4 text-xs">
              
              {/* Quick Percent Buttons */}
              <div>
                <label className="block text-gray-300 uppercase tracking-wider mb-2 font-semibold">
                  Quick Discount Percentage
                </label>
                <div className="flex gap-2">
                  {[10, 15, 20, 25, 30].map(pct => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => handlePercentChange(pct)}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                        Number(offerPercentInput) === pct 
                          ? 'bg-[#c5a880] text-black border-[#c5a880]' 
                          : 'bg-[#181822] text-gray-300 border-[#2b2b3b] hover:border-gray-500'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Offer Price */}
              <div>
                <label className="block text-gray-300 uppercase tracking-wider mb-1.5 font-semibold">
                  Offer Price ({BRAND_CONFIG.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedProductForOffer.price - 1}
                  value={offerPriceInput}
                  onChange={(e) => setOfferPriceInput(e.target.value)}
                  className="w-full bg-[#181824] border border-[#2c2c3e] rounded-xl px-3.5 py-2.5 text-white text-sm font-bold font-mono focus:outline-none focus:border-[#c5a880]"
                />
                {offerPriceInput && (
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    Patron saves: {BRAND_CONFIG.currency}{(selectedProductForOffer.price - Number(offerPriceInput)).toLocaleString()} ({Math.round(((selectedProductForOffer.price - Number(offerPriceInput)) / selectedProductForOffer.price) * 100)}% off)
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#222232] flex items-center justify-between">
                {selectedProductForOffer.discountPrice ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveOffer(selectedProductForOffer.id)}
                    className="px-3.5 py-2 bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Remove Offer
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOfferModalOpen(false)}
                    className="px-4 py-2 bg-[#1b1b26] text-gray-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#c5a880] hover:bg-[#d8be98] text-black font-bold text-xs uppercase tracking-wider rounded-lg"
                  >
                    Apply Offer
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CONFIRM DELETE MODAL                                   */}
      {/* ========================================================= */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setProductToDelete(null)}
          />

          <div className="relative bg-[#13131a] border border-[#2e2e40] rounded-2xl max-w-sm w-full p-6 z-10 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800 mx-auto flex items-center justify-center text-red-400">
              <Trash2 size={24} />
            </div>

            <h3 className="font-['Cinzel'] font-bold text-lg text-white">
              Delete Timepiece?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Are you sure you want to permanently retire <strong className="text-white">"{productToDelete.name}"</strong> from the TIMEORA portfolio?
            </p>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-[#1a1a24] text-gray-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
