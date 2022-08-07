import Stripe from 'stripe';

import { Artwork } from '@/lib/types';

export function setNextHostname(href: string, hostname?: string): URL;
export function setNextHostname(href?: string | null, hostname?: string): URL | null;
export function setNextHostname(
  href?: string | null,
  hostname: string = process.env.NEXT_PUBLIC_HOSTNAME
): URL | null {
  if (!href) return null;
  const url = new URL(href);
  url.hostname = hostname;
  return url;
}

export function toArtwork(product: Stripe.Product): Artwork {
  const tagKeys = Object.keys(product.metadata).filter((key) => key.startsWith('tag.'));

  product.images = product.images.map((img) => setNextHostname(img).href);
  product.url = product.url ? setNextHostname(product.url).href : null;

  // Collect tags into one array
  (product as Artwork).metadata.tags = tagKeys.map((key) => product.metadata[key]);

  // Drop the old tag keys from the processed product
  tagKeys.forEach((key) => delete product.metadata[key]);

  // Convert display_position to a number
  (product as Artwork).metadata.display_position = parseFloat(product.metadata.display_position);

  return product as Artwork;
}

export function toProduct(artwork: Artwork): Stripe.Product {
  const tagmeta = artwork.metadata.tags.reduce(
    (meta, tag, i) => ({ ...meta, [`tag.${i}`]: tag }),
    {}
  );

  artwork.images = artwork.images.map((img) => setNextHostname(img, 'zuzanariha.art').href);
  artwork.url = artwork.url ? setNextHostname(artwork.url, 'zuzanariha.art').href : null;

  // Convert display_position to a number
  (artwork as Stripe.Product).metadata.display_position =
    artwork.metadata.display_position.toFixed(1);

  // Drop the collected tags key
  delete (artwork as Stripe.Product).metadata['tags'];

  // Assign the split tags
  (artwork as Stripe.Product).metadata = { ...(artwork as Stripe.Product).metadata, ...tagmeta };

  return artwork as Stripe.Product;
}
