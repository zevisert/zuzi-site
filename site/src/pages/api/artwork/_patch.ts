import status from 'fastatus';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { z } from 'zod';

import authGuard from '@/lib/api/auth';
import { toArtwork } from '@/lib/to-artwork';
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

// Not default, so this doesn't become /api/artwork/patch instead of PATCH:/api/artwork
export async function patch(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (!(await authGuard(req, res))) {
    return;
  }

  if (req.headers['content-type'] !== 'application/json') {
    res.status(status.HTTP_406_NOT_ACCEPTABLE).setHeader('Accept', 'application/json');
    return false;
  }

  const PatchData = z.object({
    artwork: Artwork.transform((val, ctx) => {
      if (!val.id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['id'],
          message: 'Artwork ID is required',
        });
      }
      return { id: val.id ?? '', ...val };
    }),
    changes: DirtyState,
  });

  const result = PatchData.safeParse(req.body);

  if (!result.success) {
    res.status(status.HTTP_422_UNPROCESSABLE_ENTITY).json({ error: result.error });
    return;
  }

  const { artwork, changes } = result.data;
  const updateParams: Stripe.ProductUpdateParams = {};

  if (changes.title) {
    updateParams.name = changes.title.current;
    updateParams.url = new URL(
      `https://zuzanariha.art/gallery/${toSlug(changes.title.current)}`
    ).href;
  }
  if (changes.active) {
    updateParams.active = changes.active.current;
  }
  if (changes.description) {
    updateParams.description = changes.description.current;
  }
  if (changes.displayPosition) {
    updateParams.metadata = {
      ...updateParams.metadata,
      display_position: changes.displayPosition.current.toFixed(1),
    };
  }
  if (changes.tags) {
    updateParams.metadata = changes.tags.current.reduce(
      (metadata, tag, index) => ({ ...metadata, [`tag.${index}`]: tag }),
      { ...updateParams.metadata }
    );
  }

  let product: Stripe.Product | undefined;
  try {
    product = await stripe.products.update(artwork.id, updateParams);
  } catch (error) {
    res.status(status.HTTP_422_UNPROCESSABLE_ENTITY);
    if (error instanceof Stripe.errors.StripeError) {
      res.json({ error: { message: error.message } });
    } else {
      res.json({ error: { message: 'Unknown error' } });
    }
    return;
  }

  const nullAsUndefined = <T>(arg: T | null): T | undefined => (arg === null ? undefined : arg);

  const updated = product;
  product = undefined;

  // Do we need to create prices along with this product?
  if (changes.prices) {
    const allSettledResult = await Promise.allSettled(
      changes.prices.current.map((element) => {
        const priceParams: Stripe.PriceCreateParams = {
          ...element,
          product: updated.id,
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
    await res.revalidate(`/gallery/${toSlug(updated.name)}`);
  } catch (err) {
    res
      .status(status.HTTP_500_INTERNAL_SERVER_ERROR)
      .json({ error: { message: `Error revalidating: ${err}` } });
  }

  res.status(status.HTTP_200_OK).json({
    object: 'list',
    has_more: false,
    url: '',
    data: [toArtwork(updated)],
  });
}
