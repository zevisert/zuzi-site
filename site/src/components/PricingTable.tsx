import { ReactNode, useContext, useEffect, useState } from 'react';
import { RiCheckFill } from 'react-icons/ri';

import { CartContext } from '@/lib/contexts';
import { SingleCartItem } from '@/lib/types';

import Button from '@/components/buttons/Button';
import Price from '@/components/Price';

export default function PricingTable({ prices }: { prices: SingleCartItem[] | undefined }) {
  const Shell = ({ children }: { children: ReactNode }) => (
    <>
      <section className='flex w-full py-20'>
        <div className='flex w-full flex-col'>{children}</div>
      </section>
    </>
  );

  if (!prices) return <Shell>{}</Shell>;

  return (
    <Shell>
      {prices.map((item) => (
        <PricingEntry key={item.id} item={item}></PricingEntry>
      ))}
    </Shell>
  );
}

function PricingEntry({ item }: { item: SingleCartItem }) {
  const {
    id,
    unit_amount,
    currency,
    metadata: { width, height, unit, medium },
  } = item;

  const { cart, addToCart } = useContext(CartContext);

  const [isLoading, setLoading] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  function debounceAddToCart(pricing: SingleCartItem) {
    setLoading(true);
    setShowCheck(true);
    addToCart(pricing);
  }

  useEffect(() => {
    // Minimum time in the loading state to help debounce
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowCheck(false), 1000);
    }, 200);
  }, [cart]);

  return (
    <div
      id={id}
      className='border-primary-300-400 group grid grid-cols-6 grid-rows-2 border-b-2 p-4 last:border-b-0'
    >
      <span className='col-span-3'>{medium}</span>
      <span className='row-start-2 italic'>
        {width}
        {unit} x {height}
        {unit}
      </span>
      <Price
        amount={unit_amount ?? 0}
        currency={currency}
        className='col-start-5 row-span-2 flex flex-row items-center justify-end pr-2'
      ></Price>
      <Button
        variant='outline'
        className='col-start-6 row-span-2 block w-full hover:!bg-primary-100 group-hover:bg-primary-50'
        onClick={() => debounceAddToCart(item)}
        isLoading={isLoading}
      >
        Add to cart {showCheck ? <RiCheckFill className='inline-block'></RiCheckFill> : ''}
      </Button>
    </div>
  );
}
