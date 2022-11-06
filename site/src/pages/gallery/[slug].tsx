import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType, PreviewData } from 'next';
import { ReactNode } from 'react';
import Stripe from 'stripe';

import { toArtwork } from '@/lib/to-artwork';
import { toSlug } from '@/lib/to-slug';
import { Artwork, SingleCartItem } from '@/lib/types';

import NextImage from '@/components/NextImage';
import PricingTable from '@/components/PricingTable';
import Seo from '@/components/Seo';
import Skeleton from '@/components/Skeleton';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const products = await stripe.products.list({
    limit: 20,
    active: true,
  });

  const paths = products.data.map((product) => ({
    params: {
      slug: toSlug(product.name),
    },
  }));

  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  {
    artwork: Artwork;
    prices: SingleCartItem[];
  },
  {
    slug: string;
  },
  PreviewData
> = async (context) => {
  const { slug } = context.params ?? {};

  if (slug === undefined) {
    throw Error('No slug was provided for look up');
  }

  const products = await stripe.products.list({
    url: `https://zuzanariha.art/gallery/${slug}`,
    active: true,
  });

  if (products.data.length > 1) {
    throw Error(`${slug} has more than one matching product`);
  }

  if (products.data.length === 0) {
    throw Error(`${slug} has no matching products`);
  }

  const artwork = toArtwork(products.data[0]);

  const prices = await stripe.prices.search({
    query: `active:'true' AND product:'${artwork.id}'`,
    // Could expand: ['data.product'], but the type to return is an Artwork,
    // So, I chose to fill it in a .map instead.
  });

  return {
    props: {
      artwork,
      prices: prices.data.map((price) => ({
        ...price,
        product: artwork,
      })),
    },
  };
};

type StaticFallback<T> = { [Property in keyof T]: undefined } | T;

export default function GalleryPage({
  artwork,
  prices,
}: StaticFallback<InferGetStaticPropsType<typeof getStaticProps>>) {
  const Shell = ({
    children,
    prices,
    title = 'Loading...',
    description = 'Loading...',
  }: {
    children: ReactNode;
    prices?: SingleCartItem[];
    title?: string;
    description?: string;
  }) => {
    return (
      <>
        <Seo templateTitle='Gallery' />
        <main>
          <section>
            <figure className='border-b-2 border-primary-500'>
              {children}
              <figcaption className='text-xl'>{title}</figcaption>
            </figure>
            <blockquote>{description}</blockquote>
          </section>
          <PricingTable prices={prices} />
        </main>
      </>
    );
  };

  if (!artwork)
    return (
      <Shell>
        <Skeleton className='aspect-square w-full max-w-full p-5'></Skeleton>
      </Shell>
    );

  const [width, height] = (artwork.metadata.aspect_ratio ?? '1000:1000')
    .split(':')
    .map((el) => parseInt(el));

  return (
    <Shell
      title={artwork.name}
      description={artwork.description ?? 'No description provided'}
      prices={prices}
    >
      {/* Aspect ratio as style since tailwind can't generate classes for it post-build */}
      <div
        className='relative mx-auto max-h-[90vh]'
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <NextImage
          src={new URL(artwork.images[0]).toString()}
          alt={artwork.name}
          unoptimized
          fill
        ></NextImage>
      </div>
    </Shell>
  );
}
