import { Dispatch } from 'react';
import { z } from 'zod';
export const EPHEMERAL_ID = 'ephemeral';

export const TaxCode = z.object({
  /**
   * Unique identifier for the object.
   */
  id: z.string(),

  /**
   * String representing the object's type. Objects of the same type share the same value.
   */
  object: z.literal('tax_code'),

  /**
   * A detailed description of which types of products the tax code represents.
   */
  description: z.string(),

  /**
   * A short name for the tax code.
   */
  name: z.string(),
});

export type TaxCode = z.infer<typeof TaxCode>;

export const PackageDimensions = z.object({
  /**
   * Height, in inches.
   */
  height: z.number(),

  /**
   * Length, in inches.
   */
  length: z.number(),

  /**
   * Weight, in ounces.
   */
  weight: z.number(),

  /**
   * Width, in inches.
   */
  width: z.number(),
});

export type PackageDimensions = z.infer<typeof PackageDimensions>;

export const Product = z.object({
  /**
   * Unique identifier for the object.
   */
  id: z.string().optional(),

  /**
   * String representing the object's type. Objects of the same type share the same value.
   */
  object: z.literal('product').default('product'),

  /**
   * Whether the product is currently available for purchase.
   */
  active: z.boolean(),

  /**
   * Time at which the object was created. Measured in seconds since the Unix epoch.
   */
  created: z.number().optional(),

  /**
   * Time at which the object was last updated. Measured in seconds since the Unix epoch.
   */
  updated: z.number().optional(),

  /**
   * A list of up to 5 attributes that each SKU can provide values for
   * (e.g., `["color", "size"]`).
   */
  attributes: z
    .array(z.string())
    .nullish()
    .default(() => []),

  /**
   * A short one-line description of the product, meant to be displayable to the customer.
   * Only applicable to products of `type=good`.
   */
  caption: z.string().nullish(),

  /**
   * An array of connect application identifiers that cannot purchase this product.
   * Only applicable to products of `type=good`.
   */
  deactivate_on: z.array(z.string()).optional(),

  /**
   * The product's description, meant to be displayable to the customer. Use this field to
   * optionally store a long form explanation of the product being sold for your own
   * rendering purposes.
   */
  description: z.string().nullish(),

  /**
   * A list of up to 8 URLs of images for this product, meant to be displayable to the customer.
   */
  images: z.array(z.string()).default(() => []),

  /**
   * Has the value `true` if the object exists in live mode or the value `false` if the object
   * exists in test mode.
   */
  livemode: z.boolean().optional(),

  /**
   * Set of [key-value pairs](https://stripe.com/docs/api/metadata) that you can attach to an object.
   * This can be useful for storing additional information about the object in a structured format.
   */
  metadata: z.record(z.string(), z.string().optional()).default(() => ({})),

  /**
   * The product's name, meant to be displayable to the customer.
   */
  name: z.string(),

  /**
   * The dimensions of this product for shipping purposes.
   */
  package_dimensions: PackageDimensions.nullish(),

  /**
   * Whether this product is shipped (i.e., physical goods).
   */
  shippable: z.boolean().nullish(),

  /**
   * Extra information about a product which will appear on your customer's credit card statement.
   * In the case that multiple products are billed at once, the first statement descriptor will be used.
   */
  statement_descriptor: z.string().nullish(),

  /**
   * A [tax code](https://stripe.com/docs/tax/tax-codes) ID.
   */
  tax_code: z.union([z.string(), TaxCode]).nullish(),

  /**
   * The type of the product. The product is either of type `good`, which is eligible for use with
   * Orders and SKUs, or `service`, which is eligible for use with Subscriptions and Plans.
   */
  type: z.enum(['good', 'service']),

  /**
   * A label that represents units of this product in Stripe and on customers' receipts and invoices.
   * When set, this will be included in associated invoice line item descriptions.
   */
  unit_label: z.string().nullish(),

  /**
   * A URL of a publicly-accessible webpage for this product.
   */
  url: z.string().nullish(),

  deleted: z.void(),
});

export type Product = z.infer<typeof Product>;

