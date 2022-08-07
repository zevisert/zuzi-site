import { useRouter } from 'next/router';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';

import { CartContext } from '@/lib/contexts';

import NavLink from '@/components/links/NavLink';
import UnstyledLink from '@/components/links/UnstyledLink';

export default function Header() {
  const router = useRouter();
  const { cart } = useContext(CartContext);
  const [cartLabel, setCartLabel] = useState('Cart');

  useEffect(() => {
    const count = cart.reduce((count, item) => count + item.quantity, 0);
    setCartLabel(count > 0 ? `Cart (${count})` : 'Cart');
  }, [cart]);

  const links = [
    { href: '/', label: 'About' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/cart', label: cartLabel },
    { href: '/tour', label: '3D Exhibit' },
  ];

  return (
    <header className='sticky top-0 z-50 bg-white'>
      <div className='layout flex h-14 items-center justify-between'>
        <nav>
          <ul className='flex items-center justify-between space-x-4'>
            {links.map(({ href, label }) => (
              <li key={`${href}${label}`}>
                <NavLink href={href} current={router.pathname == href}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <UnstyledLink href='/' className='font-julius-sans hover:text-gray-600'>
          Zuzana Riha
        </UnstyledLink>
      </div>
    </header>
  );
}
