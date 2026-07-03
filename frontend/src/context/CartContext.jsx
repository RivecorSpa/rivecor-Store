import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";

const CartContext = createContext(null);

const initialItems =
  JSON.parse(
    localStorage.getItem("rivecor_cart")
  ) || [];

export function CartProvider({ children }) {
  const [items, setItems] = useState(initialItems)
  useEffect(() => {
  localStorage.setItem(
    "rivecor_cart",
    JSON.stringify(items)
  );
}, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const quantityToAdd = product.quantity || 1;
      const exists = prev.find((item) => item.id === product.id);

      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }

      return [...prev, { ...product, quantity: quantityToAdd }];
    });
  };

  const updateQuantity = (id, action) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity:
                action === "plus"
                  ? item.quantity + 1
                  : Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
  setItems([]);

  localStorage.removeItem(
    "rivecor_cart"
  );
};

  const cartCount = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}