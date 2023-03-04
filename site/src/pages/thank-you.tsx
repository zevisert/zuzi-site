import { Transition } from '@headlessui/react';
import { useContext, useEffect, useState } from 'react';
import { RiBugFill } from 'react-icons/ri';
import Stripe from 'stripe';
import useSWR from 'swr';

import { CartContext } from '@/lib/contexts';

import NextImage from '@/components/NextImage';
import Price from '@/components/Price';
import Seo from '@/components/Seo';
import Skeleton from '@/components/Skeleton';

export function getServerSideProps() {
  return {
    // Shop is disabled for now - redirect to home page.
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}

export default function ThankYou() {
  const { clearCart } = useContext(CartContext);
  const [purchased, setPurchased] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [clearedCart, setClearedCart] = useState(false);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get('result') == 'success' && !clearedCart) {
      setClearedCart(true);
      clearCart();
    }
    setPurchased(query.getAll('items'));
  }, [clearCart, clearedCart]);

  function Counter(array: string[]): Record<string, number> {
    const count: Record<string, number> = {};
    array.forEach((val) => (count[val] = (count[val] || 0) + 1));
    return count;
  }

  useEffect(() => {
    setQuantities(Counter(purchased));
  }, [purchased]);

  return (
    <>
      <Seo templateTitle='Order complete'></Seo>
      <main className='container'>
        <section className='flex flex-col pt-5'>
          <div className='flex flex-col gap-5 pb-5 text-center'>
            <h1>Thank you for your order</h1>
            <span>Here&apos;s what you purchased</span>
            <hr></hr>
          </div>

          <div className='flex flex-col gap-4'>
            {Object.entries(quantities).map(([item, quantity]) => (
              <PurchasedItem key={item} id={item} quantity={quantity}></PurchasedItem>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function PurchasedItem({ id, quantity }: { id: string; quantity: number }) {
  const { data: price, error: error } = useSWR<
    Stripe.Response<Stripe.Price & { product: Stripe.Product }>
  >(
    () => id && `/api/pricing/${id}`,
    async (url: string) => {
      const res = await fetch(url);
      const data = await res.json();

      if (res.status !== 200) {
        throw new Error(data.message);
      }

      return data;
    }
  );

  if (error)
    return (
      <>
        <Transition
          appear={true}
          show={true}
          enter='transition duration-150'
          enterFrom='opacity-0 translate-y-6'
          enterTo='opacity-100'
          leave='transition duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0 translate-y-6'
        >
          <div className='grid grid-cols-4 bg-primary-100 p-8'>
            <Skeleton className='relative m-4 h-48 border-2 border-primary-200 bg-primary-50'></Skeleton>
            <div className='col-span-2'>
              <h2 className='font-julius-sans'>Product Missing</h2>
              <blockquote>This error is being reported right now!</blockquote>
              <hr className='my-3'></hr>
              <div className='grid grid-cols-3'>
                <span className='col-start-1'>Price ID: </span>
                <span className='col-span-2'>{id}</span>
                <span className='col-start-1'>Time: </span>
                <span className='col-span-2'>{new Date().toISOString()}</span>
              </div>
            </div>
            <div>
              <RiBugFill></RiBugFill>
            </div>
          </div>
        </Transition>
      </>
    );

  if (!price)
    return (
      <>
        <Transition
          appear={true}
          show={true}
          enter='transition duration-150'
          enterFrom='opacity-0 translate-y-6'
          enterTo='opacity-100'
          leave='transition duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0 translate-y-6'
        >
          <div className='grid grid-cols-4 bg-primary-100 p-8'>
            <Skeleton className='relative m-4 h-48 border-2 border-primary-200 bg-primary-50'></Skeleton>
            <div className='col-span-2'>
              <h2 className='font-julius-sans'>...</h2>
              <blockquote>...</blockquote>
              <hr className='my-3'></hr>
              <div className='grid grid-cols-3'>
                <span className='col-start-1'>Medium: </span>
                <span className='col-span-2'>...</span>

                <span className='col-start-1'>Size: </span>
                <span className='col-span-2'>...</span>

                <span className='col-start-1'>Quantity: </span>
                <span className='col-span-2'>{quantity}</span>
              </div>
            </div>
            <Price className='text-right' amount={0} currency='CAD'></Price>
          </div>
        </Transition>
      </>
    );

  return (
    <>
      <Transition
        appear={true}
        show={true}
        enter='transition duration-150'
        enterFrom='opacity-0 translate-y-6'
        enterTo='opacity-100'
        leave='transition duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0 translate-y-6'
      >
        <div className='grid grid-cols-4 bg-primary-100 p-8'>
          <div className='relative m-4 h-48 border-2 border-primary-200 bg-primary-50 '>
            <NextImage
              className='object-contain'
              src={price.product.images[0]}
              alt={price.product.name}
              fill
              unoptimized
            ></NextImage>
          </div>
          <div className='col-span-2'>
            <h2 className='font-julius-sans'>{price.product.name}</h2>
            <blockquote>{price.product.description}</blockquote>
            <hr className='my-3'></hr>
            <div className='grid grid-cols-3'>
              <span className='col-start-1'>Medium: </span>
              <span className='col-span-2'>{price.metadata.medium}</span>

              <span className='col-start-1'>Size: </span>
              <span className='col-span-2'>
                {price.metadata.width}
                {price.metadata.unit} wide, {price.metadata.height}
                {price.metadata.unit} tall
              </span>

              <span className='col-start-1'>Quantity: </span>
              <span className='col-span-2'>{quantity}</span>
            </div>
          </div>
          <Price
            className='text-right'
            amount={price.unit_amount ?? 0}
            currency={price.currency}
          ></Price>
        </div>
      </Transition>
    </>
  );
}
