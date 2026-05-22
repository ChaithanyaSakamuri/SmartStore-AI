import { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('smartstore_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to parse saved cart:', e);
      return [];
    }
  });

  // Sync cart items to localStorage
  useEffect(() => {
    localStorage.setItem('smartstore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product._id === product._id);
      
      if (existingItemIndex > -1) {
        // Item exists, check stock limit
        const existingItem = prevItems[existingItemIndex];
        const newQty = existingItem.quantity + quantity;
        
        if (newQty > product.stock) {
          // Cap at stock limit
          const updated = [...prevItems];
          updated[existingItemIndex] = {
            ...existingItem,
            quantity: product.stock,
          };
          return updated;
        }
        
        const updated = [...prevItems];
        updated[existingItemIndex] = {
          ...existingItem,
          quantity: newQty,
        };
        return updated;
      } else {
        // New item, check stock limit
        const initialQty = Math.min(quantity, product.stock);
        if (initialQty === 0) return prevItems; // out of stock
        return [...prevItems, { product, quantity: initialQty }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
  }, []);

  // Update quantity
  const updateQuantity = useCallback((productId, quantity) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product._id === productId) {
          const maxStock = item.product.stock || 0;
          const cappedQty = Math.max(1, Math.min(quantity, maxStock));
          return { ...item, quantity: cappedQty };
        }
        return item;
      });
    });
  }, []);

  // Clear all items in cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Compute stats memoized
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const cartDiscountTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const discountPercent = item.product.discount || 0;
      const discountVal = item.product.price * (discountPercent / 100);
      return sum + discountVal * item.quantity;
    }, 0);
  }, [cartItems]);

  const cartFinalTotal = useMemo(() => {
    return cartTotal - cartDiscountTotal;
  }, [cartTotal, cartDiscountTotal]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    cartDiscountTotal,
    cartFinalTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
