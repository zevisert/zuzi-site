declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
      NEXT_PUBLIC_HOSTNAME: string;

      CDN_SPACENAME: string;
      CDN_REGION: string;
      CDN_HOST: string;
      CDN_DIR: string;
      CDN_ACCESSKEY: string;
      CDN_SECRET_ACCESSKEY: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SIGNING_KEY: string;
    }
  }
}

function throwIfNot<T, K extends keyof T>(obj: Partial<T>, prop: K, msg?: string): T[K] {
  if (obj[prop] === undefined || obj[prop] === null) {
    throw new Error(msg || `Environment is missing variable ${prop}`);
  } else {
    return obj[prop] as T[K];
  }
}

// Validate that we have our expected ENV variables defined!
[
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_HOSTNAME',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SIGNING_KEY',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL_INTERNAL',
  'CDN_SPACENAME',
  'CDN_REGION',
  'CDN_HOST',
  'CDN_DIR',
  'CDN_ACCESSKEY',
  'CDN_SECRET_ACCESSKEY',
].forEach((v) => {
  throwIfNot(process.env, v);
});

export {};
