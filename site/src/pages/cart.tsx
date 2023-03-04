import { Transition } from '@headlessui/react';
import { FormEvent, MouseEventHandler, ReactNode, useContext, useEffect, useState } from 'react';

import { CartContext } from '@/lib/contexts';
import { QuantifiedCartItem } from '@/lib/types';

import Button from '@/components/buttons/Button';
import ArrowLink from '@/components/links/ArrowLink';
import NextImage from '@/components/NextImage';
import Price from '@/components/Price';
import Seo from '@/components/Seo';

export function getStaticProps() {
  return {
    // Shop is disabled for now - redirect to home page.
    redirect: {
      destination: '/gallery',
      permanent: false,
    },
  };
}

export default function CartPage() {
  const { cart, removeFromCart } = useContext(CartContext);
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();

    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line_items: cart.map(({ id: price, quantity }) => ({ price, quantity })),
      }),
    });

    const body = await response.json();
    if (body.redirected) {
      window.location.href = body.url;
    }
  };

  const CartShell = ({
    children,
    showCheckout,
  }: {
    children: ReactNode;
    showCheckout: boolean;
  }) => (
    <>
      <Seo templateTitle='Cart' />
      <main className='container'>
        <div className='flex flex-col gap-4'>{children}</div>
        {showCheckout ? (
          <form onSubmit={handleSubmit} className='my-8 mx-auto flex w-full justify-center'>
            <Button
              variant='primary'
              type='submit'
              role='link'
              className='inline-block w-1/2 max-w-sm'
            >
              Proceed to checkout
            </Button>
          </form>
        ) : (
          <></>
        )}
      </main>
    </>
  );

  if (!hasMounted) return <CartShell showCheckout={false}>{}</CartShell>;

  if (cart.length == 0)
    return (
      <>
        <CartShell showCheckout={false}>
          <div className='flex h-[80vh] flex-col items-center justify-around'>
            <span>
              There are zero items in your online cart. Browse through the{' '}
              <ArrowLink direction='right' href='/gallery'>
                Gallery
              </ArrowLink>{' '}
              to see if you like anything I&apos;ve made!
            </span>
          </div>
        </CartShell>
      </>
    );

  return (
    <>
      <CartShell showCheckout={true}>
        {cart.map((item) => (
          <ItemDisplay key={item.id} item={item} onRemove={() => removeFromCart(item)} />
        ))}
      </CartShell>
    </>
  );
}

function ItemDisplay({
  item,
  onRemove,
}: {
  item: QuantifiedCartItem;
  onRemove: MouseEventHandler<HTMLButtonElement>;
}) {
  const [shown, setShown] = useState(true);
  const delayRemove = () => {
    if (item.quantity <= 1) {
      setShown(false);
    }
    setTimeout(onRemove, 150);
  };

  return (
    <>
      <Transition
        appear={true}
        show={shown}
        enter='transition duration-150'
        enterFrom='opacity-0 translate-y-6'
        enterTo='opacity-100'
        leave='transition duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0 translate-y-6'
      >
        <div className='grid grid-cols-4 bg-primary-100 p-8'>
          <div className='relative m-4 h-48 border-2 border-primary-200 bg-primary-50'>
            <NextImage
              className='object-contain'
              src={item.product.images[0]}
              alt={item.product.name}
              fill
              unoptimized
            ></NextImage>
          </div>
          <div className='col-span-2'>
            <h2 className='font-julius-sans'>{item.product.name}</h2>
            <blockquote>{item.product.description}</blockquote>
            <hr className='my-3'></hr>
            <div className='grid grid-cols-3'>
              <span className='col-start-1'>Medium: </span>
              <span className='col-span-2'>{item.metadata.medium}</span>

              <span className='col-start-1'>Size: </span>
              <span className='col-span-2'>
                {item.metadata.width}
                {item.metadata.unit} wide, {item.metadata.height}
                {item.metadata.unit} tall
              </span>

              <span className='col-start-1'>Quantity: </span>
              <span className='col-span-2'>{item.quantity}</span>
            </div>
          </div>
          <div className='flex flex-col justify-between'>
            <Price
              className='text-right'
              amount={item.unit_amount ?? 0}
              currency={item.currency}
            ></Price>
            <Button className='inline-block' variant='outline' onClick={delayRemove}>
              {item.quantity > 1 ? 'Remove one' : 'Remove from cart'}
            </Button>
          </div>
        </div>
      </Transition>
    </>
  );
}
