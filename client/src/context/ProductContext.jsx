import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { WATCH_PRODUCTS } from '../data/watches';

const ProductContext = createContext();

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`;

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_products');
      if (saved) { const parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length) return parsed; }
    } catch {}
    return WATCH_PRODUCTS;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        if (res.data?.products?.length) {
          const remote = res.data.products.map(p => ({
            ...p, id: p.id || p._id || p.sku, _id: p._id || p.id || p.sku,
          }));
          setProducts(prev => {
            const ids = new Set(remote.map(r => r.id));
            const localOnly = prev.filter(i => !ids.has(i.id));
            return [...localOnly, ...remote];
          });
        }
      } catch (err) {
        console.log('Using local catalog:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const addProduct = async (data) => {
    const formatted = {
      id: `tm-${Date.now()}`, _id: `tm-${Date.now()}`,
      name: data.name || 'TIMEORA Masterpiece',
      brand: 'TIMEORA', price: Number(data.price) || 1200,
      discountPrice: data.discountPrice || null, category: data.category || 'Chronograph',
      gender: data.gender || 'Unisex', stock: Number(data.stock) >= 0 ? Number(data.stock) : 10,
      sku: data.sku || `TM-${Math.floor(1000 + Math.random() * 9000)}`,
      images: data.images || [data.image || ''], video: data.video || '',
      rating: 5.0, reviewsCount: 1,
    };
    setProducts(prev => [formatted, ...prev]);
    try {
      const token = localStorage.getItem('timeora_token');
      await axios.post(API_URL, formatted, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    } catch (e) { console.warn('Backend sync failed:', e.message); }
    return formatted;
  };

  const updateProduct = async (id, updates) => {
    setProducts(prev => prev.map(item => {
      if (item.id === id || item.sku === id) {
        return { ...item, ...updates, price: updates.price !== undefined ? Number(updates.price) : item.price, stock: updates.stock !== undefined ? Number(updates.stock) : item.stock };
      }
      return item;
    }));
    try {
      const token = localStorage.getItem('timeora_token');
      await axios.put(`${API_URL}/${id}`, updates, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    } catch (e) { console.warn('Backend sync failed:', e.message); }
  };

  const deleteProduct = async (id) => {
    setProducts(prev => prev.filter(item => item.id !== id && item.sku !== id));
  };

  const markOutOfStock = async (id) => updateProduct(id, { stock: 0 });
  const markAvailable = async (id, qty = 10) => updateProduct(id, { stock: Number(qty) > 0 ? Number(qty) : 10 });
  const setProductOffer = async (id, price) => updateProduct(id, { discountPrice: Number(price) });
  const removeProductOffer = async (id) => updateProduct(id, { discountPrice: null });
  const getProductById = (id) => products.find(p => String(p.id) === String(id)) || products[0] || WATCH_PRODUCTS[0];

  return (
    <ProductContext.Provider value={{
      products, loading, addProduct, updateProduct, deleteProduct,
      markOutOfStock, markAvailable, setProductOffer, removeProductOffer,
      getProductById,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