export const Artwork = Product.merge(
  z.object({
    metadata: z
      .object({
        tags: z.array(z.string()).default(() => []),
        display_position: z.number().min(0).max(100).default(0),
        aspect_ratio: z
          .string()
          .regex(/^\d+:\d+$/)
          .default('1:1'),
      })
      .catchall(z.string())
      .default(() => ({})),
  })
);

export type Artwork = z.infer<typeof Artwork>;

export const DeletedProduct = z.object({
  /**
   * Unique identifier for the object.
   */
  id: z.string(),

  /**
   * String representing the object's type. Objects of the same type share the same value.
   */
  object: z.literal('product').default('product'),

  /**
   * Always true for a deleted object
   */
  deleted: z.literal(true),
});

const AggregateUsage = z.enum(['last_during_period', 'last_ever', 'max', 'sum']);

const Interval = z.enum(['day', 'month', 'week', 'year']);

const UsageType = z.enum(['licensed', 'metered']);

const Recurring = z.object({
  /**
   * Specifies a usage aggregation strategy for prices of `usage_type=metered`. Allowed values are
   * `sum` for summing up all usage during a period,
   * `last_during_period` for using the last usage record reported within a period,
   * `last_ever` for using the last usage record ever (across period bounds)
   * or `max` which uses the usage record with the maximum reported usage during a period.
   * Defaults to `sum`.
   */
  aggregate_usage: AggregateUsage.nullable().default('sum'),

  /**
   * The frequency at which a subscription is billed. One of `day`, `week`, `month` or `year`.
   */
  interval: Interval,

  /**
   * The number of intervals (specified in the `interval` attribute) between subscription billings.
   * For example, `interval=month` and `interval_count=3` bills every 3 months.
   */
  interval_count: z.number(),

  /**
   * Default number of trial days when subscribing a customer to this price using
   * [`trial_from_plan=true`](https://stripe.com/docs/api#create_subscription-trial_from_plan).
   */
  trial_period_days: z.number().nullable(),

  /**
   * Configures how the quantity per period should be determined. Can be either `metered` or `licensed`.
   * `licensed` automatically bills the `quantity` set when adding it to a subscription.
   * `metered` aggregates the total usage based on usage records.
   * Defaults to `licensed`.
   */
  usage_type: UsageType.default('licensed'),
});

const Tier = z.object({
  /**
   * Price for the entire tier.
   */
  flat_amount: z.number().nullable().default(null),

  /**
   * Same as `flat_amount`, but contains a decimal value with at most 12 decimal places.
   */
  flat_amount_decimal: z.string().nullable().default(null),

  /**
   * Per unit price for units relevant to the tier.
   */
  unit_amount: z.number().nullable().default(null),

  /**
   * Same as `unit_amount`, but contains a decimal value with at most 12 decimal places.
   */
  unit_amount_decimal: z.string().nullable().default(null),

  /**
   * Up to and including to this quantity will be contained in the tier.
   */
  up_to: z.number().nullable().default(null),
});

const TransformQuantity = z.object({
  /**
   * Divide usage by this number.
   */
  divide_by: z.number(),

  /**
   * After division, either round the result `up` or `down`.
   */
  round: z.enum(['down', 'up']),
});

