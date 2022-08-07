import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import Stripe from 'stripe';
import z from 'zod';

import { toArtwork } from '@/lib/to-artwork';
import { toSlug } from '@/lib/to-slug';
import { Artwork, DirtyState, Price } from '@/lib/types';

import ArtworkEditor from '@/components/admin/ArtworkEditor';

type AdminEditServerSideProps = {
  knownTags: string[];
};

export const getServerSideProps: GetServerSideProps<AdminEditServerSideProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin?callbackUrl=${context.resolvedUrl}`,
        permanent: false,
      },
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27',
  });

  const allProducts = await stripe.products.list({
    limit: 1000,
  });

  const allArtworks = allProducts.data.map((product) => toArtwork(product));
  return {
    props: {
      session,
      knownTags: Array.from(
        allArtworks.reduce(
          (tags, artwork) => new Set([...artwork.metadata.tags, ...tags]),
          new Set<string>()
        )
      ),
    },
  };
};

export default function NewArtworkPage({
  knownTags,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [image, setImage] = useState<File | URL | null>(null);
  const [title, setTitle] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [displayPosition, setDisplayPosition] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [item, _setItem] = useState<Artwork>(
    Artwork.parse({
      active: true,
      description: '',
      name: '',
      type: 'good',
    })
  );

  const router = useRouter();

  async function saveState(data: { artwork: Artwork; changes: Partial<DirtyState> }) {
    const res = await fetch('/api/artwork', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.status < 300) {
      const result = z
        .object({
          object: z.literal('list'),
          has_more: z.boolean(),
          url: z.string(),
          data: Artwork.array(),
        })
        .safeParse(await res.json());

      if (!result.success) {
        throw Error(result.error.message);
      }

      router.push(`/admin/edit/${toSlug(result.data.data[0].name)}`);
    }
  }

  return (
    <ArtworkEditor
      item={item}
      displayPosition={displayPosition}
      setDisplayPosition={setDisplayPosition}
      image={image}
      setImage={setImage}
      title={title}
      setTitle={setTitle}
      description={description}
      setDescription={setDescription}
      active={active}
      setActive={setActive}
      tags={selectedTags}
      setTags={setSelectedTags}
      prices={prices}
      initialPrices={[]}
      setPrices={setPrices}
      existingTags={knownTags}
      onSave={saveState}
    ></ArtworkEditor>
  );
}
