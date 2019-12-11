/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

import client from 'emailjs/smtp/client';
import shortid from 'shortid';

class AsyncClient extends client.Client {
  async deliver(messagePromise) {
    return email.send(
      await messagePromise,
      (err, message) => {
        if (err) throw (err);
        return message;
      }
    );
  }
}

export const email = new AsyncClient({
  user: process.env.EMAIL_SYS_ADDR,
  password: process.env.EMAIL_SYS_PW,
  host: process.env.EMAIL_SYS_HOST,
  port: 587,
  tls: true
});


export const withContext = (
  {
    headline,
    delivery_reason,
    mailing_address = "1103 Cashato Dr, Revelstoke, B.C., Canada",
    instagram_permalink = "https://www.instagram.com/zuzi11_/",
    facebook_permalink = ""
  },
  order={},
  post={},
  user={}
) => {

  const id = shortid.generate()
  const permalink = `email-${id}-${order._id || post._id || user._id || shortid.generate()}.html`;

  return {
    message: {
      headline,
      permalink,
      delivery_reason,
      mailing_address,
      instagram_permalink,
      facebook_permalink
    },
    order: { ...(order.toObject ? order.toObject() : order) },
    post:  { ...(post.toObject  ? post.toObject()  : post)  },
    user:  { ...(user.toObject  ? user.toObject()  : user)  },
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
      }
    }
  }
}
