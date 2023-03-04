import { Disclosure } from '@headlessui/react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { RiCloseFill, RiMenu4Line } from 'react-icons/ri';

import clsxm from '@/lib/clsxm';
import { CartContext } from '@/lib/contexts';

import ArrowLink from '@/components/links/ArrowLink';
import NavLink from '@/components/links/NavLink';
import UnstyledLink from '@/components/links/UnstyledLink';

import SigSVG from '~/svg/zuzi-sig.svg';

export default function Header() {
  const router = useRouter();
  const { cart } = useContext(CartContext);
  const [_cartLabel, setCartLabel] = useState('Cart');

  useEffect(() => {
    const count = cart.reduce((count, item) => count + item.quantity, 0);
    setCartLabel(count > 0 ? `Cart (${count})` : 'Cart');
  }, [cart]);

  const links = [
    { current: router.pathname == '/', href: '/', label: 'About' },
    { current: router.pathname == '/gallery', href: '/gallery', label: 'Gallery' },
    // { current: router.pathname == '/cart', href: '/cart', label: cartLabel },
    { current: router.pathname == '/tour', href: '/tour', label: '3D Exhibit' },
  ];

  return <NewNav navigation={links} />;
}

export function NewNav({
  navigation,
}: {
  navigation: { label: string; href: string; current: boolean }[];
}) {
  return (
    <Disclosure as='nav' className=''>
      {({ open }) => (
        <>
          <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
            <div className='relative flex h-16 items-center justify-between'>
              <div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
                {/* Mobile menu button*/}
                <Disclosure.Button className='inline-flex items-center justify-center border-2 border-transparent p-2 text-primary-400 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
                  <span className='sr-only'>Open navigation menu</span>
                  {open ? (
                    <RiCloseFill className='block h-6 w-6' aria-hidden='true' />
                  ) : (
                    <RiMenu4Line className='block h-6 w-6' aria-hidden='true' />
                  )}
                </Disclosure.Button>
              </div>
              <div className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
                <div className='flex flex-shrink-0 items-center'>
                  <SigSVG className='block h-8 w-auto' alt='Zuzana Riha' />
                </div>
                <div className='hidden sm:ml-6 sm:block'>
                  <div className='flex space-x-4'>
                    {navigation.map(({ label, href, current }) => (
                      <NavLink key={href} href={href} current={current}>
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              <div className='absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
                <UnstyledLink
                  href='/'
                  className='hidden font-julius-sans hover:text-primary-600 sm:inline-block'
                >
                  Zuzana Riha
                </UnstyledLink>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='sm:hidden'>
            <div className='space-y-1 px-2 pt-2 pb-3'>
              {navigation.map((item) => (
                <Disclosure.Button key={item.label} as={React.Fragment}>
                  <ArrowLink
                    href={item.href}
                    className={clsxm('inline-flex w-full px-3 py-2 text-base font-medium')}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.label}
                  </ArrowLink>
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
