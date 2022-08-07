import * as React from 'react';

import clsxm from '@/lib/clsxm';

type PriceProps = React.ComponentPropsWithoutRef<'div'> & {
  amount: number;
  currency: string;
};

export default function Price({ amount, currency = 'cad', className, ...rest }: PriceProps) {
  return (
    <div className={clsxm('inline-block', className)} {...rest}>
      <sup className='relative -top-1 -z-10 align-baseline'>$</sup>
      <span className='text-xl'>{(amount / 100).toFixed(0)}</span>
      <sup className='relative -top-1 -z-10 align-baseline'>
        {'.' + (amount % 100).toFixed(0).padStart(2, '0')}
      </sup>
      <span className='pl-2 uppercase'>{currency}</span>
    </div>
  );
}
