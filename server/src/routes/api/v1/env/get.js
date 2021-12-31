export async function get(ctx) {
  ctx.body = {
    env: {
      STRIPE_PK: process.env.STRIPE_PK,
      SENTRY_DSN: process.env.SENTRY_DSN,
      SENTRY_ENABLE: process.env.SENTRY_ENABLE === "true",
      PUSH_PUBKEY: process.env.PUSH_PUBKEY,
    },
  };
}
