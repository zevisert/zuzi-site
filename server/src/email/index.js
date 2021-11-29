/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import { SMTPClient } from "emailjs";
import shortid from "shortid";

class AsyncEmailClient extends SMTPClient {
  async deliver(messagePromise) {
    return email.send(await messagePromise, (err, message) => {
      if (err) throw err;
      return message;
    });
  }
}

export const email = new AsyncEmailClient({
  user: process.env.EMAIL_SYS_ADDR,
  password: process.env.EMAIL_SYS_PW,
  host: process.env.EMAIL_SYS_HOST,
  port: +process.env.EMAIL_SYS_PORT,
  tls: process.env.EMAIL_SYS_USE_TLS,
});

export const withContext = (
  {
    headline,
    delivery_reason,
    mailing_address = "1103 Cashato Dr, Revelstoke, B.C., Canada",
    instagram_permalink = "https://www.instagram.com/zuzi11_/",
  },
  order = {},
  post = {},
  user = {}
) => {
  const id = shortid.generate();
  const permalink = `email-${id}-${
    order._id || post._id || user._id || shortid.generate()
  }.html`;

  return {
    message: {
      headline,
      permalink,
      delivery_reason,
      mailing_address,
      instagram_permalink,
    },
    order: { ...(order.toObject ? order.toObject() : order) },
    post: { ...(post.toObject ? post.toObject() : post) },
    user: { ...(user.toObject ? user.toObject() : user) },
    process: {
      env: {
        EMAIL_SYS_ADDR: process.env.EMAIL_SYS_ADDR,
        SITE_ADMIN_EMAIL: process.env.SITE_ADMIN_EMAIL,
        ORDERS_EMAIL: process.env.ORDERS_EMAIL,
        SUBSCRIBERS_EMAIL: process.env.SUBSCRIBERS_EMAIL,
        SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
        ETRANSFER_EMAIL: process.env.ETRANSFER_EMAIL,
        ETRANSFER_PW: process.env.ETRANSFER_PW,
        SITE_URL: process.env.SITE_URL,
        API_URL: process.env.API_URL,
      },
    },
  };
};
