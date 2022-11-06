import { Transition } from '@headlessui/react';

import clsxm from '@/lib/clsxm';
import type { Artwork } from '@/lib/types';

import NextImage from '@/components/NextImage';

type GalleyItemProps = {
  product: Artwork;
  shown: boolean;
} & Record<string, unknown>;

export default function GalleryItem({ product, shown, ...rest }: GalleyItemProps) {
  return (
    <Transition
      show={shown}
      enter='transition duration-150'
      enterFrom='opacity-0 translate-y-6'
      enterTo='opacity-100'
      leave='transition duration-150'
      leaveFrom='opacity-100'
      leaveTo='opacity-0 translate-y-6'
    >
      <figure
        className={clsxm(
          'group',
          'relative',
          'z-10',
          'max-h-64',
          'min-h-[16rem]',
          'overflow-y-clip',
          'outline',
          'outline-0',
          'outline-offset-[-4px]',
          'outline-primary-500',
          'transition-[outline-width]',
          'hover:outline-4'
        )}
        {...rest}
      >
        <div className='relative -z-10 max-h-64 min-h-[16rem] '>
          <NextImage
            className='object-cover'
            style={{
              objectPosition: `center ${product.metadata.display_position ?? '50'}%`,
            }}
            src={product.images[0]}
            alt={product.name}
            fill
            unoptimized
          ></NextImage>
        </div>
        {/* Caption background colour from globals css */}
        <figcaption className='absolute bottom-0 h-8 w-full px-2 align-middle text-white transition-transform group-hover:translate-y-8'>
          {product.name}
        </figcaption>
      </figure>
    </Transition>
  );
}
