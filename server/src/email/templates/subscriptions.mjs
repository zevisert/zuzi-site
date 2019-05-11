/**
* @license
* Copyright (c) Zev Isert, All rights reserved
*/

export const notifySubscribersPosting = (post, user) => {

    const text =
`
A new piece of artwork has been posted in Zuzana's Gallery!

View it here: ${process.env.SITE_URL}/gallery/${post.slug}

You can unsubscribe using this link: ${process.env.SITE_URL}/api/v1/unsubscribe/${user._id}

If anything is wrong with the above, please forward this email to ${process.env.SUPPORT_EMAIL}.
Note: Do not reply directly to this email as the mailbox is automated and isn't monitored!
`;

    return {
        text:    text,
        from:    process.env.SUBSCRIBERS_EMAIL,
        to:      user.email,
        subject: "New artwork on zuzanariha.art"
    }
}
