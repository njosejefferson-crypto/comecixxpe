import { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'ecommerce_cart';
const CartContext = createContext(null);

function readStoredCart() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  function persist(nextItems) {
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function addToCart(product) {
    const existing = items.find((item) => item.product.id === product.id);
    if (existing) {
      persist(
        items.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      persist([...items, { product, quantity: 1 }]);
    }
  }

  function increment(productId) {
    persist(
      items.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrement(productId) {
    const next = items
      .map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    persist(next);
  }

  function removeItem(productId) {
    persist(items.filter((item) => item.product.id !== productId));
  }

  function clear() {
    persist([]);
  }

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
    [items],
  );

  const value = {
    items,
    addToCart,
    increment,
    decrement,
    removeItem,
    clear,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