export const Price = z.object({
  /**
   * Unique identifier for the object.
   */
  id: z.string().optional(),

  /**
   * Has the value `true` if the object exists in live mode or the value `false` if the object exists in test mode.
   */
  livemode: z.boolean().optional(),

  /**
   * Time at which the object was created. Measured in seconds since the Unix epoch.
   */
  created: z.number().optional(),

  /**
   * Each element represents a pricing tier. This parameter requires `billing_scheme` to be set to `tiered`.
   * See also the documentation for `billing_scheme`.
   */
  tiers: z.array(Tier).optional(),

  deleted: z.void(),
  /**
   * String representing the object's type. Objects of the same type share the same value.
   */
  object: z.literal('price').default('price'),

  /**
   * Whether the price can be used for new purchases.
   */
  active: z.boolean(),

  /**
   * Describes how to compute the price per period. Either `per_unit` or `tiered`. `per_unit` indicates
   * that the fixed amount (specified in `unit_amount` or `unit_amount_decimal`) will be charged
   *    - per unit in `quantity` (for prices with `usage_type=licensed`),
   *    - or per unit of total usage (for prices with `usage_type=metered`).
   * `tiered` indicates that the unit pricing will be computed using a tiering strategy as defined using
   * the `tiers` and `tiers_mode` attributes.
   */
  billing_scheme: z.enum(['per_unit', 'tiered']).default('per_unit'),

  /**
   * Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase.
   * Must be a [supported currency](https://stripe.com/docs/currencies).
   */
  currency: z.string(),

  /**
   * A lookup key used to retrieve prices dynamically from a static string. This may be up to 200 characters.
   */
  lookup_key: z.string().max(200).nullable().optional(),

  /**
   * Set of [key-value pairs](https://stripe.com/docs/api/metadata) that you can attach to an object.
   * This can be useful for storing additional information about the object in a structured format.
   */
  metadata: z.record(z.string(), z.string().nullish()),

  /**
   * A brief description of the price, hidden from customers.
   */
  nickname: z.string().nullable().optional(),

  /**
   * The ID of the product this price is associated with.
   */
  product: z.union([z.string(), Artwork, Product, DeletedProduct]),

  /**
   * The recurring components of a price such as `interval` and `usage_type`.
   */
  recurring: Recurring.nullable().optional(),

  /**
   * Specifies whether the price is considered inclusive of taxes or exclusive of taxes.
   * One of `inclusive`, `exclusive`, or `unspecified`. Once specified as either `inclusive` or
   * `exclusive`, it cannot be changed.
   */
  tax_behavior: z.enum(['exclusive', 'inclusive', 'unspecified']).nullable().optional(),
  /**
   * Defines if the tiering price should be `graduated` or `volume` based. In `volume`-based tiering,
   * the maximum quantity within a period determines the per unit price. In `graduated` tiering,
   * pricing can change as the quantity grows.
   */
  tiers_mode: z.enum(['graduated', 'volume']).nullable().optional(),

  /**
   * Apply a transformation to the reported usage or set quantity before computing the amount billed.
   * Cannot be combined with `tiers`.
   */
  transform_quantity: TransformQuantity.nullable().optional(),

  /**
   * One of `one_time` or `recurring` depending on whether the price is for a one-time purchase or
   * a recurring (subscription) purchase.
   */
  type: z.enum(['one_time', 'recurring']),

  /**
   * The unit amount in %s to be charged, represented as a whole integer if possible.
   * Only set if`billing_scheme=per_unit`.
   */
  unit_amount: z.number().nullable(),

  /**
   * The unit amount in %s to be charged, represented as a decimal string with at most 12 decimal places.
   * Only set if `billing_scheme=per_unit`.
   */
  unit_amount_decimal: z
    .string()
    .regex(/\d+\.\d{12,}/)
    .nullable()
    .optional(),
});

export type Price = z.infer<typeof Price>;

export const DeletedPrice = z.object({
  /**
   * Unique identifier for the object.
   */
  id: z.string(),

  /**
   * String representing the object's type. Objects of the same type share the same value.
   */
  object: z.literal('price').default('price'),

  /**
   * Always true for a deleted object
   */
  deleted: z.literal(true),
});

export const SingleCartItem = Price.merge(
  z.object({
    product: Artwork,
  })
);

export type SingleCartItem = z.infer<typeof SingleCartItem>;

export const QuantifiedCartItem = SingleCartItem.merge(z.object({ quantity: z.number().min(1) }));

export type QuantifiedCartItem = z.infer<typeof QuantifiedCartItem>;

export type CartContextType = {
  cart: QuantifiedCartItem[];
  addToCart: Dispatch<SingleCartItem>;
  removeFromCart: Dispatch<SingleCartItem>;
  clearCart: Dispatch<void>;
};

const Diff = <T extends z.ZodTypeAny>(type: T): z.ZodObject<{ current: T; actual: T }> =>
  z.object({
    current: type,
    actual: type,
  });

export const DirtyState = z
  .object({
    title: Diff(z.string()),
    description: Diff(z.string()),
    active: Diff(z.boolean()),
    displayPosition: Diff(z.number()),
    tags: Diff(z.string().array()),
    prices: Diff(Price.array()),
    image: Diff(z.instanceof(URL)),
  })
  .partial();

export type DirtyState = z.infer<typeof DirtyState>;
