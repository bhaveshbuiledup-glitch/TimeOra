import React, { useState, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
  Upload,
  RefreshCw,
  Video,
  Film,
  Star,
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
    images: [],
    video: '',
    tagline: ''
  });

  // Media Upload Refs & States
  const imagesInputRef = useRef(null);
  const replaceImageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [replacingIndex, setReplacingIndex] = useState(null);

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [dragImagesActive, setDragImagesActive] = useState(false);
  const [dragVideoActive, setDragVideoActive] = useState(false);
  const [showUrlOption, setShowUrlOption] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');

  // Handle uploading multiple image files (up to 6 max)
  const handleImagesSelect = async (filesList) => {
    if (!filesList || filesList.length === 0) return;

    const currentCount = formData.images ? formData.images.length : 0;
    if (currentCount >= 6) {
      setMediaError('Maximum limit of 6 product images reached. Remove an image to add another.');
      return;
    }

    const availableSlots = 6 - currentCount;
    const filesToProcess = Array.from(filesList).slice(0, availableSlots);

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFile = filesToProcess.find(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return !allowedMimeTypes.includes(file.type.toLowerCase()) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext);
    });

    if (invalidFile) {
      setMediaError('Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }

    const oversizedFile = filesToProcess.find(file => file.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      setMediaError('One or more images exceed the 10MB file size limit.');
      return;
    }

    setMediaError('');
    setUploadingMedia(true);

    const newUrls = [];

    // Try backend upload route first
    try {
      const uploadData = new FormData();
      filesToProcess.forEach(f => uploadData.append('images', f));

      const res = await axios.post(`${API_BASE}/api/upload/multiple`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && Array.isArray(res.data.urls)) {
        newUrls.push(...res.data.urls);
      }
    } catch (err) {
      console.warn('Backend multi-upload server endpoint unreachable, using client FileReader fallback:', err.message);
    }

    // Fallback: Read remaining files with FileReader
    if (newUrls.length < filesToProcess.length) {
      const readPromises = filesToProcess.slice(newUrls.length).map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const readResults = await Promise.all(readPromises);
      readResults.filter(Boolean).forEach(url => newUrls.push(url));
    }

    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newUrls].slice(0, 6)
    }));
    setUploadingMedia(false);
  };

  // Replace a specific image at index
  const handleReplaceImageFile = async (index, file) => {
    if (!file) return;

    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowedMimeTypes.includes(file.type.toLowerCase()) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      setMediaError('Only JPG, JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMediaError('File size exceeds the 10MB limit.');
      return;
    }

    setMediaError('');
    setUploadingMedia(true);

    let newUrl = null;
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await axios.post(`${API_BASE}/api/upload`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data?.url) {
        newUrl = res.data.url;
      }
    } catch (e) {
      // Fallback
    }

    if (!newUrl) {
      newUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    if (newUrl) {
      setFormData(prev => {
        const updated = [...(prev.images || [])];
        updated[index] = newUrl;
        return { ...prev, images: updated };
      });
    }

    setUploadingMedia(false);
    setReplacingIndex(null);
  };

  // Remove a specific image at index
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Make an image the primary image (move to index 0)
  const handleSetPrimaryImage = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const list = [...prev.images];
      const target = list.splice(index, 1)[0];
      return { ...prev, images: [target, ...list] };
    });
  };

  // Add image from manual URL
  const handleAddManualUrlImage = () => {
    if (!manualUrlInput || !manualUrlInput.trim()) return;
    if (formData.images && formData.images.length >= 6) {
      setMediaError('Maximum limit of 6 product images reached.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), manualUrlInput.trim()].slice(0, 6)
    }));
    setManualUrlInput('');
  };

  // Handle Video Select
  const handleVideoSelect = async (file) => {
    if (!file) return;

    const allowedVideoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const ext = file.name.split('.').pop().toLowerCase();
    const isAllowedExt = ['mp4', 'webm', 'mov', 'ogg'].includes(ext);

    if (!allowedVideoMimeTypes.includes(file.type.toLowerCase()) && !isAllowedExt) {
      setMediaError('Only MP4 and WebM video formats are supported.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMediaError('Video file size exceeds the 50MB limit.');
      return;
    }

    setMediaError('');
    setUploadingMedia(true);

    let videoUrl = null;
    try {
      const uploadData = new FormData();
      uploadData.append('video', file);
      const res = await axios.post(`${API_BASE}/api/upload/video`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success && res.data?.url) {
        videoUrl = res.data.url;
      }
    } catch (e) {
      console.warn('Backend video endpoint unreachable, using client FileReader fallback:', err.message);
    }

    if (!videoUrl) {
      videoUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    if (videoUrl) {
      setFormData(prev => ({ ...prev, video: videoUrl }));
    }

    setUploadingMedia(false);
  };

  const handleRemoveVideo = () => {
    setFormData(prev => ({ ...prev, video: '' }));
  };

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
    setMediaError('');
    setUploadingMedia(false);
    setShowUrlOption(false);
    setManualUrlInput('');
    setFormData({
      name: '',
      price: '',
      discountPrice: '',
      description: '',
      stock: 10,
      category: 'Chronograph',
      gender: 'Men',
      images: [],
      video: '',
      tagline: 'Handcrafted Haute Horlogerie'
    });
    setIsProductModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEditModal = (product) => {
    setModalMode('edit');
    setEditingProductId(product.id);
    setMediaError('');
    setUploadingMedia(false);
    setShowUrlOption(false);
    setManualUrlInput('');

    const existingImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : [PRESET_WATCH_IMAGES[0]]);

    setFormData({
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice || '',
      description: product.description,
      stock: product.stock,
      category: product.category || 'Chronograph',
      gender: product.gender || 'Men',
      images: existingImages,
      video: product.video || '',
      tagline: product.tagline || ''
    });
    setIsProductModalOpen(true);
  };

  // Submit Create or Edit Product
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) return;
    
    if (!formData.images || formData.images.length === 0) {
      setMediaError('Please upload at least 1 product image.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      description: formData.description.trim(),
      stock: Number(formData.stock) >= 0 ? Number(formData.stock) : 0,
      category: formData.category,
      gender: formData.gender,
      images: formData.images,
      image: formData.images[0], // primary image
      video: formData.video || '',
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

              {/* Media Section: Images (Up to 6) & Video Showcase */}
              <div className="space-y-5 pt-3 border-t border-[#222232]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-['Cinzel'] flex items-center space-x-2">
                      <ImageIcon size={16} className="text-[#c5a880]" />
                      <span>Product Media Showcase</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Upload up to 6 product images and 1 optional product video.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowUrlOption(!showUrlOption)}
                    className="text-[11px] text-[#c5a880] hover:underline flex items-center space-x-1"
                  >
                    <span>{showUrlOption ? "Hide URL Options" : "Add Image URL / Presets"}</span>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input
                  ref={imagesInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files) handleImagesSelect(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <input
                  ref={replaceImageInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && replacingIndex !== null) {
                      handleReplaceImageFile(replacingIndex, e.target.files[0]);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVideoSelect(e.target.files[0]);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                {/* Error Banner */}
                {mediaError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                      <span>{mediaError}</span>
                    </div>
                    <button type="button" onClick={() => setMediaError('')} className="text-red-400 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* 1. PRODUCT IMAGES GRID (Max 6) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-gray-300 uppercase tracking-wider text-xs font-semibold">
                      Product Images ({formData.images?.length || 0}/6) *
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium">
                      ★ 1st image is Main/Primary image
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {formData.images?.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        className="relative aspect-square bg-[#161622] border border-[#2c2c3e] rounded-xl overflow-hidden group shadow-md"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge for index 0 */}
                        {idx === 0 ? (
                          <div className="absolute top-2 left-2 bg-[#c5a880] text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow z-10 flex items-center space-x-1">
                            <Star size={10} fill="currentColor" />
                            <span>Primary</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-[#c5a880] text-white hover:text-black text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur border border-white/10 z-10"
                            title="Set as Main Primary Image"
                          >
                            Make Primary
                          </button>
                        )}

                        {/* Action Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2 backdrop-blur-[1px]">
                          <button
                            type="button"
                            onClick={() => {
                              setReplacingIndex(idx);
                              replaceImageInputRef.current?.click();
                            }}
                            className="p-2 bg-[#252536] hover:bg-[#34344c] text-white rounded-lg transition-colors border border-[#3e3e56]"
                            title="Replace this image"
                          >
                            <Upload size={14} className="text-[#c5a880]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-2 bg-red-950/80 hover:bg-red-900 text-red-300 rounded-lg transition-colors border border-red-800/60"
                            title="Remove image"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Image Dropzone Card if under 6 images limit */}
                    {(!formData.images || formData.images.length < 6) && (
                      <div
                        onDragEnter={(e) => { e.preventDefault(); setDragImagesActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragImagesActive(false); }}
                        onDragOver={(e) => { e.preventDefault(); setDragImagesActive(true); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragImagesActive(false);
                          if (e.dataTransfer.files) handleImagesSelect(e.dataTransfer.files);
                        }}
                        onClick={() => imagesInputRef.current?.click()}
                        className={`aspect-square border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                          dragImagesActive 
                            ? 'border-[#c5a880] bg-[#c5a880]/10' 
                            : 'border-[#2c2c3e] hover:border-[#c5a880]/60 bg-[#14141d]'
                        }`}
                      >
                        {uploadingMedia ? (
                          <div className="flex flex-col items-center space-y-1">
                            <RefreshCw size={20} className="text-[#c5a880] animate-spin" />
                            <span className="text-[10px] text-gray-300">Processing...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-1.5">
                            <div className="w-8 h-8 rounded-full bg-[#1f1f2e] flex items-center justify-center text-[#c5a880]">
                              <Plus size={18} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#c5a880] block">Add Image</span>
                              <span className="text-[9px] text-gray-400 block mt-0.5">JPG, PNG, WebP</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional URL Input & Preset Selector */}
                {showUrlOption && (
                  <div className="p-4 bg-[#161622] border border-[#262638] rounded-xl space-y-3">
                    <div>
                      <label className="block text-gray-300 text-[11px] mb-1 font-semibold">
                        Add Image via Direct URL:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={manualUrlInput}
                          onChange={(e) => setManualUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="flex-1 bg-[#181824] border border-[#2c2c3e] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c5a880]"
                        />
                        <button
                          type="button"
                          onClick={handleAddManualUrlImage}
                          className="px-3 py-1.5 bg-[#c5a880] text-black text-xs font-bold rounded-lg hover:bg-[#d8be98]"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 block mb-1">Or click preset image to add:</span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {PRESET_WATCH_IMAGES.map((url, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => {
                              if (formData.images && formData.images.length >= 6) {
                                setMediaError('Maximum limit of 6 product images reached.');
                                return;
                              }
                              setFormData(prev => ({
                                ...prev,
                                images: [...(prev.images || []), url].slice(0, 6)
                              }));
                            }}
                            className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 opacity-70 hover:opacity-100 flex-shrink-0 transition-all hover:border-[#c5a880]"
                          >
                            <img src={url} alt="preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. PRODUCT VIDEO (Optional, Max 1) */}
                <div className="pt-3 border-t border-[#222232]">
                  <label className="block text-gray-300 uppercase tracking-wider text-xs font-semibold mb-2 flex items-center space-x-1.5">
                    <Video size={14} className="text-[#c5a880]" />
                    <span>Product Video (Optional - Max 1)</span>
                  </label>

                  {formData.video ? (
                    /* Video Preview Card */
                    <div className="bg-[#161622] border border-[#2c2c3e] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-black border border-[#343448] flex-shrink-0 relative">
                        <video
                          src={formData.video}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                          <Film size={14} className="text-[#c5a880]" />
                          <span>Showcase Video Ready</span>
                        </span>
                        <span className="text-[10px] text-gray-400 max-w-[200px] truncate mt-1">
                          {formData.video.startsWith('data:') ? 'Base64 Video Data Stream' : formData.video}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-3 py-2 bg-[#252536] hover:bg-[#34344a] text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors border border-[#36364e]"
                        >
                          <Upload size={14} className="text-[#c5a880]" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="px-3 py-2 bg-red-950/40 hover:bg-red-900 text-red-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors border border-red-900/50"
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Video Dropzone */
                    <div
                      onDragEnter={(e) => { e.preventDefault(); setDragVideoActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragVideoActive(false); }}
                      onDragOver={(e) => { e.preventDefault(); setDragVideoActive(true); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragVideoActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleVideoSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => videoInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        dragVideoActive 
                          ? 'border-[#c5a880] bg-[#c5a880]/10' 
                          : 'border-[#2c2c3e] hover:border-[#c5a880]/50 bg-[#14141d]'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-1.5">
                        <div className="w-9 h-9 rounded-full bg-[#1e1e2c] border border-[#323246] flex items-center justify-center text-[#c5a880]">
                          <Video size={18} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-200 block">Upload Product Video</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">MP4 or WebM format (Max 50MB)</span>
                        </div>
                      </div>
                    </div>
                  )}
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
