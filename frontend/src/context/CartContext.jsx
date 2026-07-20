import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (medicine) => {
    if (!medicine || (!medicine.name && !medicine.medicineName)) {
      console.error('Invalid medicine object:', medicine);
      return;
    }
    
    setCartItems(prev => {
      const itemName = medicine.name || medicine.medicineName;
      const existing = prev.find(item => (item.name || item.medicineName) === itemName);
      if (existing) {
        return prev.map(item =>
          (item.name || item.medicineName) === itemName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const removeFromCart = (medicineName) => {
    setCartItems(prev => prev.filter(item => (item.name || item.medicineName) !== medicineName));
  };

  const updateQuantity = (medicineName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineName);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.name || item.medicineName) === medicineName ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.unitPrice || parseFloat((item.price || '0').replace('₹', ''));
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};