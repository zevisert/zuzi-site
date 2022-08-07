import React from 'react';

import { CartContextType } from '@/lib/types';

export const CartContext = React.createContext<CartContextType>({
  cart: [],
  addToCart: () => ({}),
  removeFromCart: () => ({}),
  clearCart: () => ({}),
});
