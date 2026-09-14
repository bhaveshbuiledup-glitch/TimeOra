import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('timeora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('timeora_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && (!selectedColor || item.selectedColor === selectedColor)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.discountPrice || product.price,
          originalPrice: product.price,
          image: product.images?.[0] || product.image,
          selectedColor: selectedColor || product.colors?.[0] || 'Standard',
          quantity,
          sku: product.sku
        }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId, selectedColor) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === itemId && item.selectedColor === selectedColor)
    ));
  };

  const updateQuantity = (itemId, selectedColor, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, selectedColor);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId && item.selectedColor === selectedColor) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItemsCount,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
