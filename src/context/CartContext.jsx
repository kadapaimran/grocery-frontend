import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [paymentHistory, setPaymentHistory] = useState(() => {
    const savedHistory = localStorage.getItem("paymentHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  const addToCart = (product) => {
    setCartItems(prev => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const completePayment = (orderData) => {
    if (cartItems.length > 0) {
      const payment = {
        id: Date.now(),
        items: cartItems,
        orderData,
        date: new Date().toLocaleString(),
      };
      setPaymentHistory(prev => [...prev, payment]);
      setCartItems([]);
    }
  };

  // ✅ helper functions
  const getTotalPrice = () =>
    cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  const getCartCount = () =>
    cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        paymentHistory,
        completePayment,
        getTotalPrice,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
