import webpush from 'web-push';

import { User } from '../user.model';
import { Post } from '../post.model';
import { Subscription } from '../subscription.model';
import { email } from '../../email';

import { notifySubscribersPosting } from '../../email/templates/subscriptions'

webpush.setVapidDetails(
    `mailto:${process.env.SUPPORT_EMAIL}`,
    process.env.PUSH_PUBKEY,
    process.env.PUSH_SECRET
);

export async function pre_save() {
    const existing = await Post.findById(this._id);

    const conditions = Object.values({
        newPost: existing === null,
        publishedPost: existing !== null && existing.active === false && this.active === true
    });

    const requirements = Object.values({
        isActive: this.active === true
    });

    if (conditions.some(cond => cond === true) && requirements.every(req => req === true)) {

        // Send emails
        const users = await User.find({ subscriber: true });
        for (const user of users) {
            email.deliver(notifySubscribersPosting(this, user))
            .catch(error => {
                console.log(`Email to ${user.email} failed to deliver`)
                console.warn(error)
            });
        }

        // Send push notifications
        const subscriptions = await Subscription.find({})
        for (const subscription of subscriptions) {

            webpush.sendNotification(subscription, JSON.stringify({
                title: "New artwork from Zuzana",
                body: "A new piece was just posted on Zuzana's gallery",
                url: `${process.env.SITE_URL}/gallery/${this.slug}`
            }))
            .catch(() => {
                // Remove the subscription
                console.log(`Subscription ${subscription._id} failed to send, deleting`);
                entry.delete();
            });
        }
    }
}
