import client from 'emailjs/smtp/client';
import message from 'emailjs/smtp/message';

export const email = new client.Client({
  user: process.env.EMAIL_SYS_ADDR,
  password: process.env.EMAIL_SYS_PW,
  host: process.env.EMAIL_SYS_HOST,
  port: 587,
  tls: true
});

email.deliver = function (params = message.Message) {
  return new Promise((resolve, reject) => {
    email.send(params, (err, message) => {
      if (err) reject(err);
      else resolve(message);
    });
  });
}