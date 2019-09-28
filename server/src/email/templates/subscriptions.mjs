
/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */

import { notifySubscribersPlaintext } from "../plaintext/subscribers.mjs"
import { render } from "../render.mjs"


/**
 * Email subscribers about new artwork
 * @param context email rendering context
 */
export const notifySubscribersPosting = context => {
    return {
        html:    render('subscribers/new-artwork.mjml.njk', context),
        text:    notifySubscribersPlaintext(context),
        from:    context.process.env.SUBSCRIBERS_EMAIL,
        to:      context.user.email,
        subject: "New artwork on zuzanariha.art"
    }
}
