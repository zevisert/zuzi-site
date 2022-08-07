import { CartContext } from '@/lib/contexts';
import type { QuantifiedCartItem, SingleCartItem } from '@/lib/types';
import { useLocalStorage } from '@/lib/useLocalStorage';

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useLocalStorage<QuantifiedCartItem[]>('cart', []);

  function addToCart(newItem: SingleCartItem) {
    const match = cart.find((item) => item.id === newItem.id);

    if (match === undefined) {
      setCart([...cart, { ...newItem, quantity: 1 }]);
    } else {
      match.quantity += 1;
      setCart([...cart]);
    }
  }

  function removeFromCart(toRemove: SingleCartItem) {
    const match = cart.find((item) => item.id === toRemove.id);

    if (match === undefined) {
      throw new Error('No match found to remove from cart');
    }

    if (match.quantity === 1) {
      cart.splice(cart.indexOf(match), 1);
    }

    if (match.quantity > 1) {
      match.quantity -= 1;
    }

    setCart([...cart]);
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
