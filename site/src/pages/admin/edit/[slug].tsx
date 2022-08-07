import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Stripe from 'stripe';
import z from 'zod';

import { toArtwork } from '@/lib/to-artwork';
import { toSlug } from '@/lib/to-slug';
import { Artwork, DirtyState, Price } from '@/lib/types';

import ArtworkEditor from '@/components/admin/ArtworkEditor';

type AdminEditServerSideProps = {
  item: Artwork;
  existingTags: string[];
  prices: Price[];
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

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

  const { slug } = context.params ?? {};

  if (slug === undefined) {
    throw Error('No slug was provided for look up');
  }

  const products = await stripe.products.list({
    url: `https://zuzanariha.art/gallery/${slug}`,
  });

  if (products.data.length > 1) {
    throw Error(`${slug} has more than one matching product`);
  }

  if (products.data.length === 0) {
    throw Error(`${slug} has no matching products`);
  }

  const item = toArtwork(products.data[0]);

  const prices = await stripe.prices.search({
    query: `active:'true' AND product:'${item.id}'`,
    // Could expand: ['data.product'], but the type to return is an Artwork,
    // So, I chose to fill it in a .map instead.
  });

  const allProducts = await stripe.products.list({
    limit: 1000,
  });

  return {
    props: {
      session,
      item,
      existingTags: Array.from(
        allProducts.data
          .map((product) => toArtwork(product))
          .reduce(
            (tags, artwork) => new Set([...artwork.metadata.tags, ...tags]),
            new Set<string>()
          )
      ),
      prices: prices.data.map((price) => ({
        ...price,
        product: item,
      })),
    },
  };
};

export default function EditPage({
  item,
  prices: initialPrices,
  existingTags,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [image, setImage] = useState<File | URL | null>(new URL(item.images[0]));
  const [title, setTitle] = useState(item.name);
  const [active, setActive] = useState(item.active);
  const [description, setDescription] = useState(item.description ?? '');
  const [displayPosition, setDisplayPosition] = useState<number>(item.metadata.display_position);
  const [tags, setTags] = useState([...item.metadata.tags]);
  const [prices, setPrices] = useState([...initialPrices]);

  const router = useRouter();
  const [_isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const refreshData = (newUrl: string | null = null) => {
    router.replace(newUrl ?? router.asPath);
    setIsRefreshing(true);
  };

  useEffect(() => {
    setIsRefreshing(false);
  }, [item]);

  async function saveState(data: { artwork: Artwork; changes: Partial<DirtyState> }) {
    const res = await fetch('/api/artwork', {
      method: 'PATCH',
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

      refreshData(`/admin/edit/${toSlug(result.data.data[0].name)}`);
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
      tags={tags}
      setTags={setTags}
      existingTags={existingTags}
      initialPrices={initialPrices}
      prices={prices}
      setPrices={setPrices}
      onSave={saveState}
    ></ArtworkEditor>
  );
}
