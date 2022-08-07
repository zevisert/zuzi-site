import * as React from 'react';

import clsxm from '@/lib/clsxm';

import UnstyledLink from '@/components/links/UnstyledLink';

export type NavLinkProps = {
  href: string;
  children: string | number;
  current?: boolean;
  className?: string;
} & React.ComponentPropsWithRef<'a'>;

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ children, current, href, className, ...rest }, ref) => {
    return (
      <UnstyledLink
        ref={ref}
        href={href}
        {...rest}
        className={clsxm('inline-block', 'relative', 'group', className)}
      >
        <div className='absolute top-0 left-0 h-full'>
          <svg height='100%' width='100%' xmlns='http://www.w3.org/2000/svg'>
            <rect
              className={[
                'border-4',
                'border-solid',
                'border-b-primary-500',
                'fill-transparent',
                'stroke-primary-500',
                '[transition:stroke-width_500ms,stroke-dashoffset_500ms,stroke-dasharray_500ms]',
                current
                  ? `[stroke-dasharray:100] [stroke-dashoffset:0] [stroke-width:6px]`
                  : `[stroke-dasharray:0_50] [stroke-dashoffset:-50] [stroke-width:2px] group-hover:[stroke-dasharray:10_90] group-hover:[stroke-dashoffset:-45]`,
              ].join(' ')}
              height='100%'
              width='100%'
              pathLength='100'
            ></rect>
          </svg>
        </div>
        <div className='relative px-5 py-1 font-julius-sans text-black'>{children}</div>
      </UnstyledLink>
    );
  }
);

export default NavLink;
