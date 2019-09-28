
import dedent from "dedent"

/**
 * Subscription email new artwork
 * @param context email rendering context
 */
export const notifySubscribersPlaintext = context => dedent`
    A new piece of artwork has been posted in Zuzana's Gallery!

    View it here: ${context.process.env.SITE_URL}/gallery/${context.post.slug}

    You can unsubscribe using this link: ${context.process.env.SITE_URL}/api/v1/unsubscribe/${user._id}

    If anything is wrong with the above, please forward this email to ${context.process.env.SUPPORT_EMAIL}.
    Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
    `;
