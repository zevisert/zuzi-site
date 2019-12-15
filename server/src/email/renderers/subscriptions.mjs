
/**
 * @license
 * Copyright (c) Zev Isert, All rights reserved
 */
import { MailingTopics } from '../../models/mailing.model'
import { render, plaintext } from "../render.mjs"

/**
 * Email subscribers about new artwork
 * @param context email rendering context
 */
export const notifySubscribersPosting = async context => {
    const topic = MailingTopics.subscribers.newartwork;

    return {
        text:    await plaintext(topic.template, context),
        from:    context.process.env.SUBSCRIBERS_EMAIL,
        to:      context.user.email,
        subject: topic.subject,
        attachment: [{
            data: `${await render(topic.template, context)}`,
            alternative: true
        }]
    }
}
