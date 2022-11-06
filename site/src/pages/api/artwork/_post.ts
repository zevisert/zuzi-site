import status, { description } from 'fastatus';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { z } from 'zod';

import authGuard from '@/lib/api/auth';
import { toArtwork, toProduct } from '@/lib/to-artwork';
import { toSlug } from '@/lib/to-slug';
import { Artwork, DirtyState } from '@/lib/types';

type ApiResponse =
  | Stripe.ApiList<Artwork>
  | {
      error: { message: string };
    };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
});

// Not default, so this doesn't become /api/artwork/post instead of POST:/api/artwork
export async function post(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (!(await authGuard(req, res))) {
    return res.json({ error: { message: description.HTTP_401_UNAUTHORIZED } });
  }

  if (req.headers['content-type'] !== 'application/json') {
    res.status(status.HTTP_406_NOT_ACCEPTABLE).setHeader('Accept', 'application/json');
    return;
  }

  const PostData = z.object({
    artwork: Artwork.refine((art) => !art.id, {
      message: 'New artwork cannot have an ID number set - use PATCH to update an existing artwork',
    }),
    changes: DirtyState,
  });

  const result = PostData.safeParse(req.body);

  if (!result.success) {
    res.status(status.HTTP_422_UNPROCESSABLE_ENTITY).json({ error: result.error });
    return;
  }

  const { artwork, changes } = result.data;
  const converted = toProduct(artwork);
  const nullAsUndefined = <T>(arg: T | null): T | undefined => (arg === null ? undefined : arg);
  const objectWithIdToString = <T extends string | { id: string } | null>(
    arg: T
  ): string | undefined => (typeof arg === 'object' ? arg?.id : arg);

  const createParams: Stripe.ProductCreateParams = {
    ...converted,
    attributes: nullAsUndefined(converted.attributes),
    caption: nullAsUndefined(converted.caption),
    description: nullAsUndefined(converted.description),
    package_dimensions: nullAsUndefined(converted.package_dimensions),
    shippable: nullAsUndefined(converted.shippable),
    statement_descriptor: nullAsUndefined(converted.statement_descriptor),
    unit_label: nullAsUndefined(converted.unit_label),
    url: nullAsUndefined(converted.url),
    tax_code: objectWithIdToString(converted.tax_code),
  };

  delete (createParams as Stripe.ProductCreateParams & { object?: string })['object'];

  if (changes.title) {
    createParams.name = changes.title.current;
    createParams.url = new URL(
      `https://zuzanariha.art/gallery/${toSlug(changes.title.current)}`
    ).href;
  }
  if (changes.active) {
    createParams.active = changes.active.current;
  }
  if (changes.description) {
    createParams.description = changes.description.current;
  }
  if (changes.displayPosition) {
    createParams.metadata = {
      ...createParams.metadata,
      display_position: changes.displayPosition.current.toFixed(1),
    };
  }
  if (changes.tags) {
    createParams.metadata = changes.tags.current.reduce(
      (metadata, tag, index) => ({ ...metadata, [`tag.${index}`]: tag }),
      { ...createParams.metadata }
    );
  }

  let created: Stripe.Product | undefined;
  try {
    created = await stripe.products.create(createParams);
  } catch (error) {
    res.status(status.HTTP_422_UNPROCESSABLE_ENTITY);
    if (error instanceof Stripe.errors.StripeError) {
      res.json({ error: { message: error.message } });
    } else {
      res.json({ error: { message: 'Unknown error' } });
    }
    return;
  }

  const product = created;
  created = undefined;

  // Do we need to create prices along with this product?
  if (changes.prices) {
    const allSettledResult = await Promise.allSettled(
      changes.prices.current.map((element) => {
        const priceParams: Stripe.PriceCreateParams = {
          ...element,
          product: product.id,
          lookup_key: nullAsUndefined(element.lookup_key),
          nickname: nullAsUndefined(element.nickname),
          tax_behavior: nullAsUndefined(element.tax_behavior),
          tiers_mode: nullAsUndefined(element.tiers_mode),
          transform_quantity: nullAsUndefined(element.transform_quantity),
          unit_amount: nullAsUndefined(element.unit_amount),
          unit_amount_decimal: nullAsUndefined(element.unit_amount_decimal),
          recurring: element.recurring
            ? {
                ...element.recurring,
                aggregate_usage: nullAsUndefined(element.recurring.aggregate_usage),
                trial_period_days: nullAsUndefined(element.recurring.trial_period_days),
              }
            : undefined,
          metadata: Object.fromEntries(
            Object.entries(element.metadata).map(([key, value]) => [
              key,
              value === undefined ? null : value,
            ])
          ),
          tiers: element.tiers
            ? element.tiers.map((tier) => ({
                ...tier,
                flat_amount: nullAsUndefined(tier.flat_amount),
                flat_amount_decimal: nullAsUndefined(tier.flat_amount_decimal),
                unit_amount: nullAsUndefined(tier.unit_amount),
                unit_amount_decimal: nullAsUndefined(tier.unit_amount_decimal),
                up_to: tier.up_to === null ? 'inf' : tier.up_to,
              }))
            : undefined,
        };

        return stripe.prices.create(priceParams);
      })
    );

    if (allSettledResult.some((result) => result.status === 'rejected')) {
      const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
        input.status === 'rejected';

      const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> =>
        input.status === 'fulfilled';

      // Rollback all prices that were created, since we're in error now.
      // Deletion of prices is not supported by Stripe,
      // discussion here: https://github.com/stripe/stripe-python/issues/658.
      allSettledResult
        .filter(isFulfilled)
        .map(async (result) => await stripe.prices.update(result.value.id, { active: false }));

      // Finally, roll back the product creation too.
      await stripe.products.del(product.id);

      res.status(status.HTTP_422_UNPROCESSABLE_ENTITY).json({
        error: {
          message: allSettledResult
            .filter(isRejected)
            .map((result) => result.reason)
            .join(', '),
        },
      });
      return;
    }
  }

  try {
    await res.revalidate(`/gallery`);
  } catch (err) {
    res
      .status(status.HTTP_500_INTERNAL_SERVER_ERROR)
      .json({ error: { message: `Error revalidating: ${err}` } });
  }

  res.status(status.HTTP_201_CREATED).json({
    object: 'list',
    has_more: false,
    url: '',
    data: [toArtwork(product)],
  });
}
