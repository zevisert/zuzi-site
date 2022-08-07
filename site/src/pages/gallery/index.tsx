import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import Stripe from 'stripe';

import { toArtwork } from '@/lib/to-artwork';
import { toSlug } from '@/lib/to-slug';
import type { Artwork } from '@/lib/types';

import Button from '@/components/buttons/Button';
import GalleryItem from '@/components/GalleryItem';
import Seo from '@/components/Seo';
import Skeleton from '@/components/Skeleton';

type GalleryStaticProps = {
  tags: string[];
  artwork: Artwork[];
};

export const getStaticProps: GetStaticProps<GalleryStaticProps> = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
  });

  const products = await stripe.products.list({
    limit: 100,
    active: true,
  });

  const tags = new Set<string>();

  const artwork = products.data.map((product) => toArtwork(product));
  artwork.forEach((artwork) => artwork.metadata.tags.forEach((tag) => tags.add(tag)));

  return {
    props: {
      tags: Array.from(tags.keys()),
      artwork,
    },
  };
};

export default function Gallery({ artwork, tags }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [displayed, setDisplayed] = useState<Artwork[]>([]);
  const [radio, setRadio] = useState<string | null>(null);
  const [ascending, setAscending] = useState(false);

  const toggleAscending = () => setAscending(!ascending);

  // Update which items to show
  useEffect(() => {
    const sorted = Array.from(artwork).sort((a, b) =>
      parseInt(a.metadata.posted ?? '') * 1000 > parseInt(b.metadata.posted ?? '') * 1000 ? 1 : -1
    );
    if (ascending) sorted.reverse();
    if (radio !== null)
      setDisplayed(sorted.filter((product) => product.metadata.tags.includes(radio)));
    else setDisplayed(sorted);
  }, [artwork, radio, ascending]);

  const GalleryShell = ({ children }: { children: ReactNode }) => (
    <>
      <Seo templateTitle='Gallery' />
      <main>
        <nav className='flex max-w-full flex-row flex-wrap justify-around gap-2 p-2'>
          <Button
            variant='outline'
            onClick={toggleAscending}
            title={`Show ${ascending ? 'oldest' : 'newest'} first`}
          >
            {ascending ? '↑' : '↓'}
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={tag === radio ? 'outline' : 'ghost'}
              onClick={() => setRadio(radio === tag ? null : tag)}
              title={radio === tag ? 'Show all' : `Filter by ${tag}`}
            >
              {tag}
            </Button>
          ))}
        </nav>
        <section id='gallery' className='grid w-full grid-cols-1 bg-white lg:grid-cols-3'>
          {children}
        </section>
      </main>
    </>
  );

  if (!artwork)
    return (
      <>
        <GalleryShell>
          {Array.from(Array(20).keys()).map((id) => (
            <Skeleton key={id} className='max-h-64 min-h-[16rem]'></Skeleton>
          ))}
        </GalleryShell>
      </>
    );

  return (
    <GalleryShell>
      {displayed.map((product) => (
        <GalleryItem
          onClick={() => router.push(`/gallery/${toSlug(product.name)}`)}
          shown={true}
          key={product.id}
          product={product}
        ></GalleryItem>
      ))}
    </GalleryShell>
  );
}
