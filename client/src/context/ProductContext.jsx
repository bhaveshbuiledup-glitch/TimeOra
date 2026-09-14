import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { WATCH_PRODUCTS } from '../data/watches';

const ProductContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`;

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return WATCH_PRODUCTS;
    } catch {
      return WATCH_PRODUCTS;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timeora_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to persist products to localStorage:', e);
    }
  }, [products]);

  // Attempt sync with backend on mount
  useEffect(() => {
    const fetchRemoteProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        if (res.data?.products && Array.isArray(res.data.products) && res.data.products.length > 0) {
          // Merge remote products if valid
          const remoteList = res.data.products.map(p => ({
            ...p,
            id: p.id || p._id || p.sku
          }));
          setProducts(prev => {
            // Keep local creations if they exist
            const existingIds = new Set(remoteList.map(r => r.id));
            const localOnly = prev.filter(item => !existingIds.has(item.id));
            return [...localOnly, ...remoteList];
          });
        }
      } catch (err) {
        console.log('Using local catalog state:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRemoteProducts();
  }, []);

  // Add new product
  const addProduct = async (productData) => {
    const newId = `tm-${Date.now()}`;
    const formatted = {
      id: newId,
      _id: newId,
      name: productData.name?.trim() || 'TIMEORA Masterpiece',
      brand: 'TIMEORA',
      tagline: productData.tagline?.trim() || 'Precision Handcrafted Horology',
      description: productData.description?.trim() || 'Handcrafted luxury timepiece.',
      price: Number(productData.price) || 1200,
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
      category: productData.category || 'Chronograph',
      gender: productData.gender || 'Unisex',
      stock: Number(productData.stock) >= 0 ? Number(productData.stock) : 10,
      sku: productData.sku?.trim() || `TM-${Math.floor(1000 + Math.random() * 9000)}`,
      images: Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images
        : [productData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200'],
      video: productData.video || '',
      colors: productData.colors && productData.colors.length > 0 
        ? productData.colors 
        : ['Obsidian Black', 'Champagne Gold'],
      strapMaterial: productData.strapMaterial || 'Italian Hand-Stitched Leather',
      caseMaterial: productData.caseMaterial || '316L Surgical Stainless Steel',
      dialColor: productData.dialColor || 'Sunburst Black',
      movement: productData.movement || 'Calibre TM Automatic (28,800 vph)',
      waterResistance: productData.waterResistance || '100M / 10 ATM',
      warranty: '5-Year International Manufacturer Warranty',
      featured: !!productData.featured,
      bestSeller: !!productData.bestSeller,
      newArrival: true,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [formatted, ...prev]);

    // Background sync to backend
    try {
      const token = localStorage.getItem('timeora_token');
      await axios.post(API_URL, formatted, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.warn('Backend product creation synced locally:', e.message);
    }

    return formatted;
  };

  // Update existing product
  const updateProduct = async (id, updatedFields) => {
    let updatedItem = null;

    setProducts(prev => prev.map(item => {
      if (item.id === id || item._id === id || item.sku === id) {
        updatedItem = {
          ...item,
          ...updatedFields,
          // Ensure numbers are properly parsed
          price: updatedFields.price !== undefined ? Number(updatedFields.price) : item.price,
          stock: updatedFields.stock !== undefined ? Number(updatedFields.stock) : item.stock,
          discountPrice: updatedFields.discountPrice !== undefined 
            ? (updatedFields.discountPrice ? Number(updatedFields.discountPrice) : null)
            : item.discountPrice
        };
        return updatedItem;
      }
      return item;
    }));

    // Background sync to backend
    try {
      const token = localStorage.getItem('timeora_token');
      await axios.put(`${API_URL}/${id}`, updatedFields, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.warn('Backend product update synced locally:', e.message);
    }

    return updatedItem;
  };

  // Delete product
  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(item => item.id !== id && item._id !== id && item.sku !== id));

    try {
      const token = localStorage.getItem('timeora_token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) {
      console.warn('Backend product deletion synced locally:', e.message);
    }
  };

  // Mark Out of Stock (sets stock to 0)
  const markOutOfStock = async (id) => {
    return await updateProduct(id, { stock: 0 });
  };

  // Mark Available (restores stock)
  const markAvailable = async (id, quantity = 10) => {
    return await updateProduct(id, { stock: Number(quantity) > 0 ? Number(quantity) : 10 });
  };

  // Set / Enable Discount Offer
  const setProductOffer = async (id, offerPrice) => {
    return await updateProduct(id, { discountPrice: Number(offerPrice) });
  };

  // Remove / Disable Discount Offer
  const removeProductOffer = async (id) => {
    return await updateProduct(id, { discountPrice: null });
  };

  // Lookup product
  const getProductById = (id) => {
    return products.find(p => p.id === id || p._id === id || p.sku === id) || products[0];
  };

  // Reset to original brand catalog
  const resetCatalog = () => {
    setProducts(WATCH_PRODUCTS);
    localStorage.removeItem('timeora_products');
  };

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      markOutOfStock,
      markAvailable,
      setProductOffer,
      removeProductOffer,
      getProductById,
      resetCatalog
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
