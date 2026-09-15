import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('timeora_wishlist')) || []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem('timeora_wishlist', JSON.stringify(wishlist)); } catch (e) { console.error(e); }
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      return exists ? prev.filter(item => item.id !== product.id) : [...prev, product];
    });
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);
  const removeFromWishlist = (id) => setWishlist(prev => prev.filter(item => item.id !== id));

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
