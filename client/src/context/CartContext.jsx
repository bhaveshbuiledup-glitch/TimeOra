import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('timeora_cart')) || [];
    } catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastCheckoutOrder, setLastCheckoutOrder] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('timeora_cart', JSON.stringify(cartItems)); } catch (e) { console.error(e); }
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item =>
        item.id === product.id && (!selectedColor || item.selectedColor === selectedColor)
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, {
        id: product.id, name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        image: product.images?.[0] || product.image,
        selectedColor: selectedColor || product.colors?.[0] || 'Standard',
        quantity, sku: product.sku,
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId, selectedColor) => {
    setCartItems(prev => prev.filter(item =>
      !(item.id === itemId && item.selectedColor === selectedColor)
    ));
  };

  const updateQuantity = (itemId, selectedColor, quantity) => {
    if (quantity <= 0) { removeFromCart(itemId, selectedColor); return; }
    setCartItems(prev => prev.map(item =>
      item.id === itemId && item.selectedColor === selectedColor
        ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const totalItemsCount = cartItems.reduce((a, b) => a + b.quantity, 0);
  const subtotal = cartItems.reduce((a, b) => a + (b.price * b.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems, isCartOpen, setIsCartOpen,
      addToCart, removeFromCart, updateQuantity, clearCart,
      totalItemsCount, subtotal, lastCheckoutOrder, setLastCheckoutOrder,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
